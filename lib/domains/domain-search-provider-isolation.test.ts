import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";

import { getNameSiloAvailabilityProvider } from "@/lib/domains/providers/namesilo-availability";
import { getDomainNameApiAvailabilityProvider } from "@/lib/domains/providers/domain-name-api";
import { resolveAvailabilityProvider } from "@/lib/domains/providers/index";
import { applyDnaAvailabilityTestEnv } from "@/lib/domains/test/dna-availability-test-env";
import {
  DOMAIN_PAGE_SEARCH_CONTEXT,
  resolveSearchRouteAvailabilityBackend,
  runWithSearchAvailabilityBackend,
  shouldUseNameSiloForCurrentSearch,
} from "@/lib/domains/search-availability-backend";

function resolveSearchAvailabilityProviderForTest() {
  if (shouldUseNameSiloForCurrentSearch()) {
    return getNameSiloAvailabilityProvider();
  }
  return getDomainNameApiAvailabilityProvider();
}

describe("domain search provider isolation", () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env = { ...env };
    applyDnaAvailabilityTestEnv(process.env);
  });

  afterEach(() => {
    process.env = env;
  });

  it("hosting cart style body (query only) uses NameSilo when env flag is on", () => {
    process.env.DOMAIN_PUBLIC_SEARCH_AVAILABILITY_PROVIDER = "namesilo";
    process.env.NAMESILO_API_KEY = "test-key";
    assert.equal(resolveSearchRouteAvailabilityBackend(undefined), "namesilo");
    runWithSearchAvailabilityBackend("namesilo", () => {
      assert.equal(shouldUseNameSiloForCurrentSearch(), true);
      const provider = resolveSearchAvailabilityProviderForTest();
      assert.ok(provider);
      assert.equal(provider.id, "namesilo");
    });
  });

  it("domain-page + namesilo env uses NameSilo provider inside request scope", () => {
    process.env.DOMAIN_PUBLIC_SEARCH_AVAILABILITY_PROVIDER = "namesilo";
    process.env.NAMESILO_API_KEY = "test-key";
    const backend = resolveSearchRouteAvailabilityBackend(
      DOMAIN_PAGE_SEARCH_CONTEXT,
    );
    assert.equal(backend, "namesilo");
    runWithSearchAvailabilityBackend(backend, () => {
      assert.equal(shouldUseNameSiloForCurrentSearch(), true);
      const provider = resolveSearchAvailabilityProviderForTest();
      assert.ok(provider);
      assert.equal(provider.id, "namesilo");
    });
  });

  it("search route stays on DNA when provider flag is dna", () => {
    process.env.DOMAIN_PUBLIC_SEARCH_AVAILABILITY_PROVIDER = "dna";
    process.env.NAMESILO_API_KEY = "test-key";
    assert.equal(
      resolveSearchRouteAvailabilityBackend(DOMAIN_PAGE_SEARCH_CONTEXT),
      "dna",
    );
    assert.equal(resolveSearchRouteAvailabilityBackend(undefined), "dna");
    runWithSearchAvailabilityBackend("dna", () => {
      const provider = resolveSearchAvailabilityProviderForTest();
      assert.ok(provider);
      assert.equal(provider.id, "domain-name-api");
    });
  });

  it("ALS namesilo without env flag does not select NameSilo provider", () => {
    delete process.env.DOMAIN_PUBLIC_SEARCH_AVAILABILITY_PROVIDER;
    process.env.NAMESILO_API_KEY = "test-key";
    runWithSearchAvailabilityBackend("namesilo", () => {
      assert.equal(shouldUseNameSiloForCurrentSearch(), false);
      const provider = resolveSearchAvailabilityProviderForTest();
      assert.ok(provider);
      assert.equal(provider.id, "domain-name-api");
    });
  });

  it("bulk search route backend follows the same env flag as single search", () => {
    process.env.DOMAIN_PUBLIC_SEARCH_AVAILABILITY_PROVIDER = "namesilo";
    process.env.NAMESILO_API_KEY = "test-key";
    assert.equal(resolveSearchRouteAvailabilityBackend(undefined), "namesilo");
  });

  it("lifecycle resolveAvailabilityProvider stays on DNA when search uses NameSilo", () => {
    process.env.DOMAIN_PUBLIC_SEARCH_AVAILABILITY_PROVIDER = "namesilo";
    process.env.NAMESILO_API_KEY = "test-key";
    runWithSearchAvailabilityBackend("namesilo", () => {
      const lifecycle = resolveAvailabilityProvider();
      assert.ok(lifecycle);
      assert.equal(lifecycle.id, "domain-name-api");
    });
  });
});
