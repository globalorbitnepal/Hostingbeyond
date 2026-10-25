import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mapNameSiloBucketsToRows } from "@/lib/domains/providers/namesilo-availability";

describe("NameSilo availability adapter", () => {
  it("maps unavailable, invalid, available, and missing buckets", () => {
    const rows = mapNameSiloBucketsToRows(
      ["example.com", "bad.invalid", "free-test.com", "ghost.net"],
      {
        available: [{ domain: "free-test.com", isPremium: true }],
        unavailable: ["example.com"],
        invalid: ["bad.invalid"],
      },
    );
    const byDomain = new Map(rows.map((r) => [r.domain, r]));
    assert.equal(byDomain.get("example.com")?.status, "taken");
    assert.equal(byDomain.get("bad.invalid")?.status, "invalid");
    assert.equal(byDomain.get("free-test.com")?.status, "available");
    assert.equal(byDomain.get("free-test.com")?.supplier.register, null);
    assert.equal(byDomain.get("ghost.net")?.status, "unknown");
  });
});
