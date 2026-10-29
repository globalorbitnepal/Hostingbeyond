import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { annualSaveBadgeLabel } from "@/lib/hosting/annual-save-badge";

describe("annualSaveBadgeLabel", () => {
  it("returns the badge only for annual billing", () => {
    assert.equal(annualSaveBadgeLabel("monthly", "Save 70%"), null);
    assert.equal(annualSaveBadgeLabel("annually", "Save 70%"), "Save 70%");
    assert.equal(annualSaveBadgeLabel("annually", "  "), null);
    assert.equal(annualSaveBadgeLabel("monthly", undefined), null);
  });
});
