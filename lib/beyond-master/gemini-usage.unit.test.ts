import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { GEMINI_FREE_TIER_PUBLISHED } from "@/lib/beyond-master/gemini-usage";

describe("gemini free-tier published ceilings", () => {
  it("documents Flash-Lite class free RPM, RPD, and TPM", () => {
    assert.equal(GEMINI_FREE_TIER_PUBLISHED.rpm, 15);
    assert.equal(GEMINI_FREE_TIER_PUBLISHED.rpd, 1_500);
    assert.equal(GEMINI_FREE_TIER_PUBLISHED.tpm, 250_000);
    assert.match(GEMINI_FREE_TIER_PUBLISHED.planName, /free/i);
  });
});
