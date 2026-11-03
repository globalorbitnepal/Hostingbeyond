import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  decideFreePlanCreditRefresh,
  nextMonthlyPeriodEnd,
} from "@/lib/beyond-ai/plan-policy";

const now = new Date("2026-10-29T12:00:00.000Z");

describe("decideFreePlanCreditRefresh", () => {
  it("grants credit on first subscription", () => {
    const d = decideFreePlanCreditRefresh({
      existingPlanId: null,
      existingStatus: null,
      existingPeriodEnd: null,
      targetPlanId: "free",
      now,
    });
    assert.deepEqual(d, { refresh: true, reason: "new_subscription" });
  });

  it("does not re-fill consumed credit within the same active period", () => {
    const d = decideFreePlanCreditRefresh({
      existingPlanId: "free",
      existingStatus: "active",
      existingPeriodEnd: new Date("2026-11-29T12:00:00.000Z"),
      targetPlanId: "free",
      now,
    });
    assert.deepEqual(d, { refresh: false, reason: "same_period_active" });
  });

  it("refreshes when the stored period has elapsed", () => {
    const d = decideFreePlanCreditRefresh({
      existingPlanId: "free",
      existingStatus: "active",
      existingPeriodEnd: new Date("2026-10-01T00:00:00.000Z"),
      targetPlanId: "free",
      now,
    });
    assert.deepEqual(d, { refresh: true, reason: "period_elapsed" });
  });

  it("refreshes on plan change and on inactive status", () => {
    assert.equal(
      decideFreePlanCreditRefresh({
        existingPlanId: "pro",
        existingStatus: "active",
        existingPeriodEnd: new Date("2026-11-29T12:00:00.000Z"),
        targetPlanId: "free",
        now,
      }).reason,
      "plan_changed",
    );
    assert.equal(
      decideFreePlanCreditRefresh({
        existingPlanId: "free",
        existingStatus: "canceled",
        existingPeriodEnd: new Date("2026-11-29T12:00:00.000Z"),
        targetPlanId: "free",
        now,
      }).reason,
      "not_active",
    );
  });
});

describe("nextMonthlyPeriodEnd", () => {
  it("advances exactly one month", () => {
    assert.equal(
      nextMonthlyPeriodEnd(new Date("2026-10-29T12:00:00.000Z")).toISOString(),
      "2026-11-29T12:00:00.000Z",
    );
  });

  it("does not mutate the input date", () => {
    const input = new Date("2026-10-29T12:00:00.000Z");
    nextMonthlyPeriodEnd(input);
    assert.equal(input.toISOString(), "2026-10-29T12:00:00.000Z");
  });
});
