import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  parseRetryAfterMs,
  shouldRetryBulkSearchResponse,
} from "@/lib/domains/client-search-retry";

describe("client-search-retry", () => {
  it("parses Retry-After seconds", () => {
    assert.equal(parseRetryAfterMs("2"), 2000);
    assert.equal(parseRetryAfterMs(""), null);
  });

  it("does not retry 429 more than once on bulk client", () => {
    const first = shouldRetryBulkSearchResponse(429, 0, 2);
    assert.equal(first.retry, true);
    const second = shouldRetryBulkSearchResponse(429, 1, 2);
    assert.equal(second.retry, false);
  });

  it("does not retry non-429", () => {
    assert.equal(shouldRetryBulkSearchResponse(502, 0, 4).retry, false);
  });
});
