import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { clampListLimit, parseLimitQuery } from "@/lib/http/clamp-list-limit";

describe("clampListLimit", () => {
  it("rejects NaN and uses default", () => {
    assert.equal(clampListLimit(Number.NaN, 50, 100), 50);
    assert.equal(clampListLimit(undefined, 50, 100), 50);
  });

  it("caps at max", () => {
    assert.equal(clampListLimit(500, 50, 100), 100);
  });
});

describe("parseLimitQuery", () => {
  it("handles invalid query strings", () => {
    assert.equal(parseLimitQuery("abc", 50, 100), 50);
    assert.equal(parseLimitQuery(null, 100, 200), 100);
  });
});
