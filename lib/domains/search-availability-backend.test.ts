import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";

import {
  DOMAIN_PAGE_SEARCH_CONTEXT,
  getSearchAvailabilityBackend,
  isNameSiloSearchEnabledInEnv,
  resolveSearchRouteAvailabilityBackend,
  runWithSearchAvailabilityBackend,
} from "@/lib/domains/search-availability-backend";

describe("search availability backend routing", () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env = { ...env };
  });

  afterEach(() => {
    process.env = env;
  });

  it("defaults to DNA outside request scope", () => {
    assert.equal(getSearchAvailabilityBackend(), "dna");
  });

  it("uses namesilo for all search routes when env is enabled", () => {
    process.env.DOMAIN_PUBLIC_SEARCH_AVAILABILITY_PROVIDER = "namesilo";
    process.env.NAMESILO_API_KEY = "test-key";
    assert.equal(
      resolveSearchRouteAvailabilityBackend(DOMAIN_PAGE_SEARCH_CONTEXT),
      "namesilo",
    );
    assert.equal(resolveSearchRouteAvailabilityBackend(undefined), "namesilo");
    assert.equal(
      resolveSearchRouteAvailabilityBackend("hosting-cart"),
      "namesilo",
    );
  });

  it("falls back to DNA when flag is off", () => {
    process.env.NAMESILO_API_KEY = "test-key";
    delete process.env.DOMAIN_PUBLIC_SEARCH_AVAILABILITY_PROVIDER;
    assert.equal(
      resolveSearchRouteAvailabilityBackend(DOMAIN_PAGE_SEARCH_CONTEXT),
      "dna",
    );
    assert.equal(isNameSiloSearchEnabledInEnv(), false);
  });

  it("scopes async context to the chosen backend", () => {
    runWithSearchAvailabilityBackend("namesilo", () => {
      assert.equal(getSearchAvailabilityBackend(), "namesilo");
    });
    assert.equal(getSearchAvailabilityBackend(), "dna");
  });
});
