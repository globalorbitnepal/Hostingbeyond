import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { DomainRegistrarProvider } from "@/lib/domains/providers/provider";
import {
  registrarProviderIdFromProvider,
  resolveProviderForTransferRecord,
} from "@/lib/domains/transfer-registrar";

const dnaProvider: DomainRegistrarProvider = {
  id: "domain-name-api",
  checkAvailability: async () => [],
  getPricing: async () => [],
  registerDomain: async () => ({
    outcome: "failed",
    domain: "x.com",
    expiresAt: null,
  }),
  renewDomain: async () => ({ expiresAt: null }),
  transferDomain: async () => ({
    outcome: "failed",
    domain: "x.com",
  }),
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

describe("transfer registrar routing", () => {
  it("uses persisted registrarProvider and ignores TLD reconfiguration", async () => {
    const original = process.env.NAMESILO_API_KEY;
    process.env.NAMESILO_API_KEY = "test-key";
    const { getNameSiloLifecycleProvider } =
      await import("@/lib/domains/providers/namesilo-registrar");
    const ns = getNameSiloLifecycleProvider();
    assert.ok(ns);

    const result = resolveProviderForTransferRecord({
      domain: "example.com",
      tld: ".com",
      registrarProvider: "namesilo",
    });
    assert.equal(result.provider?.id, "namesilo");
    process.env.NAMESILO_API_KEY = original;
  });

  it("legacy null registrarProvider resolves DNA provider", async () => {
    process.env.DOMAIN_API_RESELLER_ID = "test-reseller";
    process.env.DOMAIN_API_TEST_KEY = "test-key";
    const result = resolveProviderForTransferRecord({
      domain: "legacy-example.com",
      tld: ".com",
      registrarProvider: null,
    });
    assert.ok(result.provider);
    assert.equal(result.provider?.id, "domain-name-api");
  });

  it("unknown persisted provider fails closed", async () => {
    const result = resolveProviderForTransferRecord({
      domain: "x.com",
      tld: ".com",
      registrarProvider: "other-registrar",
    });
    assert.equal(result.provider, null);
    assert.equal(result.blockReason, "unknown_registrar_provider");
  });

  it("maps provider id for persistence", () => {
    assert.equal(
      registrarProviderIdFromProvider(dnaProvider),
      "domain-name-api",
    );
  });
});
