import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createDomainNameApiProvider,
  mapAvailabilityStatusForTests,
  mapHttpErrorForTests,
} from "@/lib/domains/providers/domain-name-api";
import type { DomainNameApiConfig } from "@/lib/domains/providers/domain-name-api-config";
import { mapRowToCustomerResult } from "@/lib/domains/retail-pricing";
import type { ProviderAvailabilityRow } from "@/lib/domains/providers/types";

const testConfig: DomainNameApiConfig = {
  baseUrl: "https://ote.domainresellerapi.com/api/v1",
  resellerId: "00000000-0000-0000-0000-000000000001",
  apiKey: "test-key-redacted",
  environment: "test",
};

describe("Domain Name API provider", () => {
  it("maps available domain from bulk-search", async () => {
    const mockFetch: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          infos: [
            {
              domainName: "world123x0.com",
              tld: "com",
              status: "available",
              price: 10.81,
              currency: "USD",
              isPremium: false,
            },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );

    const provider = createDomainNameApiProvider(testConfig, mockFetch);
    const rows = await provider.checkAvailability(["world123x0.com"]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.status, "available");
    assert.equal(rows[0]?.supplier.register, 10.81);
    assert.equal(rows[0]?.supplier.currency, "USD");
  });

  it("maps unavailable domain", async () => {
    const mockFetch: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          infos: [
            {
              domainName: "google.com",
              tld: "com",
              status: "notavailable",
              reason: "Domain exists",
            },
          ],
        }),
        { status: 200 },
      );

    const provider = createDomainNameApiProvider(testConfig, mockFetch);
    const rows = await provider.checkAvailability(["google.com"]);
    assert.equal(rows[0]?.status, "taken");
  });

  it("maps premium flag", () => {
    assert.equal(mapAvailabilityStatusForTests("available", true), "premium");
  });

  it("maps provider timeout to error code", async () => {
    const mockFetch: typeof fetch = async (_url, init) => {
      init?.signal?.dispatchEvent(new Event("abort"));
      const err = new Error("Aborted");
      err.name = "AbortError";
      throw err;
    };

    const provider = createDomainNameApiProvider(testConfig, mockFetch);
    await assert.rejects(
      () => provider.checkAvailability(["test.com"]),
      (error: unknown) => error instanceof Error && error.message === "timeout",
    );
  });

  it("maps HTTP API error", () => {
    const err = mapHttpErrorForTests(500, { message: "Internal error" });
    assert.equal(err.code, "provider_failure");
    const balance = mapHttpErrorForTests(402, {
      message: "Insufficient reseller balance",
    });
    assert.equal(balance.code, "insufficient_balance");
    const missing = mapHttpErrorForTests(404, {
      error: {
        code: "Dna.DomainService:Domain:10007",
        message: "not be found",
      },
    });
    assert.equal(missing.code, "domain_not_found");
  });

  it("registerDomain returns failed on HTTP error without throwing", async () => {
    const mockFetch: typeof fetch = async () =>
      new Response(JSON.stringify({ message: "Insufficient balance" }), {
        status: 402,
      });

    const provider = createDomainNameApiProvider(testConfig, mockFetch);
    const result = await provider.registerDomain({
      domain: "fail-test-xyz.com",
      periodYears: 1,
      contacts: {},
      nameservers: ["ns1.example.com"],
    });
    assert.equal(result.outcome, "failed");
    assert.equal(result.errorCode, "insufficient_balance");
  });

  it("registerDomain returns unknown on timeout", async () => {
    const mockFetch: typeof fetch = async (_url, init) => {
      init?.signal?.dispatchEvent(new Event("abort"));
      const err = new Error("Aborted");
      err.name = "AbortError";
      throw err;
    };

    const provider = createDomainNameApiProvider(testConfig, mockFetch);
    const result = await provider.registerDomain({
      domain: "timeout-test.com",
      periodYears: 1,
      contacts: {},
      nameservers: ["ns1.example.com"],
    });
    assert.equal(result.outcome, "unknown");
    assert.equal(result.errorCode, "timeout");
  });
});

describe("Retail pricing mapping", () => {
  it("uses catalogue retail prices instead of supplier cost", () => {
    const row: ProviderAvailabilityRow = {
      domain: "world123x0.com",
      name: "world123x0",
      tld: ".com",
      status: "available",
      supplier: {
        register: 10.81,
        renew: null,
        transfer: null,
        currency: "USD",
      },
    };
    const result = mapRowToCustomerResult(row);
    assert.ok(result);
    assert.equal(result.register, 9.99);
    assert.equal(result.renew, 17.99);
    assert.equal(result.transfer, 12.99);
    assert.notEqual(result.register, 10.81);
  });

  it("marks unsupported retail TLD as invalid", () => {
    const row: ProviderAvailabilityRow = {
      domain: "brand.example",
      name: "brand",
      tld: ".example",
      status: "available",
      supplier: {
        register: 1,
        renew: null,
        transfer: null,
        currency: "USD",
      },
    };
    const result = mapRowToCustomerResult(row);
    assert.equal(result?.status, "invalid");
  });
});

describe("Invalid domain normalization", () => {
  it("rejects empty label before provider call", async () => {
    const { normalizeDomainSearchInput } =
      await import("@/lib/domains/normalize");
    const parsed = normalizeDomainSearchInput("   ");
    assert.equal(parsed.ok, false);
    if (!parsed.ok) {
      assert.match(parsed.error, /enter a domain/i);
    }
  });
});
