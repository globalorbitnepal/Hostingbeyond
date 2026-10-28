import { usdToLocalRate, type CurrencyCode } from "@/config/pricing";

export type DisplayCurrencyRateOverrides = Partial<
  Record<CurrencyCode, number>
>;

/** Units of local currency per 1 USD (defaults + Orbit overrides). */
export function resolveUsdToLocalRate(
  currency: CurrencyCode,
  overrides?: DisplayCurrencyRateOverrides,
): number {
  const custom = overrides?.[currency];
  if (custom != null && Number.isFinite(custom) && custom > 0) {
    return custom;
  }
  return usdToLocalRate[currency] ?? 1;
}

export function mergeDisplayRateOverrides(
  overrides?: DisplayCurrencyRateOverrides,
): Record<CurrencyCode, number> {
  return {
    ...usdToLocalRate,
    ...(overrides ?? {}),
  };
}
