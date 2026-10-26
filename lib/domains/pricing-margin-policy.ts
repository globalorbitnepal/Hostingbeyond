/** Proposed margin targets (D2) — not production business rules until approved. */
export const PROPOSED_MARGIN_TARGETS = {
  registrationGrossPercent: 15,
  renewalGrossPercent: 15,
  transferGrossPercent: 10,
} as const;

export function minRetailForMargin(
  supplierCost: number,
  grossMarginPercent: number,
): number {
  if (!Number.isFinite(supplierCost) || supplierCost < 0) return NaN;
  if (grossMarginPercent >= 100) return NaN;
  return supplierCost / (1 - grossMarginPercent / 100);
}

/** Round up to a .99 price point without going below minRequired. */
export function ceilToRetail99(minRequired: number): number {
  if (!Number.isFinite(minRequired) || minRequired <= 0) return 0.99;
  const floor = Math.floor(minRequired);
  let candidate = floor + 0.99;
  if (candidate < minRequired) {
    candidate = floor + 1 + 0.99;
  }
  return Math.round(candidate * 100) / 100;
}

export function grossMarginPercent(
  retail: number,
  supplierCost: number,
): number | null {
  if (!Number.isFinite(retail) || retail <= 0) return null;
  if (!Number.isFinite(supplierCost)) return null;
  return ((retail - supplierCost) / retail) * 100;
}

export type RecommendedPriceResult =
  | {
      ok: true;
      recommended: number;
      minRequired: number;
      grossProfit: number;
      grossMarginPercent: number;
    }
  | {
      ok: false;
      reason: "invalid_cost" | "below_margin_after_rounding";
      minRequired?: number;
    };

export function recommendRetailPrice(
  supplierCost: number,
  targetGrossMarginPercent: number,
): RecommendedPriceResult {
  const minRequired = minRetailForMargin(
    supplierCost,
    targetGrossMarginPercent,
  );
  if (!Number.isFinite(minRequired)) {
    return { ok: false, reason: "invalid_cost" };
  }
  const recommended = ceilToRetail99(minRequired);
  const margin = grossMarginPercent(recommended, supplierCost);
  if (margin == null || margin + 0.0001 < targetGrossMarginPercent) {
    return {
      ok: false,
      reason: "below_margin_after_rounding",
      minRequired,
    };
  }
  return {
    ok: true,
    recommended,
    minRequired,
    grossProfit: recommended - supplierCost,
    grossMarginPercent: margin,
  };
}
