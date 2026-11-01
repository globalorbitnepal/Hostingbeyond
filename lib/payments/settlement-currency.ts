/**
 * Settlement currency rules for the payment provider.
 *
 * Storefront prices are shown in the visitor's chosen currency. A payment may
 * only be charged in that currency when the provider supports it; otherwise the
 * charge happens in the account's settlement currency and the note under the
 * price says so. Nothing here invents an exchange rate — amounts are converted
 * with the same configured rate the prices were rendered with.
 */

/** Currencies the connected Stripe account can charge one-time payments in. */
export const PROVIDER_CHECKOUT_CURRENCIES: ReadonlySet<string> = new Set([
  "USD",
  "EUR",
  "GBP",
  "AED",
  "AUD",
  "BRL",
  "CAD",
  "CHF",
  "DKK",
  "HKD",
  "JPY",
  "MXN",
  "MYR",
  "NOK",
  "NZD",
  "PLN",
  "SAR",
  "SEK",
  "SGD",
  "THB",
  "TRY",
  "ZAR",
]);

/** Stripe expects the smallest currency unit; these have no minor unit. */
export const ZERO_DECIMAL_CURRENCIES: ReadonlySet<string> = new Set([
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
]);

export function isZeroDecimalCurrency(currency: string): boolean {
  return ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase());
}

/** Provider account currency used when the selected currency is unsupported. */
export function defaultSettlementCurrency(): string {
  return (
    process.env.NEXT_PUBLIC_CHECKOUT_CURRENCY?.trim().toUpperCase() || "USD"
  );
}

/** Charge currency for a storefront selection. */
export function resolveSettlementCurrency(
  selectedCurrency: string | null | undefined,
  fallback: string = defaultSettlementCurrency(),
): string {
  const selected = (selectedCurrency ?? "").trim().toUpperCase();
  if (selected && PROVIDER_CHECKOUT_CURRENCIES.has(selected)) return selected;
  return (fallback || "USD").toUpperCase();
}

/** True when the customer is charged in the currency the prices are shown in. */
export function chargesInSelectedCurrency(selectedCurrency: string): boolean {
  return (
    resolveSettlementCurrency(selectedCurrency) ===
    selectedCurrency.toUpperCase()
  );
}

/** Convert a display amount to the provider's integer minor unit. */
export function toProviderMinorUnits(amount: number, currency: string): number {
  if (!Number.isFinite(amount)) return 0;
  if (isZeroDecimalCurrency(currency)) return Math.round(amount);
  return Math.round(amount * 100);
}

/** Convert back from provider minor units to a display amount. */
export function fromProviderMinorUnits(
  minorUnits: number,
  currency: string,
): number {
  if (!Number.isFinite(minorUnits)) return 0;
  if (isZeroDecimalCurrency(currency)) return Math.round(minorUnits);
  return Math.round(minorUnits) / 100;
}
