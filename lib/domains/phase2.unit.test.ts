import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { validateDomainsForBulkCart } from "@/lib/domains/bulk-cart";
import { readIdempotencyKey } from "@/lib/domains/require-customer";

describe("Bulk cart validation", () => {
  it("rejects empty selection", async () => {
    const result = await validateDomainsForBulkCart([]);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.items.length, 0);
    assert.equal(result.rejected.length, 0);
  });

  it("rejects more than 10 unique domains", async () => {
    const domains = Array.from({ length: 11 }, (_, i) => `limit${i}.com`);
    const result = await validateDomainsForBulkCart(domains);
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.code, "bulk_limit_exceeded");
  });

  it("deduplicates domain inputs", async () => {
    const result = await validateDomainsForBulkCart([
      "same.com",
      "same.com",
      "other.com",
    ]);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok(result.items.length <= 2);
  });
});

describe("Idempotency key helper", () => {
  it("prefers Idempotency-Key header", () => {
    const request = new Request("https://example.com", {
      headers: { "idempotency-key": "abc-123" },
    });
    assert.equal(readIdempotencyKey(request), "abc-123");
  });

  it("falls back to body key", () => {
    const request = new Request("https://example.com");
    assert.equal(readIdempotencyKey(request, "body-key"), "body-key");
  });
});
