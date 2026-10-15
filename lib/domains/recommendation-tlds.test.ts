import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  FAST_CUSTOMER_TLD_ORDER,
  PRIORITY_TLD_TIERS,
  buildRecommendationFqdns,
  recommendationTierIndex,
  sortByRecommendationPriority,
} from "@/lib/domains/recommendation-tlds";

describe("recommendation-tlds", () => {
  it("ranks tier-1 TLDs before tier-3", () => {
    assert.ok(sortByRecommendationPriority(".com", ".fun") < 0);
    assert.ok(sortByRecommendationPriority(".chat", ".net") > 0);
  });

  it("ranks main TLDs before country and long-tail", () => {
    assert.ok(recommendationTierIndex(".in") < recommendationTierIndex(".fun"));
    assert.ok(
      recommendationTierIndex(".net") < recommendationTierIndex(".fun"),
    );
    assert.ok(recommendationTierIndex(".pk") < 99);
  });

  it("prioritises .in, .org, .pro, .net in fast pool", () => {
    const inIdx = FAST_CUSTOMER_TLD_ORDER.indexOf(".in");
    const orgIdx = FAST_CUSTOMER_TLD_ORDER.indexOf(".org");
    const proIdx = FAST_CUSTOMER_TLD_ORDER.indexOf(".pro");
    const netIdx = FAST_CUSTOMER_TLD_ORDER.indexOf(".net");
    assert.ok(
      inIdx >= 0 && orgIdx > inIdx && proIdx > orgIdx && netIdx > proIdx,
    );
    const appIdx = FAST_CUSTOMER_TLD_ORDER.indexOf(".app");
    const aiIdx = FAST_CUSTOMER_TLD_ORDER.indexOf(".ai");
    assert.ok(appIdx > netIdx && aiIdx > appIdx);
  });

  it("builds fqdns excluding anchor", () => {
    const pool = PRIORITY_TLD_TIERS.flat();
    const names = buildRecommendationFqdns("beyondai", "beyondai.com", pool);
    assert.ok(!names.includes("beyondai.com"));
    assert.ok(names.includes("beyondai.chat"));
    assert.ok(names.includes("beyondai.in"));
  });

  it("assigns unknown TLDs a high tier index", () => {
    assert.equal(recommendationTierIndex(".wtf"), 99);
  });
});
