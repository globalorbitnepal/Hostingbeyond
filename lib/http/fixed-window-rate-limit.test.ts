import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { consumeRateLimit } from "@/lib/http/fixed-window-rate-limit";

describe("fixed-window rate limit", () => {
  it("allows up to max requests per window", () => {
    const key = `test-${Date.now()}`;
    assert.equal(consumeRateLimit(key, 3, 60_000), true);
    assert.equal(consumeRateLimit(key, 3, 60_000), true);
    assert.equal(consumeRateLimit(key, 3, 60_000), true);
    assert.equal(consumeRateLimit(key, 3, 60_000), false);
  });
});
