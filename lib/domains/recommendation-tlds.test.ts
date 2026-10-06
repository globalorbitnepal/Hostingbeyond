import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
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
    assert.ok(recommendationTierIndex(".com") < recommendationTierIndex(".in"));
    assert.ok(
      recommendationTierIndex(".net") < recommendationTierIndex(".fun"),
    );
    assert.ok(recommendationTierIndex(".pk") < 99);
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
