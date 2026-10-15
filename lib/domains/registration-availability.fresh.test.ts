import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { DomainResult } from "@/lib/domains/availability";
import {
  clearSearchCacheForTests,
  getCachedSearch,
  searchCacheKey,
  setCachedSearch,
  withSearchDedup,
} from "@/lib/domains/availability-cache";
import {
  REGISTRATION_LIVE_LOOKUP_OPTIONS,
  validateRegistrationAvailability,
} from "@/lib/domains/registration-availability";

function sampleRow(status: DomainResult["status"]): DomainResult {
  return {
    domain: "checkout-fresh.example",
    name: "checkout-fresh",
    tld: ".example",
    status,
    register: status === "available" ? 9.99 : null,
    renew: null,
    transfer: null,
  };
}

describe("validateRegistrationAvailability", () => {
  it("accepts available and priced premium", () => {
    assert.equal(
      validateRegistrationAvailability(sampleRow("available")).status,
      "available",
    );
    assert.equal(
      validateRegistrationAvailability({
        ...sampleRow("premium"),
        register: 100,
      }).status,
      "premium",
    );
  });

  it("rejects taken, unknown, and invalid", () => {
    for (const status of ["taken", "unknown", "invalid"] as const) {
      assert.throws(
        () => validateRegistrationAvailability(sampleRow(status)),
        /domain_unavailable/,
      );
    }
    assert.throws(
      () => validateRegistrationAvailability(undefined),
      /domain_unavailable/,
    );
  });
});

describe("registration checkout live lookup options", () => {
  it("documents fresh provider revalidation for LIVE checkout", () => {
    assert.equal(REGISTRATION_LIVE_LOOKUP_OPTIONS.fresh, true);
  });

  it("fresh lookup bypasses TTL cache (checkout revalidation path)", async () => {
    clearSearchCacheForTests();
    const fqdn = "checkout-cache-bypass.test";
    const key = searchCacheKey([fqdn]);
    setCachedSearch(key, {
      results: [
        {
          domain: fqdn,
          name: "checkout-cache-bypass",
          tld: ".test",
          status: "available",
          register: 1,
          renew: null,
          transfer: null,
        },
      ],
      source: "registrar",
    });

    let runs = 0;
    const payload = await withSearchDedup(
      key,
      async () => {
        runs += 1;
        return {
          results: [
            {
              domain: fqdn,
              name: "checkout-cache-bypass",
              tld: ".test",
              status: "taken" as const,
              register: null,
              renew: null,
              transfer: null,
            },
          ],
          source: "registrar" as const,
        };
      },
      REGISTRATION_LIVE_LOOKUP_OPTIONS,
    );
    assert.equal(runs, 1);
    assert.equal(payload.results[0]?.status, "taken");
    assert.equal(getCachedSearch(key)?.results[0]?.status, "available");
  });
});
