import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  FAIR_USE_NOTE,
  normalizePlanFeatureLine,
  normalizePlanFeatures,
  planNeedsFairUseNote,
} from "./plan-claims";

describe("normalizePlanFeatureLine", () => {
  it("qualifies unlimited website claims", () => {
    const line = normalizePlanFeatureLine("Unlimited Websites");
    assert.match(line, /fair use/i);
    assert.doesNotMatch(line, /^Unlimited Websites$/);
  });

  it("qualifies unmetered bandwidth", () => {
    assert.match(normalizePlanFeatureLine("Unmetered Bandwidth"), /fair use/i);
  });

  it("removes unsupported multiplier claims", () => {
    const line = normalizePlanFeatureLine("Advanced Performance (5× Faster)");
    assert.equal(line, "Advanced performance tuning");
    assert.doesNotMatch(line, /faster/i);
  });

  it("leaves accurate lines untouched", () => {
    assert.equal(
      normalizePlanFeatureLine("40 GB NVMe SSD Storage"),
      "40 GB NVMe SSD Storage",
    );
    assert.equal(
      normalizePlanFeatureLine("Free SSL Certificate"),
      "Free SSL Certificate",
    );
  });

  it("drops blank lines", () => {
    assert.equal(normalizePlanFeatureLine("   "), "");
  });
});

describe("normalizePlanFeatures", () => {
  it("removes duplicates and blanks", () => {
    const out = normalizePlanFeatures([
      "Free SSL",
      "  ",
      "free ssl",
      "Unlimited Websites",
    ]);
    assert.equal(out.length, 2);
    assert.equal(out[0], "Free SSL");
    assert.match(out[1], /fair use/i);
  });
});

describe("planNeedsFairUseNote", () => {
  it("is true when any line is unlimited", () => {
    assert.equal(
      planNeedsFairUseNote({ features: ["Unlimited Websites (fair use)"] }),
      true,
    );
  });

  it("is false for finite plans", () => {
    assert.equal(planNeedsFairUseNote({ features: ["1 Website"] }), false);
  });
});

describe("FAIR_USE_NOTE", () => {
  it("explains the limits rather than promising infinite resources", () => {
    assert.match(FAIR_USE_NOTE, /CPU, RAM, inodes/);
    assert.doesNotMatch(FAIR_USE_NOTE, /unlimited resources/i);
  });
});
