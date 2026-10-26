import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { computeRegisterMargin } from "@/lib/domains/supplier-retail-margin";

describe("supplier-retail-margin", () => {
  it("flags shortfall when retail is below supplier", () => {
    const row = computeRegisterMargin(".app", 23.99, 14.99);
    assert.equal(row.registerShortfallUsd, 9);
    assert.equal(row.registerMarginUsd, null);
  });

  it("computes positive margin", () => {
    const row = computeRegisterMargin(".in", 6.99, 19.99);
    assert.equal(row.registerMarginUsd, 13);
  });
});
