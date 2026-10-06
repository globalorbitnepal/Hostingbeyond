import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  clearSearchCacheForTests,
  getCachedSearch,
  searchCacheKey,
  setCachedSearch,
  withSearchDedup,
} from "@/lib/domains/availability-cache";

describe("availability search cache", () => {
  it("dedupes concurrent identical searches", async () => {
    clearSearchCacheForTests();
    let runs = 0;
    const payload = {
      results: [
        {
          domain: "a.com",
          name: "a",
          tld: ".com",
          status: "available" as const,
          register: 9.99,
          renew: 17.99,
          transfer: 12.99,
        },
      ],
      source: "registrar" as const,
    };
    const key = searchCacheKey(["a.com"]);
    const [a, b] = await Promise.all([
      withSearchDedup(key, async () => {
        runs += 1;
        return payload;
      }),
      withSearchDedup(key, async () => {
        runs += 1;
        return payload;
      }),
    ]);
    assert.equal(runs, 1);
    assert.equal(a.results[0]?.domain, b.results[0]?.domain);
    assert.ok(getCachedSearch(key));
  });

  it("stores and reads short-lived cache", () => {
    clearSearchCacheForTests();
    const key = "example.com";
    setCachedSearch(key, {
      results: [],
      source: "registrar",
    });
    assert.ok(getCachedSearch(key));
  });
});
