import { usdToLocalRate, type CurrencyCode } from "@/config/pricing";

/**
 * Display currencies a visitor may select.
 *
 * The list is DERIVED from `usdToLocalRate` in `config/pricing.ts` — the single
 * source of truth for configured commercial rates (seeded from a published FX
 * snapshot plus Orbit overrides). Nothing here invents a rate: a currency is
 * offerable only when a positive configured rate already exists.
 */
export const PUBLIC_DISPLAY_CURRENCIES: readonly CurrencyCode[] = (
  Object.entries(usdToLocalRate) as [CurrencyCode, number][]
)
  .filter(([, rate]) => Number.isFinite(rate) && rate > 0)
  .map(([code]) => code)
  .sort((a, b) => (a === "USD" ? -1 : b === "USD" ? 1 : a.localeCompare(b)));

const publicSet = new Set<string>(PUBLIC_DISPLAY_CURRENCIES);

export type PublicDisplayCurrency = CurrencyCode;

/** True when a configured display price exists for this currency. */
export function isPublicDisplayCurrency(
  value: string | undefined | null,
): value is PublicDisplayCurrency {
  return typeof value === "string" && publicSet.has(value.toUpperCase());
}

/** True only when `config/pricing` holds a usable positive rate for the code. */
export function isConfiguredDisplayCurrency(
  value: string | undefined | null,
): value is PublicDisplayCurrency {
  if (typeof value !== "string") return false;
  const code = value.toUpperCase() as CurrencyCode;
  if (!publicSet.has(code)) return false;
  const rate = usdToLocalRate[code];
  return Number.isFinite(rate) && rate > 0;
}

export function normalizePublicDisplayCurrency(
  value: string | undefined | null,
  fallback: PublicDisplayCurrency = "USD",
): PublicDisplayCurrency {
  if (isConfiguredDisplayCurrency(value)) {
    return value.toUpperCase() as PublicDisplayCurrency;
  }
  return isConfiguredDisplayCurrency(fallback) ? fallback : "USD";
}

/**
 * Currency display metadata from the platform `Intl` database — avoids a
 * hand-maintained symbol/title table drifting out of sync per currency.
 */
function currencyTitle(code: string): string {
  try {
    const name = new Intl.DisplayNames(["en"], { type: "currency" }).of(code);
    if (name && name !== code) return name;
  } catch {
    /* fall through */
  }
  return code;
}

function currencySymbol(code: string): string {
  try {
    const parts = new Intl.NumberFormat("en", {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value ?? code;
  } catch {
    return code;
  }
}

export const PUBLIC_DISPLAY_CURRENCY_LABELS: Record<
  PublicDisplayCurrency,
  { code: string; symbol: string; title: string }
> = Object.fromEntries(
  PUBLIC_DISPLAY_CURRENCIES.map((code) => [
    code,
    { code, symbol: currencySymbol(code), title: currencyTitle(code) },
  ]),
) as Record<
  PublicDisplayCurrency,
  { code: string; symbol: string; title: string }
>;

export function publicCurrencyTriggerLabel(currency: CurrencyCode): string {
  const key = normalizePublicDisplayCurrency(currency);
  return PUBLIC_DISPLAY_CURRENCY_LABELS[key].code;
}

/** Codes shown first in the header currency chip (prices only, not language). */
export const FEATURED_DISPLAY_CURRENCIES = ["USD", "INR", "NPR"] as const;

export function orderedPublicDisplayCurrencies(): PublicDisplayCurrency[] {
  const featured: PublicDisplayCurrency[] = [];
  for (const code of FEATURED_DISPLAY_CURRENCIES) {
    if (isConfiguredDisplayCurrency(code)) featured.push(code);
  }
  const featuredSet = new Set<string>(featured);
  const rest = PUBLIC_DISPLAY_CURRENCIES.filter(
    (code) => !featuredSet.has(code),
  );
  return [...featured, ...rest];
}
