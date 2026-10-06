import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { validateDomainsForBulkCart } from "@/lib/domains/bulk-cart";
import { readIdempotencyKey } from "@/lib/domains/require-customer";

describe("Bulk cart validation", () => {
  it("rejects empty selection", async () => {
    const { items, rejected } = await validateDomainsForBulkCart([]);
    assert.equal(items.length, 0);
    assert.equal(rejected.length, 0);
  });

  it("deduplicates domain inputs", async () => {
    const { items } = await validateDomainsForBulkCart([
      "same.com",
      "same.com",
      "other.com",
    ]);
    assert.ok(items.length <= 2);
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
