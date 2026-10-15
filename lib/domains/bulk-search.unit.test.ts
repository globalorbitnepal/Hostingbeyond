import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  bulkInputExceedsLimit,
  countBulkUniqueDomains,
  parseBulkInputDeduped,
} from "@/lib/domains/bulk-input";
import {
  classifyBulkLine,
  invalidBulkResult,
  mergeBulkLookupResults,
  unknownBulkResult,
} from "@/lib/domains/bulk-search";
import type { DomainResult } from "@/lib/domains/availability";

describe("bulk-search parsing", () => {
  it("dedupes domains preserving order", () => {
    const lines = parseBulkInputDeduped("a.com\nA.COM\nb.io", 50);
    assert.deepEqual(lines, ["a.com", "b.io"]);
  });

  it("keeps later unique domains after many duplicates", () => {
    const dupes = Array.from({ length: 30 }, () => "repeat.com").join("\n");
    const lines = parseBulkInputDeduped(`${dupes}\nunique-later.io`, 50);
    assert.deepEqual(lines, ["repeat.com", "unique-later.io"]);
  });

  it("caps at 50 unique domains and detects overflow", () => {
    const many = Array.from({ length: 55 }, (_, i) => `site${i}.com`).join(
      "\n",
    );
    assert.equal(parseBulkInputDeduped(many, 50).length, 50);
    assert.equal(countBulkUniqueDomains(many), 55);
    assert.equal(bulkInputExceedsLimit(many, 50), true);
  });

  it("parses commas, semicolons and blank lines", () => {
    const lines = parseBulkInputDeduped("a.com, b.io;\nc.com\n\n", 50);
    assert.deepEqual(lines, ["a.com", "b.io", "c.com"]);
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

  it("mergeBulkLookupResults preserves line order and uses unknown for gaps", () => {
    const lines = [
      classifyBulkLine("first.com"),
      classifyBulkLine("-bad.com"),
      classifyBulkLine("third.io"),
    ];
    const lookedUp: DomainResult[] = [
      {
        domain: "third.io",
        name: "third",
        tld: ".io",
        status: "available",
        register: 12,
        renew: null,
        transfer: null,
      },
      {
        domain: "first.com",
        name: "first",
        tld: ".com",
        status: "taken",
        register: null,
        renew: 15,
        transfer: null,
      },
    ];
    const merged = mergeBulkLookupResults(lines, lookedUp);
    assert.equal(merged[0]?.domain, "first.com");
    assert.equal(merged[0]?.status, "taken");
    assert.equal(merged[1]?.status, "invalid");
    assert.equal(merged[2]?.domain, "third.io");
    assert.equal(merged[2]?.status, "available");
  });

  it("unknownBulkResult is unknown not taken", () => {
    const row = unknownBulkResult("missing.example");
    assert.equal(row.status, "unknown");
    assert.equal(row.register, null);
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
