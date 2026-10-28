/**
 * Centralized commercial pricing.
 * USD book is the source of truth; other currencies use mid-market FX
 * (exchangerate-api / Google-aligned) with pinned INR=95 and NPR=154 per USD.
 */

export type CurrencyCode =
  | "USD"
  | "EUR"
  | "GBP"
  | "INR"
  | "NPR"
  | "JPY"
  | "AUD"
  | "CAD"
  | "AED"
  | "SGD"
  | "MYR"
  | "THB"
  | "IDR"
  | "PHP"
  | "KRW"
  | "BRL"
  | "MXN"
  | "ZAR"
  | "CHF"
  | "SEK"
  | "NOK"
  | "DKK"
  | "PLN"
  | "TRY"
  | "SAR"
  | "HKD"
  | "NZD"
  | "PKR"
  | "BDT"
  | "LKR"
  | "VND";

export type ProductPriceId =
  "domain_yearly" | "email_monthly" | "hosting_monthly";

export type PriceBook = Record<ProductPriceId, number>;

/** Base commercial book in USD */
export const basePriceBookUsd: PriceBook = {
  domain_yearly: 15,
  email_monthly: 0.42,
  hosting_monthly: 1,
};

/**
 * Units of local currency per 1 USD.
 * Sourced from open.er-api.com (2026-08-29), with commercial pins:
 * INR = 95, NPR = 154 (as specified).
 */
export const usdToLocalRate: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.861354,
  GBP: 0.737868,
  INR: 95,
  NPR: 154,
  JPY: 159.924891,
  AUD: 1.394552,
  CAD: 1.388787,
  AED: 3.6725,
  SGD: 1.272477,
  MYR: 4.02581,
  THB: 33.024424,
  IDR: 17701.341153,
  PHP: 62.335023,
  KRW: 1377.942221,
  BRL: 5.163864,
  MXN: 17.011519,
  ZAR: 16.092366,
  CHF: 0.808088,
  SEK: 9.573656,
  NOK: 9.359458,
  DKK: 6.41952,
  PLN: 3.735912,
  TRY: 48.228751,
  SAR: 3.75,
  HKD: 7.840335,
  NZD: 1.689402,
  PKR: 277.911269,
  BDT: 123.208033,
  LKR: 328.294208,
  VND: 26056.967123,
};

const ZERO_DECIMAL: ReadonlySet<CurrencyCode> = new Set([
  "JPY",
  "KRW",
  "VND",
  "IDR",
]);

function roundCommercial(amount: number, currency: CurrencyCode): number {
  if (ZERO_DECIMAL.has(currency) || amount >= 100) {
    return Math.round(amount);
  }
  if (amount >= 10) {
    return Math.round(amount * 10) / 10;
  }
  return Math.round(amount * 100) / 100;
}

function buildBookFromRate(rate: number, currency: CurrencyCode): PriceBook {
  return {
    domain_yearly: roundCommercial(
      basePriceBookUsd.domain_yearly * rate,
      currency,
    ),
    email_monthly: roundCommercial(
      basePriceBookUsd.email_monthly * rate,
      currency,
    ),
    hosting_monthly: roundCommercial(
      basePriceBookUsd.hosting_monthly * rate,
      currency,
    ),
  };
}

/** Localized commercial prices derived from USD × FX rate */
export const priceBooksByCurrency: Record<CurrencyCode, PriceBook> =
  Object.fromEntries(
    (Object.keys(usdToLocalRate) as CurrencyCode[]).map((currency) => [
      currency,
      buildBookFromRate(usdToLocalRate[currency], currency),
    ]),
  ) as Record<CurrencyCode, PriceBook>;

export const productPriceMeta: Record<
  ProductPriceId,
  { periodKey: "perYear" | "perMonth"; productKey: string }
> = {
  domain_yearly: { periodKey: "perYear", productKey: "domain" },
  email_monthly: { periodKey: "perMonth", productKey: "email" },
  hosting_monthly: { periodKey: "perMonth", productKey: "hosting" },
};

export function getPriceBook(currency: CurrencyCode): PriceBook {
  return priceBooksByCurrency[currency] ?? basePriceBookUsd;
}

export function convertUsdToLocal(
  usdAmount: number,
  currency: CurrencyCode,
): number {
  if (!Number.isFinite(usdAmount)) return 0;
  const rate = usdToLocalRate[currency] ?? 1;
  return roundCommercial(usdAmount * rate, currency);
}

export function formatUsdAsLocal(
  usdAmount: number,
  currency: CurrencyCode,
  locale: string,
): string {
  return formatMoney(convertUsdToLocal(usdAmount, currency), currency, locale);
}

export function getProductPrice(
  productId: ProductPriceId,
  currency: CurrencyCode,
): number {
  return getPriceBook(currency)[productId];
}

export function formatMoney(
  amount: number,
  currency: CurrencyCode,
  locale: string,
): string {
  try {
    const fractionDigits = ZERO_DECIMAL.has(currency)
      ? 0
      : amount % 1 === 0
        ? 0
        : 2;
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}
