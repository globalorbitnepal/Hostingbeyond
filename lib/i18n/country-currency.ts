import { getCountry } from "@/config/geo";
import {
  isConfiguredDisplayCurrency,
  normalizePublicDisplayCurrency,
  type PublicDisplayCurrency,
} from "@/lib/i18n/display-currencies";

/**
 * Explicit country → display-currency intent (ISO 4217).
 *
 * This is a *request*, not a promise: a currency is only shown when
 * `config/pricing.ts` already holds a configured price for it. Codes absent from
 * that book (e.g. RUB, CNY today) deliberately fall back instead of receiving an
 * invented exchange rate.
 *
 * These are storefront display mappings only — they say nothing about which
 * currencies the future payment provider will actually settle in.
 */
export const COUNTRY_DISPLAY_CURRENCY: Readonly<Record<string, string>> = {
  NP: "NPR",
  US: "USD",
  GB: "GBP",
  IN: "INR",
  AU: "AUD",
  CA: "CAD",
  DE: "EUR",
  FR: "EUR",
  ES: "EUR",
  IT: "EUR",
  PT: "EUR",
  NL: "EUR",
  IE: "EUR",
  AE: "AED",
  JP: "JPY",
  KR: "KRW",
  CN: "CNY",
  HK: "HKD",
  SG: "SGD",
  MY: "MYR",
  TH: "THB",
  ID: "IDR",
  PH: "PHP",
  VN: "VND",
  BD: "BDT",
  PK: "PKR",
  LK: "LKR",
  BR: "BRL",
  MX: "MXN",
  ZA: "ZAR",
  CH: "CHF",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  PL: "PLN",
  TR: "TRY",
  SA: "SAR",
  RU: "RUB",
  NZ: "NZD",
};

export const COUNTRY_CURRENCY_FALLBACK: PublicDisplayCurrency = "USD";

export type CountryCurrencyResolution = {
  countryCode: string;
  /** Currency the country maps to, even when no price list exists for it. */
  requestedCurrency: string;
  /** Currency we may actually render prices in. */
  currency: PublicDisplayCurrency;
  /** False when `requestedCurrency` has no configured price list. */
  exact: boolean;
};

/**
 * Resolve the display currency for a country.
 *
 * Precedence: explicit `COUNTRY_DISPLAY_CURRENCY` row → the commercial mapping in
 * `config/geo` → the country's configured price list → USD fallback.
 */
export function resolveCountryDisplayCurrency(
  countryCode: string | null | undefined,
): CountryCurrencyResolution {
  const country = getCountry((countryCode ?? "").trim().toUpperCase());
  const requested =
    COUNTRY_DISPLAY_CURRENCY[country.code] ?? String(country.currency);

  if (isConfiguredDisplayCurrency(requested)) {
    return {
      countryCode: country.code,
      requestedCurrency: requested,
      currency: normalizePublicDisplayCurrency(requested),
      exact: true,
    };
  }

  /** Country's own commercial currency may still have a configured price. */
  const countryCurrency = String(country.currency);
  if (isConfiguredDisplayCurrency(countryCurrency)) {
    return {
      countryCode: country.code,
      requestedCurrency: requested,
      currency: normalizePublicDisplayCurrency(countryCurrency),
      exact: false,
    };
  }

  return {
    countryCode: country.code,
    requestedCurrency: requested,
    currency: COUNTRY_CURRENCY_FALLBACK,
    exact: false,
  };
}

/**
 * Footer copy for the selector. Always states the checkout currency so display
 * prices are never mistaken for the amount actually charged.
 *
 * `appliedCurrency` is the currency actually rendering prices, which can differ
 * from the country's default after a manual pick.
 */
export function currencyNoticeFor(
  resolution: CountryCurrencyResolution,
  options: { checkoutCurrency?: string; appliedCurrency?: string } = {},
): string {
  const checkoutCurrency = options.checkoutCurrency ?? "USD";
  const applied = options.appliedCurrency ?? resolution.currency;

  if (applied !== resolution.currency) {
    return `Prices shown in ${applied} (your choice). Checkout is charged in ${checkoutCurrency}.`;
  }
  if (resolution.exact) {
    return `Prices shown in ${applied}. Checkout is charged in ${checkoutCurrency}.`;
  }
  return `No ${resolution.requestedCurrency} price list is configured yet — prices shown in ${applied}. Checkout is charged in ${checkoutCurrency}.`;
}
