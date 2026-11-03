/**
 * Beyond AI plan/credit transition rules (pure, no database access).
 *
 * Free-plan activation previously reset `creditRemainingUsd` to the plan
 * allowance on *every* call, so repeatedly posting to the checkout route
 * re-filled the monthly credit and pushed `currentPeriodEnd` forward forever.
 * These helpers decide when a reset is legitimate.
 */

export type FreePlanCreditDecision =
  | {
      refresh: true;
      reason:
        "new_subscription" | "plan_changed" | "period_elapsed" | "not_active";
    }
  | { refresh: false; reason: "same_period_active" };

export function decideFreePlanCreditRefresh(input: {
  existingPlanId: string | null;
  existingStatus: string | null;
  existingPeriodEnd: Date | null;
  targetPlanId: string;
  now: Date;
}): FreePlanCreditDecision {
  if (!input.existingPlanId) {
    return { refresh: true, reason: "new_subscription" };
  }
  if (input.existingPlanId !== input.targetPlanId) {
    return { refresh: true, reason: "plan_changed" };
  }
  if (input.existingStatus !== "active") {
    return { refresh: true, reason: "not_active" };
  }
  if (
    !input.existingPeriodEnd ||
    input.existingPeriodEnd.getTime() <= input.now.getTime()
  ) {
    return { refresh: true, reason: "period_elapsed" };
  }
  return { refresh: false, reason: "same_period_active" };
}

/** Next monthly period boundary; kept in one place so retries cannot drift it. */
export function nextMonthlyPeriodEnd(now: Date = new Date()): Date {
  const end = new Date(now.getTime());
  end.setMonth(end.getMonth() + 1);
  return end;
}
