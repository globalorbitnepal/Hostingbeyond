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

  it("retries 502/503 once before giving up", () => {
    assert.equal(shouldRetryBulkSearchResponse(503, 0, 2).retry, true);
    assert.equal(shouldRetryBulkSearchResponse(503, 1, 2).retry, false);
    assert.equal(shouldRetryBulkSearchResponse(400, 0, 2).retry, false);
  });
});
