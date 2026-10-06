import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  RECOMMENDATION_TLD_TIERS,
  buildRecommendationFqdns,
  recommendationTierIndex,
  sortByRecommendationPriority,
} from "@/lib/domains/recommendation-tlds";

describe("recommendation-tlds", () => {
  it("ranks tier-1 TLDs before tier-3", () => {
    assert.ok(sortByRecommendationPriority(".com", ".fun") < 0);
    assert.ok(sortByRecommendationPriority(".chat", ".net") > 0);
  });

  it("builds fqdns excluding anchor", () => {
    const pool = RECOMMENDATION_TLD_TIERS.flat();
    const names = buildRecommendationFqdns("beyondai", "beyondai.com", pool);
    assert.ok(!names.includes("beyondai.com"));
    assert.ok(names.includes("beyondai.chat"));
  });

  it("assigns unknown TLDs a high tier index", () => {
    assert.equal(recommendationTierIndex(".wtf"), 99);
  });
});
