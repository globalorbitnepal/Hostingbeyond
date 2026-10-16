import "@/lib/test/integration-env-loader";

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Prisma } from "@prisma/client";

import type { DomainRegistrarProvider } from "@/lib/domains/providers/provider";
import { DomainProviderError } from "@/lib/domains/providers/types";
import {
  processDomainRenewalCheckout,
  type ProcessDomainRenewalCheckoutDeps,
} from "@/lib/domains/renewal-service";
import { creditWallet, ensureCustomerWallet } from "@/lib/domains/wallet";
import { prisma } from "@/lib/prisma";

const TEST_EMAIL = "renewal-checkout-test@example.test";

function integrationDb(): boolean {
  return (
    process.env.DATABASE_URL?.includes("hostingbeyond_integration_test") ??
    false
  );
}

function buildMockProvider(
  renewDomain: DomainRegistrarProvider["renewDomain"],
): DomainRegistrarProvider {
  return {
    id: "mock-renew",
    checkAvailability: async () => [],
    getPricing: async () => [],
    registerDomain: async () => ({
      outcome: "failed",
      domain: "x.test",
      expiresAt: null,
    }),
    renewDomain,
    transferDomain: async () => ({
      outcome: "failed",
      domain: "x.test",
    }),
    getDomainDetails: async () => ({
      domain: "x.test",
      status: "active",
      expiresAt: null,
      nameservers: [],
      transferLock: false,
    }),
    updateNameservers: async () => undefined,
    getAuthCode: async () => "x",
    lockDomain: async () => undefined,
    unlockDomain: async () => undefined,
    restoreDomain: async () => undefined,
    getDomainList: async () => [],
    getDomainStatus: async () => "active",
  };
}

function renewalDeps(
  provider: DomainRegistrarProvider,
): ProcessDomainRenewalCheckoutDeps {
  return {
    resolveDomainRegistrarProvider: () => provider,
  };
}

describe(
  "Renewal checkout (integration PostgreSQL)",
  { skip: !integrationDb(), concurrency: 1 },
  () => {
    let userId = "";
    let userEmail = "";

    it("prepares user, wallet, and active registration", async () => {
      const user = await prisma.customerUser.upsert({
        where: { email: TEST_EMAIL },
        create: { email: TEST_EMAIL, name: "Renewal Checkout Test" },
        update: {},
      });
      userId = user.id;
      userEmail = user.email;
      await ensureCustomerWallet(userId);
      await creditWallet({
        userId,
        amount: 500,
        idempotencyKey: `renewal-checkout-fund-${userId}`,
        note: "renewal checkout integration test",
      });
    });

    it("parallel renew checkouts with different idempotency keys yield one success and one 409", async () => {
      const domain = `renew-race-${Date.now()}.com`;
      await prisma.domainRegistration.create({
        data: {
          userId,
          domain,
          tld: ".com",
          status: "ACTIVE",
          expiresAt: new Date(Date.now() + 86400000 * 365),
        },
      });

      let providerCalls = 0;
      const provider = buildMockProvider(async () => {
        providerCalls += 1;
        await new Promise((r) => setTimeout(r, 50));
        return {
          expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        };
      });
      const deps = renewalDeps(provider);
      const base = Date.now();

      const [a, b] = await Promise.all([
        processDomainRenewalCheckout(
          {
            userId,
            userEmail,
            domainInput: domain,
            idempotencyKey: `renew-race-a-${base}`,
          },
          deps,
        ),
        processDomainRenewalCheckout(
          {
            userId,
            userEmail,
            domainInput: domain.toUpperCase(),
            idempotencyKey: `renew-race-b-${base}`,
          },
          deps,
        ),
      ]);

      assert.equal([a, b].filter((r) => r.ok).length, 1);
      const conflict = [a, b].filter((r) => !r.ok && r.status === 409);
      assert.equal(conflict.length, 1);
      assert.match(conflict[0]!.error!, /already in progress/i);
      assert.equal(providerCalls, 1);

      await prisma.domainOrder.deleteMany({ where: { userId, domain } });
      await prisma.domainRegistration.deleteMany({ where: { userId, domain } });
    });

    it("provider timeout keeps wallet reserve and sets reconciliation", async () => {
      const domain = `renew-timeout-${Date.now()}.com`;
      await prisma.domainRegistration.create({
        data: {
          userId,
          domain,
          tld: ".com",
          status: "ACTIVE",
          expiresAt: new Date(Date.now() + 86400000 * 365),
        },
      });

      let providerCalls = 0;
      const provider = buildMockProvider(async () => {
        providerCalls += 1;
        throw new DomainProviderError("timeout", "registry timeout");
      });
      const deps = renewalDeps(provider);
      const key = `renew-timeout-${Date.now()}`;

      const first = await processDomainRenewalCheckout(
        {
          userId,
          userEmail,
          domainInput: domain,
          idempotencyKey: key,
        },
        deps,
      );
      assert.equal(first.ok, true);
      if (first.ok) {
        assert.equal(first.reconciliation, true);
        assert.equal(first.order.status, "RECONCILIATION_REQUIRED");
      }
      assert.equal(providerCalls, 1);

      const retry = await processDomainRenewalCheckout(
        {
          userId,
          userEmail,
          domainInput: domain,
          idempotencyKey: key,
        },
        deps,
      );
      assert.equal(retry.ok, true);
      if (retry.ok && "duplicate" in retry) assert.equal(retry.duplicate, true);
      assert.equal(providerCalls, 1);

      const reserve = await prisma.walletTransaction.findUnique({
        where: { idempotencyKey: `renew:${key}` },
      });
      assert.ok(reserve);
      assert.equal(reserve.type, "RESERVE");

      await prisma.domainOrder.deleteMany({ where: { userId, domain } });
      await prisma.domainRegistration.deleteMany({ where: { userId, domain } });
    });

    it("maps P2002 on create to 409 conflict", async () => {
      const domain = `renew-p2002-${Date.now()}.com`;
      await prisma.domainRegistration.create({
        data: {
          userId,
          domain,
          tld: ".com",
          status: "ACTIVE",
          expiresAt: new Date(Date.now() + 86400000 * 365),
        },
      });

      const provider = buildMockProvider(async () => ({
        expiresAt: new Date().toISOString(),
      }));
      const deps: ProcessDomainRenewalCheckoutDeps = {
        ...renewalDeps(provider),
        createDomainOrder: (async () => {
          throw new Prisma.PrismaClientKnownRequestError(
            "Unique constraint failed",
            {
              code: "P2002",
              clientVersion: "test",
              meta: { target: ["userId", "lower(domain)"] },
            },
          );
        }) as unknown as ProcessDomainRenewalCheckoutDeps["createDomainOrder"],
      };

      const result = await processDomainRenewalCheckout(
        {
          userId,
          userEmail,
          domainInput: domain,
          idempotencyKey: `p2002-svc-${Date.now()}`,
        },
        deps,
      );

      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.equal(result.status, 409);
        assert.match(result.error, /already in progress/i);
      }

      await prisma.domainRegistration.deleteMany({ where: { userId, domain } });
    });
  },
);
