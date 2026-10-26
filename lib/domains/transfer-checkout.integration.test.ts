import "@/lib/test/integration-env-loader";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, describe, it } from "node:test";

import { Prisma } from "@prisma/client";

import type { DomainResult } from "@/lib/domains/availability";
import {
  type ProcessDomainTransferCheckoutDeps,
  type RefreshTransferStatusDeps,
  processDomainTransferCheckout,
  refreshTransferStatus,
} from "@/lib/domains/transfer-checkout-service";
import { TRANSFER_INFLIGHT_UNIQUE_INDEX } from "@/lib/domains/transfer-inflight";
import type { DomainRegistrarProvider } from "@/lib/domains/providers/provider";
import type { ProviderAvailabilityRow } from "@/lib/domains/providers/types";
import { creditWallet, ensureCustomerWallet } from "@/lib/domains/wallet";
import { prisma } from "@/lib/prisma";
import { isIntegrationDatabaseConfigured } from "@/lib/test/integration-gate";

/** Gate in `processDomainTransferCheckout`; real registrar calls are mocked via deps. */
process.env.DOMAIN_API_RESELLER_ID ||= "integration-test";
process.env.DOMAIN_API_TEST_KEY ||= "integration-test-key";

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
    resolveTransferTargetRegistrar: async () => ({ provider }),
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
    id: "domain-name-api",
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

/** Mock quote transfer price — must match `mockCheckoutDeps` / `takenDomainResult`. */
const MOCK_TRANSFER_QUOTE_USD = 12.99;

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
    const suiteTag = `xfer-${Date.now()}-${randomUUID().slice(0, 8)}`;
    let userId = "";
    let userEmail = "";
    let providerCalls = 0;

    after(async () => {
      if (!userId) return;
      await prisma.domainTransferRecord.deleteMany({ where: { userId } });
      await prisma.walletTransaction.deleteMany({ where: { userId } });
      await prisma.customerWallet.deleteMany({ where: { userId } });
      await prisma.customerUser.delete({ where: { id: userId } });
    });

    it("prepares user and wallet", async () => {
      await ensureMigrationApplied();
      const email = `transfer-checkout-${suiteTag}@hostingbeyond.local`;
      const user = await prisma.customerUser.create({
        data: { email, name: "Transfer Checkout Test" },
      });
      userId = user.id;
      userEmail = user.email;
      await ensureCustomerWallet(userId);
      await creditWallet({
        userId,
        amount: 500,
        idempotencyKey: `transfer-checkout-fund-${userId}-${suiteTag}`,
        note: "transfer checkout concurrency test",
      });
      const wallet = await prisma.customerWallet.findUnique({
        where: { userId },
      });
      assert.ok(wallet);
      const minBalance = new Prisma.Decimal(MOCK_TRANSFER_QUOTE_USD).mul(2);
      assert.ok(
        wallet.balance.greaterThanOrEqualTo(minBalance),
        `wallet balance ${wallet.balance} below minimum ${minBalance} for parallel + timeout tests`,
      );
    });

    it("fails closed when per-domain transfer resolver returns no provider", async () => {
      const domain = `checkout-blocked-${Date.now()}.com`;
      const mockProvider = buildMockProvider(domain, async () => ({
        outcome: "success",
        domain,
        providerTransferId: "mock-transfer-order",
      }));
      const deps = {
        ...mockCheckoutDeps(domain, mockProvider),
        resolveTransferTargetRegistrar: async () => ({
          provider: null,
          blockReason: "namesilo_cost_unverified",
        }),
      };
      const result = await processDomainTransferCheckout(
        {
          userId,
          userEmail,
          domainInput: domain,
          authCode: "VALID-AUTH-CODE-1",
          idempotencyKey: `blocked-${Date.now()}`,
        },
        deps,
      );
      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.equal(result.status, 503);
      }
      await prisma.domainTransferRecord.deleteMany({
        where: { userId, domain },
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

    it("persists registrar at checkout and finalizes reserve on status poll completion", async () => {
      const domain = `checkout-poll-${Date.now()}.com`;
      const mockProvider = buildMockProvider(domain, async () => ({
        outcome: "unknown",
        domain,
        errorCode: "timeout",
      }));
      mockProvider.getDomainDetails = async () => ({
        domain,
        status: "active",
        expiresAt: null,
        nameservers: [],
        transferLock: false,
      });
      const deps = mockCheckoutDeps(domain, mockProvider);
      const key = `poll-finalize-${Date.now()}`;
      const started = await processDomainTransferCheckout(
        {
          userId,
          userEmail,
          domainInput: domain,
          authCode: "VALID-AUTH-CODE-4",
          idempotencyKey: key,
        },
        deps,
      );
      assert.equal(started.ok, true);
      if (!started.ok) return;
      assert.equal(started.reconciliation, true);
      const row = await prisma.domainTransferRecord.findUnique({
        where: { id: started.transfer.id },
      });
      assert.ok(row);
      assert.equal(row.registrarProvider, "domain-name-api");
      assert.ok(row.walletTransactionId);

      const reserveBefore = await prisma.walletTransaction.findUnique({
        where: { id: row.walletTransactionId! },
      });
      assert.equal(reserveBefore?.type, "RESERVE");

      const pollDeps: RefreshTransferStatusDeps = {
        resolveProviderForTransferRecord: () => ({
          provider: mockProvider,
        }),
      };
      const polled = await refreshTransferStatus(
        {
          userId,
          userEmail,
          publicId: row.publicId,
        },
        pollDeps,
      );
      assert.equal(polled.ok, true);
      if (!polled.ok) return;
      assert.equal(polled.transfer.status, "COMPLETED");

      const reserveAfter = await prisma.walletTransaction.findUnique({
        where: { id: row.walletTransactionId! },
      });
      assert.equal(reserveAfter?.type, "DEBIT");

      await prisma.domainRegistration.deleteMany({ where: { domain } });
      await prisma.domainTransferRecord.deleteMany({
        where: { userId, domain },
      });
    });
  },
);
