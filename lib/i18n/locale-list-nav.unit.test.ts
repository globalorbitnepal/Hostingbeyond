import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  indexAfterQueryChange,
  isListMoveKey,
  nextActiveIndex,
} from "@/lib/i18n/locale-list-nav";

describe("locale list keyboard navigation", () => {
  it("wraps down and up through the list", () => {
    assert.equal(nextActiveIndex("ArrowDown", 0, 3), 1);
    assert.equal(nextActiveIndex("ArrowDown", 2, 3), 0);
    assert.equal(nextActiveIndex("ArrowUp", 0, 3), 2);
    assert.equal(nextActiveIndex("ArrowUp", 1, 3), 0);
  });

  it("jumps to the boundaries with Home and End", () => {
    assert.equal(nextActiveIndex("Home", 2, 5), 0);
    assert.equal(nextActiveIndex("End", 0, 5), 4);
  });

  it("isolates the single-result case", () => {
    assert.equal(nextActiveIndex("ArrowDown", 0, 1), 0);
    assert.equal(nextActiveIndex("ArrowUp", 0, 1), 0);
  });

  it("is a no-op for an empty result set", () => {
    for (const key of ["ArrowDown", "ArrowUp", "Home", "End"]) {
      assert.equal(nextActiveIndex(key, 0, 0), null);
    }
  });

  it("ignores keys that are not list moves (Enter must not move)", () => {
    assert.equal(nextActiveIndex("Enter", 1, 3), null);
    assert.equal(nextActiveIndex("Tab", 1, 3), null);
    assert.equal(nextActiveIndex("a", 1, 3), null);
  });

  it("classifies move keys", () => {
    assert.equal(isListMoveKey("ArrowDown"), true);
    assert.equal(isListMoveKey("End"), true);
    assert.equal(isListMoveKey("Escape"), false);
  });

  it("keeps the cursor in range after the query narrows results", () => {
    assert.equal(indexAfterQueryChange(50, 2, 40), 0);
    assert.equal(indexAfterQueryChange(2, 0, 1), 0);
    assert.equal(indexAfterQueryChange(0, 5, 0), 0);
  });

  it("retains the cursor when the result set is unchanged", () => {
    assert.equal(indexAfterQueryChange(5, 5, 3), 3);
  });
});
