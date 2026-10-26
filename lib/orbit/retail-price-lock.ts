import type { RetailPriceFields } from "@/lib/orbit/domain-pricing-update";

const RETAIL_KEYS: (keyof RetailPriceFields)[] = [
  "retailRegister",
  "retailRenew",
  "retailTransfer",
  "retailRestore",
  "retailRegisterByYear",
  "retailRenewByYear",
  "promoRegister",
  "promoEndsAt",
  "minMarginPercent",
  "premiumMarkupPercent",
];

export function retailPriceFieldsInUpdate(data: RetailPriceFields): boolean {
  return RETAIL_KEYS.some((key) => data[key] !== undefined);
}

export function assertRetailUpdateAllowed(
  row: { retailPriceLocked: boolean },
  updateData: RetailPriceFields,
  options?: { unlocking?: boolean },
): { ok: true } | { ok: false; code: "retail_price_locked" } {
  if (!row.retailPriceLocked) return { ok: true };
  if (options?.unlocking && updateData.retailPriceLocked === false) {
    return { ok: true };
  }
  if (retailPriceFieldsInUpdate(updateData)) {
    return { ok: false, code: "retail_price_locked" };
  }
  return { ok: true };
}
