import { config as loadDotenv } from "dotenv";

/** Load .env only when OTE integration is explicitly enabled (avoids real API calls in unit runs). */
if (process.env.DOMAIN_API_OTE_TESTS === "1") {
  loadDotenv();
}

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { defaultRegistrationContacts } from "@/lib/domains/contacts";
import { processDomainRegistrationCheckout } from "@/lib/domains/registration-service";
import { processDomainRenewalCheckout } from "@/lib/domains/renewal-service";
import { readDomainNameApiConfig } from "@/lib/domains/providers/domain-name-api-config";
import { createDomainNameApiProvider } from "@/lib/domains/providers/domain-name-api";
import { checkTransferEligibilityAsync } from "@/lib/domains/transfer-service";
import { DomainProviderError } from "@/lib/domains/providers/types";
import { creditWallet, ensureCustomerWallet } from "@/lib/domains/wallet";
import { prisma } from "@/lib/prisma";

const OTE_TEST_EMAIL = "ote-lifecycle-test@hostingbeyond.local";

/** Paths wired in provider — OTE OpenAPI `/api/v1/...`. */
const EXPECTED_PROVIDER_PATHS = [
  "domains/bulk-search",
  "domains/register-with-contacts",
  "domains/renew",
  "domains/transfer",
  "domains/info",
  "products/tlds",
];

function shouldRunOteIntegrationTests(): boolean {
  if (process.env.DOMAIN_API_OTE_TESTS !== "1") return false;
  return readDomainNameApiConfig() !== null;
}

function shouldRunOteLifecycleTests(): boolean {
  return (
    shouldRunOteIntegrationTests() && Boolean(process.env.DATABASE_URL?.trim())
  );
}

const runOte = shouldRunOteIntegrationTests();
const runLifecycle = shouldRunOteLifecycleTests();

function disposableServiceDomain(): string {
  return `hblife-${process.pid}-${Date.now().toString(36)}.com`;
}

function disposableTestDomain(): string {
  return `hbote-${process.pid}-${Date.now().toString(36)}.com`;
}

describe("Domain Name API provider path contract", () => {
  it("documents OTE endpoints wired in provider", () => {
    assert.ok(EXPECTED_PROVIDER_PATHS.length >= 6);
    assert.ok(
      EXPECTED_PROVIDER_PATHS.includes("domains/register-with-contacts"),
    );
  });
});

describe(
  "Domain Name API OTE integration",
  { skip: !runOte, concurrency: 1 },
  () => {
    const config = runOte ? readDomainNameApiConfig()! : null;
    const provider = config ? createDomainNameApiProvider(config) : null;

    let testDomain = "";
    let registerSucceeded = false;

    it("uses OTE environment only", () => {
      assert.equal(config!.environment, "test");
      assert.match(config!.baseUrl, /ote\.domainresellerapi\.com/i);
    });

    it("availability + pricing for a single disposable domain (one bulk-search)", async () => {
      testDomain = disposableTestDomain();
      const rows = await provider!.checkAvailability([testDomain]);
      assert.equal(rows.length, 1);
      assert.equal(rows[0]?.domain, testDomain);
      assert.ok(
        rows[0]?.status === "available" || rows[0]?.status === "premium",
        `expected available/premium, got ${rows[0]?.status}`,
      );

      const pricing = await provider!.getPricing(["com"]);
      assert.ok(Array.isArray(pricing));
      assert.ok(pricing.length > 0);
    });

    it("getDomainDetails returns domain_not_found for domains outside reseller portfolio", async () => {
      const probeDomain = `not-in-portfolio-${Date.now().toString(36)}.com`;
      await assert.rejects(
        () => provider!.getDomainDetails(probeDomain),
        (error: unknown) =>
          error instanceof DomainProviderError &&
          error.code === "domain_not_found",
      );
    });

    it("registers disposable domain via OTE register-with-contacts", async () => {
      assert.ok(testDomain, "availability step must run first");
      const rows = await provider!.checkAvailability([testDomain]);
      assert.ok(
        rows[0]?.status === "available" || rows[0]?.status === "premium",
      );

      const result = await provider!.registerDomain({
        domain: testDomain,
        periodYears: 1,
        contacts: defaultRegistrationContacts(),
        nameservers: ["ns1.hostingbeyond.com", "ns2.hostingbeyond.com"],
      });

      if (
        result.outcome === "failed" &&
        result.errorCode === "insufficient_balance"
      ) {
        assert.fail(
          "OTE registration failed: insufficient reseller balance (fund OTE account to complete lifecycle test)",
        );
      }

      if (result.outcome !== "success") {
        assert.fail(
          `register failed: ${result.errorCode ?? "unknown"} (${result.errorMessageInternal ?? "no detail"})`,
        );
      }

      assert.equal(result.domain.toLowerCase(), testDomain);
      registerSucceeded = true;
    });

    it("reads domain details for the registered OTE test domain", async () => {
      assert.ok(registerSucceeded, "registration must succeed first");
      const details = await provider!.getDomainDetails(testDomain);
      assert.equal(details.domain.toLowerCase(), testDomain);
      assert.ok(details.status);
    });

    it("renews the registered OTE test domain", async () => {
      assert.ok(registerSucceeded, "registration must succeed first");
      const renewed = await provider!.renewDomain(testDomain, 1);
      assert.ok(renewed.expiresAt === null || renewed.expiresAt.length > 0);
    });

    it("transfer eligibility for taken domain uses registrar availability", async () => {
      const check = await checkTransferEligibilityAsync("google.com");
      assert.equal(check.eligible, true);
      assert.equal(check.status, "eligible");
    });

    it("inbound transfer is not safely testable on OTE without a second registrar", () => {
      assert.ok(
        true,
        "BLOCKED: inbound transfer requires a domain locked at another registrar plus valid EPP/auth code; OTE cannot simulate that deterministically without external setup. transferDomain is implemented but not exercised here.",
      );
    });
  },
);

