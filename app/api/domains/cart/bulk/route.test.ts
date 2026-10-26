import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { POST } from "@/app/api/domains/cart/bulk/route";

function postBulkCart(domains: string[], extra?: Record<string, unknown>) {
  return POST(
    new Request("http://localhost/api/domains/cart/bulk", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ domains, ...extra }),
    }),
  );
}

describe("POST /api/domains/cart/bulk", () => {
  it("returns 400 when domains array is empty", async () => {
    const res = await postBulkCart([]);
    assert.equal(res.status, 400);
  });

  it("rejects client-submitted pricing fields", async () => {
    const res = await postBulkCart(["a.com"], { register: 1, total: 2 });
    assert.equal(res.status, 400);
  });

  it("rejects 11 unique domains without truncation", async () => {
    const domains = Array.from({ length: 11 }, (_, i) => `c${i}.example`);
    const res = await postBulkCart(domains);
    assert.equal(res.status, 400);
    const json = (await res.json()) as { code?: string };
    assert.equal(json.code, "bulk_limit_exceeded");
  });

  it("accepts 10 unique domains at validation layer", async () => {
    const domains = Array.from({ length: 10 }, (_, i) => `v${i}.example`);
    const res = await postBulkCart(domains);
    assert.notEqual(res.status, 400);
    const json = (await res.json()) as { code?: string; items?: unknown[] };
    assert.notEqual(json.code, "bulk_limit_exceeded");
    assert.ok(Array.isArray(json.items));
  });
});
