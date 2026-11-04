import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  clientKeyFromRequest,
  consumeRateLimit,
  rateLimitBucketCount,
  rateLimitResponse,
} from "@/lib/http/fixed-window-rate-limit";

describe("fixed window rate limit", () => {
  it("resets after the window and keeps other keys separate", () => {
    const key = `reset-${Date.now()}`;
    assert.equal(consumeRateLimit(key, 1, -1), true);
    assert.equal(consumeRateLimit(key, 1, 60_000), true);
    assert.equal(consumeRateLimit(key, 1, 60_000), false);
    assert.equal(consumeRateLimit(`${key}-other`, 1, 60_000), true);
  });

  it("uses the proxy-supplied real IP and otherwise the last forwarded hop", () => {
    const withReal = new Request("https://hosting.example/api", {
      headers: {
        "x-real-ip": "203.0.113.8",
        "x-forwarded-for": "198.51.100.1, 203.0.113.9",
      },
    });
    assert.equal(clientKeyFromRequest(withReal), "203.0.113.8");
    const forwarded = new Request("https://hosting.example/api", {
      headers: { "x-forwarded-for": "198.51.100.1, 203.0.113.9" },
    });
    assert.equal(clientKeyFromRequest(forwarded), "203.0.113.9");
    assert.equal(
      clientKeyFromRequest(new Request("https://hosting.example/api")),
      "unknown",
    );
    assert.equal(rateLimitResponse().error.includes("Too many requests"), true);
  });

  it("drops expired buckets once the map is large", () => {
    const prefix = `sweep-${Date.now()}`;
    for (let index = 0; index < 1100; index += 1) {
      assert.equal(consumeRateLimit(`${prefix}-${index}`, 1, -1), true);
    }
    assert.equal(rateLimitBucketCount() < 100, true);
  });
});