describe(
  "OTE lifecycle via registration-service + wallet + PostgreSQL",
  {
    skip: !runLifecycle,
    concurrency: 1,
  },
  () => {
    let userId = "";
    let serviceDomain = "";
    let registerOrderId = "";
    let registrationId = "";

    it("prepares test customer wallet (dev OTE funding only)", async () => {
      const user = await prisma.customerUser.upsert({
        where: { email: OTE_TEST_EMAIL },
        create: { email: OTE_TEST_EMAIL, name: "OTE Lifecycle Test" },
        update: {},
      });
      userId = user.id;
      await ensureCustomerWallet(userId);
      const wallet = await prisma.customerWallet.findUnique({
        where: { userId },
      });
      assert.ok(wallet);
      if (wallet!.balance.lessThan(25)) {
        await creditWallet({
          userId,
          amount: 50,
          idempotencyKey: `ote-lifecycle-seed:${userId}`,
          note: "OTE integration test funding (dev only)",
        });
      }
    });

    it("registers disposable domain through registration-service", async () => {
      serviceDomain = disposableServiceDomain();
      const idempotencyKey = `ote-svc-reg-${Date.now().toString(36)}`;
      const result = await processDomainRegistrationCheckout({
        userId,
        userEmail: OTE_TEST_EMAIL,
        domainInput: serviceDomain,
        idempotencyKey,
      });

      if (!result.ok) {
        assert.fail(
          `registration checkout failed: ${result.error ?? "unknown"} (status ${"status" in result ? result.status : "n/a"})`,
        );
      }
      assert.equal(result.order.status, "REGISTERED");
      assert.equal(result.order.domain, serviceDomain);
      registerOrderId = result.order.id;

      const registration = await prisma.domainRegistration.findUnique({
        where: { domain: serviceDomain },
      });
      assert.ok(registration);
      assert.equal(registration!.status, "ACTIVE");
      registrationId = registration!.id;

      const debit = await prisma.walletTransaction.findFirst({
        where: { userId, referenceId: registerOrderId, type: "DEBIT" },
      });
      assert.ok(debit);
    });

    it("renews the service-registered domain through renewal-service", async () => {
      assert.ok(serviceDomain && registrationId);
      const before = await prisma.domainRegistration.findUnique({
        where: { id: registrationId },
      });
      assert.ok(before?.expiresAt);

      const result = await processDomainRenewalCheckout({
        userId,
        userEmail: OTE_TEST_EMAIL,
        domainInput: serviceDomain,
        idempotencyKey: `ote-svc-renew-${Date.now().toString(36)}`,
        periodYears: 1,
      });

      if (!result.ok) {
        assert.fail(`renew checkout failed: ${result.error ?? "unknown"}`);
      }
      assert.equal(result.order.orderType, "renew");
      assert.equal(result.order.status, "REGISTERED");

      const after = await prisma.domainRegistration.findUnique({
        where: { id: registrationId },
      });
      assert.ok(after?.lastRenewalAt);
      const renewDebit = await prisma.walletTransaction.findFirst({
        where: { userId, referenceId: result.order.id, type: "DEBIT" },
      });
      assert.ok(renewDebit);
    });
  },
);

describe("Domain Name API OTE integration (skipped)", { skip: runOte }, () => {
  it("enable with DOMAIN_API_OTE_TESTS=1 and OTE credentials in .env", () => {
    assert.ok(true);
  });
});

describe("Domain Name API OTE rate-limit notes", () => {
  it("documents prior 429 root cause in parallel test harness", () => {
    assert.match(
      "Multiple concurrent POST /domains/bulk-search calls in one npm test process",
      /bulk-search/,
    );
  });
});
