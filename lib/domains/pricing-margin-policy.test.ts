import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ceilToRetail99,
  minRetailForMargin,
  recommendRetailPrice,
} from "@/lib/domains/pricing-margin-policy";

describe("pricing margin policy", () => {
  it("computes .com registration at 15% margin", () => {
    const min = minRetailForMargin(11.05, 15);
    assert.ok(min > 12.99);
    const rec = recommendRetailPrice(11.05, 15);
    assert.equal(rec.ok, true);
    if (rec.ok) {
      assert.equal(rec.recommended, 13.99);
      assert.ok(rec.grossMarginPercent >= 15);
    }
  });

  it("ceilToRetail99 never below minimum", () => {
    assert.equal(ceilToRetail99(12.94), 12.99);
    assert.equal(ceilToRetail99(12.99), 12.99);
    assert.equal(ceilToRetail99(13.0), 13.99);
  });
});
