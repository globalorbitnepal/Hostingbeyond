import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { DomainRegistrarProvider } from "@/lib/domains/providers/provider";
import { resolveProviderForTransferRecord } from "@/lib/domains/transfer-registrar";

describe("transfer checkout registrar persistence policy", () => {
  it("status polling uses persisted provider when TLD lifecycle would differ", () => {
    process.env.NAMESILO_API_KEY = "test-key";
    process.env.DOMAIN_API_RESELLER_ID = "test-reseller";
    process.env.DOMAIN_API_TEST_KEY = "test-key";
    const dnaOnly: DomainRegistrarProvider = {
      id: "domain-name-api",
      checkAvailability: async () => [],
      getPricing: async () => [],
      registerDomain: async () => ({
        outcome: "failed",
        domain: "x.com",
        expiresAt: null,
      }),
      renewDomain: async () => ({ expiresAt: null }),
      transferDomain: async () => ({ outcome: "failed", domain: "x.com" }),
      getDomainDetails: async () => ({
        domain: "x.com",
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

    const namesiloRouted = resolveProviderForTransferRecord({
      domain: "switch-test.com",
      tld: ".com",
      registrarProvider: "namesilo",
    });
    assert.equal(namesiloRouted.provider?.id, "namesilo");

    const wouldUseDna = resolveProviderForTransferRecord({
      domain: "switch-test.com",
      tld: ".com",
      registrarProvider: "domain-name-api",
    });
    assert.equal(wouldUseDna.provider?.id, "domain-name-api");
    assert.notEqual(wouldUseDna.provider?.id, namesiloRouted.provider?.id);
    assert.equal(dnaOnly.id, "domain-name-api");
  });
});
