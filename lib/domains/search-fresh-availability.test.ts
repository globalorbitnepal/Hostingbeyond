import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  clearSearchCacheForTests,
  getCachedSearch,
  searchCacheKey,
  setCachedSearch,
  withSearchDedup,
} from "@/lib/domains/availability-cache";

describe("search availability dedup", () => {
  it("fresh option skips TTL cache but still dedupes in-flight", async () => {
    clearSearchCacheForTests();
    const key = searchCacheKey(["example.com"]);
    setCachedSearch(key, {
      results: [
        {
          domain: "example.com",
          name: "example",
          tld: ".com",
          status: "available",
          register: 1,
          renew: 2,
          transfer: 3,
        },
      ],
      source: "registrar",
    });
    assert.ok(getCachedSearch(key));

    const namesiloKey = searchCacheKey(["example.com"], "namesilo");
    assert.equal(getCachedSearch(namesiloKey), null);

    let runs = 0;
    const payload = await withSearchDedup(
      key,
      async () => {
        runs += 1;
        return {
          results: [
            {
              domain: "example.com",
              name: "example",
              tld: ".com",
              status: "taken",
              register: null,
              renew: null,
              transfer: null,
            },
          ],
          source: "registrar" as const,
        };
      },
      { fresh: true },
    );
    assert.equal(runs, 1);
    assert.equal(payload.results[0]?.status, "taken");
    assert.equal(getCachedSearch(key)?.results[0]?.status, "available");
  });
});
