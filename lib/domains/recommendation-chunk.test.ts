import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  FAST_CUSTOMER_TLD_ORDER,
  fastChunk1TldCount,
} from "@/lib/domains/recommendation-tlds";

describe("fast alternative chunk sizing", () => {
  it("defaults chunk 1 to seven TLDs (tunable via DOMAIN_FAST_CHUNK1_TLDS)", () => {
    assert.equal(fastChunk1TldCount(), 7);
    assert.ok(fastChunk1TldCount() <= 25);
  });

  it("orders .in, .org, .pro before .net in customer fast pool", () => {
    const inIdx = FAST_CUSTOMER_TLD_ORDER.indexOf(".in");
    const orgIdx = FAST_CUSTOMER_TLD_ORDER.indexOf(".org");
    const proIdx = FAST_CUSTOMER_TLD_ORDER.indexOf(".pro");
    const netIdx = FAST_CUSTOMER_TLD_ORDER.indexOf(".net");
    assert.ok(
      inIdx >= 0 && orgIdx > inIdx && proIdx > orgIdx && netIdx > proIdx,
    );
  });
});
