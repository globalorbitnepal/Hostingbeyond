import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  annualTotalFromMonthly,
  INTERNATIONAL_LAUNCH_CATALOG,
  SHARED_HOSTING_PLAN_KEYS,
} from "./international-launch-catalog";

describe("international launch catalog", () => {
  it("uses four shared plan names on every product", () => {
    for (const product of INTERNATIONAL_LAUNCH_CATALOG) {
      assert.deepEqual(
        product.plans.map((p) => p.planKey),
        [...SHARED_HOSTING_PLAN_KEYS],
      );
      assert.deepEqual(
        product.plans.map((p) => p.planName),
        ["Starter", "Growth", "Business", "Professional"],
      );
    }
  });

  it("applies a 10% annual prepaid discount", () => {
    assert.equal(annualTotalFromMonthly(3.99), 43.09);
    assert.equal(annualTotalFromMonthly(18.99), 205.09);
    assert.equal(annualTotalFromMonthly(32.99), 356.29);
    for (const product of INTERNATIONAL_LAUNCH_CATALOG) {
      for (const plan of product.plans) {
        assert.equal(
          plan.yearlyPrice,
          annualTotalFromMonthly(plan.monthlyPrice),
        );
      }
    }
  });
});
