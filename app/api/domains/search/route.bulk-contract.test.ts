import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { POST } from "@/app/api/domains/search/route";
import { MAX_BULK_DOMAIN_SEARCH } from "@/lib/domains/bulk-search-limit";

function postSearch(body: unknown) {
  return POST(
    new Request("http://localhost/api/domains/search", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/domains/search bulk contract", () => {
  it("returns 400 when body is missing query and bulk", async () => {
    const res = await postSearch({});
    assert.equal(res.status, 400);
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await POST(
      new Request("http://localhost/api/domains/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{not-json",
      }),
    );
    assert.equal(res.status, 400);
  });

  it("rejects 11 unique domains with bulk_limit_exceeded before search runs", async () => {
    const bulk = Array.from({ length: 11 }, (_, i) => `limit${i}.example`).join(
      "\n",
    );
    const res = await postSearch({ bulk });
    assert.equal(res.status, 400);
    const json = (await res.json()) as { code?: string; limit?: number };
    assert.equal(json.code, "bulk_limit_exceeded");
    assert.equal(json.limit, MAX_BULK_DOMAIN_SEARCH);
  });

  it("accepts 10 unique domains at application limit (may fail later on provider)", async () => {
    const bulk = Array.from({ length: 10 }, (_, i) => `ok${i}.example`).join(
      "\n",
    );
    const res = await postSearch({ bulk });
    assert.notEqual(res.status, 400);
    const json = (await res.json()) as { code?: string };
    assert.notEqual(json.code, "bulk_limit_exceeded");
  });

  it("does not treat 11 entries as 10 when duplicates reduce uniqueness", async () => {
    const lines = Array.from({ length: 10 }, (_, i) => `dup${i}.example`);
    lines.push(lines[0]!, lines[0]!.toUpperCase(), "extra.example");
    const res = await postSearch({ bulk: lines.join("\n") });
    assert.equal(res.status, 400);
    const json = (await res.json()) as { code?: string };
    assert.equal(json.code, "bulk_limit_exceeded");
  });

  it("allows 10 unique with duplicate lines", async () => {
    const base = Array.from({ length: 10 }, (_, i) => `u${i}.example`);
    const bulk = [...base, base[0]!, base[0]!.toUpperCase()].join("\n");
    const res = await postSearch({ bulk });
    const json = (await res.json()) as { code?: string };
    assert.notEqual(json.code, "bulk_limit_exceeded");
  });
});
