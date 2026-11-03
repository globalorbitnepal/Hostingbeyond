/**
 * Beyond AI checkout request parsing (pure, safe to unit test).
 *
 * `getPlanConfig` falls back to the Pro plan for unknown ids, so a typo would
 * otherwise silently subscribe the customer to a plan they did not pick. The
 * route must validate the id explicitly before pricing or activation.
 */

import {
  beyondAiPlansConfig,
  type BeyondAiPlanId,
} from "@/config/beyond-ai-product";

export type BeyondAiBillingInterval = "monthly" | "yearly";

export function parseBeyondAiPlanId(raw: unknown): BeyondAiPlanId | null {
  if (typeof raw !== "string") return null;
  const id = raw.trim();
  return beyondAiPlansConfig.some((plan) => plan.id === id)
    ? (id as BeyondAiPlanId)
    : null;
}

export function parseBeyondAiBillingInterval(
  raw: unknown,
): BeyondAiBillingInterval | null {
  if (raw === undefined || raw === null) return "monthly";
  return raw === "monthly" || raw === "yearly" ? raw : null;
}

export function paidBeyondAiPlanIds(): BeyondAiPlanId[] {
  return beyondAiPlansConfig
    .filter((plan) => plan.priceMonthly > 0)
    .map((plan) => plan.id);
}
