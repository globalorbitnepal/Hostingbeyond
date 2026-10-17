import "@/lib/test/integration-env-loader";

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { DomainResult } from "@/lib/domains/availability";
import {
  type ProcessDomainTransferCheckoutDeps,
  processDomainTransferCheckout,
} from "@/lib/domains/transfer-checkout-service";
import { TRANSFER_INFLIGHT_UNIQUE_INDEX } from "@/lib/domains/transfer-inflight";
import type { DomainRegistrarProvider } from "@/lib/domains/providers/provider";
import type { ProviderAvailabilityRow } from "@/lib/domains/providers/types";
import { creditWallet, ensureCustomerWallet } from "@/lib/domains/wallet";
import { prisma } from "@/lib/prisma";
import { isIntegrationDatabaseConfigured } from "@/lib/test/integration-gate";

function takenDomainResult(domain: string): DomainResult {
  const name = domain.split(".")[0] ?? "test";
  return {
    domain: domain.toLowerCase(),
    name,
    tld: ".com",
    status: "taken",
    register: null,
    renew: 14.99,
    transfer: 12.99,
    message: "",
  };
}

function mockCheckoutDeps(
  domain: string,
  provider: DomainRegistrarProvider,
): ProcessDomainTransferCheckoutDeps {
  return {
    resolveDomainRegistrarProvider: () => provider,
    searchDomainsWithProvider: async () => ({
      results: [takenDomainResult(domain)],
      source: "registrar",
    }),
    getTransferRetailQuote: async () => ({
      tld: ".com",
      transfer: 12.99,
      renew: 14.99,
      register: 12.99,
      restore: null,
      currency: "USD",
      purchasable: true,
      isPromo: false,
    }),
  };
}

function mockAvailabilityRow(domain: string): ProviderAvailabilityRow {
  const name = domain.split(".")[0] ?? "test";
  return {
    domain: domain.toLowerCase(),
    name,
    tld: ".com",
    status: "taken",
    supplier: {
      register: 1,
      renew: 1,
      transfer: 1,
      currency: "USD",
    },
  };
}

function buildMockProvider(
  domain: string,
  transferDomain: DomainRegistrarProvider["transferDomain"],
): DomainRegistrarProvider {
  return {
    id: "mock",
    checkAvailability: async () => [mockAvailabilityRow(domain)],
    getPricing: async () => [],
    registerDomain: async () => ({
      outcome: "failed",
      domain,
      expiresAt: null,
    }),
    renewDomain: async () => ({ expiresAt: null }),
    transferDomain,
    getDomainDetails: async () => ({
      domain,
      status: "pending",
      expiresAt: null,
      nameservers: [],
      transferLock: false,
    }),
    updateNameservers: async () => undefined,
    getAuthCode: async () => "redacted",
    lockDomain: async () => undefined,
    unlockDomain: async () => undefined,
    restoreDomain: async () => undefined,
    getDomainList: async () => [],
    getDomainStatus: async () => "pending",
  };
}

const TEST_EMAIL = "transfer-checkout-test@hostingbeyond.local";

async function ensureMigrationApplied() {
  const rows = await prisma.$queryRaw<{ indexname: string }[]>`
    SELECT indexname FROM pg_indexes
    WHERE indexname = ${TRANSFER_INFLIGHT_UNIQUE_INDEX}
  `;
  if (rows.length === 0) {
    throw new Error(
      `Missing index ${TRANSFER_INFLIGHT_UNIQUE_INDEX} — run prisma migrate deploy`,
    );
  }
}

describe(
  "Transfer checkout concurrency (database)",
  { skip: !isIntegrationDatabaseConfigured(), concurrency: 1 },
  () => {
    let userId = "";
    let userEmail = "";
    let providerCalls = 0;

    it("prepares user and wallet", async () => {
      await ensureMigrationApplied();
      const user = await prisma.customerUser.upsert({
        where: { email: TEST_EMAIL },
        create: { email: TEST_EMAIL, name: "Transfer Checkout Test" },
        update: {},
      });
      userId = user.id;
      userEmail = user.email;
      await ensureCustomerWallet(userId);
      await creditWallet({
        userId,
        amount: 500,
        idempotencyKey: `transfer-checkout-fund-${userId}`,
        note: "transfer checkout concurrency test",
      });
    });

    it("parallel requests with different idempotency keys create one provider submission", async () => {
      const domain = `checkout-race-${Date.now()}.com`;
      providerCalls = 0;
      const mockProvider = buildMockProvider(domain, async () => {
        providerCalls += 1;
        return {
          outcome: "success",
          domain,
          providerTransferId: "mock-transfer-order",
        };
      });
      const deps = mockCheckoutDeps(domain, mockProvider);

      const base = Date.now();
      const [a, b] = await Promise.all([
        processDomainTransferCheckout(
          {
            userId,
            userEmail,
            domainInput: domain,
            authCode: "VALID-AUTH-CODE-1",
            idempotencyKey: `race-a-${base}`,
          },
          deps,
        ),
        processDomainTransferCheckout(
          {
            userId,
            userEmail,
            domainInput: domain.toUpperCase(),
            authCode: "VALID-AUTH-CODE-2",
            idempotencyKey: `race-b-${base}`,
          },
          deps,
        ),
      ]);

      assert.equal([a, b].filter((r) => r.ok).length, 1);
      assert.equal([a, b].filter((r) => !r.ok && r.status === 409).length, 1);
      assert.equal(providerCalls, 1);

      const reserves = await prisma.walletTransaction.count({
        where: {
          userId,
          idempotencyKey: {
            in: [`transfer:race-a-${base}`, `transfer:race-b-${base}`],
          },
        },
      });
      assert.equal(reserves, 1);

      await prisma.domainTransferRecord.deleteMany({
        where: { userId, domain },
      });
    });

    it("provider timeout keeps reservation and does not call transfer twice on retry with same key", async () => {
      const domain = `checkout-timeout-${Date.now()}.com`;
      providerCalls = 0;
      const mockProvider = buildMockProvider(domain, async () => {
        providerCalls += 1;
        return { outcome: "unknown", domain, errorCode: "timeout" };
      });
      const deps = mockCheckoutDeps(domain, mockProvider);

      const key = `timeout-${Date.now()}`;
      const first = await processDomainTransferCheckout(
        {
          userId,
          userEmail,
          domainInput: domain,
          authCode: "VALID-AUTH-CODE-3",
          idempotencyKey: key,
        },
        deps,
      );
      assert.equal(first.ok, true);
      if (first.ok) assert.equal(first.reconciliation, true);
      assert.equal(providerCalls, 1);

      const retry = await processDomainTransferCheckout(
        {
          userId,
          userEmail,
          domainInput: domain,
          authCode: "VALID-AUTH-CODE-3",
          idempotencyKey: key,
        },
        deps,
      );
      assert.equal(retry.ok, true);
      if (retry.ok && "duplicate" in retry) assert.equal(retry.duplicate, true);
      assert.equal(providerCalls, 1);

      const reserve = await prisma.walletTransaction.findUnique({
        where: { idempotencyKey: `transfer:${key}` },
      });
      assert.ok(reserve);
      assert.equal(reserve.type, "RESERVE");

      await prisma.domainTransferRecord.deleteMany({
        where: { userId, domain },
      });
    });
  },
);
