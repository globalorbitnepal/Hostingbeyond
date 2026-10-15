import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  classifyBulkLine,
  invalidBulkResult,
  parseBulkInputDeduped,
} from "@/lib/domains/bulk-search";

describe("bulk-search parsing", () => {
  it("dedupes domains preserving order", () => {
    const lines = parseBulkInputDeduped("a.com\nA.COM\nb.io", 50);
    assert.deepEqual(lines, ["a.com", "b.io"]);
  });

  it("marks invalid syntax without blocking valid lines", () => {
    const bad = classifyBulkLine("-bad.com");
    assert.equal(bad.kind, "invalid");
    const good = classifyBulkLine("valid-name.io");
    assert.equal(good.kind, "lookup");
    if (good.kind === "lookup") {
      assert.equal(good.fqdn, "valid-name.io");
    }
  });

  it("defaults bare label to .com for lookup", () => {
    const line = classifyBulkLine("mybrand");
    assert.equal(line.kind, "lookup");
    if (line.kind === "lookup") assert.equal(line.fqdn, "mybrand.com");
  });

  it("invalidBulkResult uses invalid status", () => {
    const line = classifyBulkLine("!!");
    assert.equal(line.kind, "invalid");
    if (line.kind === "invalid") {
      const row = invalidBulkResult(line);
      assert.equal(row.status, "invalid");
      assert.ok(row.message);
    }
  });
});
