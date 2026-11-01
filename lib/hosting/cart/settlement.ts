import { convertUsdToLocal, type CurrencyCode } from "@/config/pricing";
import type { HostingCartQuote, HostingCartQuoteLine } from "./types";
import {
  resolveSettlementCurrency,
  toProviderMinorUnits,
} from "@/lib/payments/settlement-currency";

export type SettledHostingQuote = {
  /** Currency the provider will actually charge. */
  currency: string;
  /** Units of `currency` per 1 USD, from the same table used to render prices. */
  rate: number;
  currencyChanged: boolean;
  lines: HostingCartQuoteLine[];
  subtotal: number;
  discount: number;
  tax: number | null;
  total: number;
  billedAmount: number;
  monthlyEquivalent: number | null;
  /** Provider minor units (cents), used for the Stripe session and verification. */
  totalMinorUnits: number;
};

/**
 * Convert a USD-based cart quote into the currency the customer will be charged.
 *
 * Uses the identical rate the storefront used for display, so the order total and
 * the price the visitor saw can never drift apart.
 */
export function settleHostingQuote(
  quote: HostingCartQuote,
  requestedCurrency: string | null | undefined,
  rate: number,
): SettledHostingQuote {
  const currency = resolveSettlementCurrency(
    requestedCurrency ?? quote.currency,
  );
  const isBase = currency === (quote.currency || "USD").toUpperCase();
  const convert = (amount: number) =>
    isBase ? amount : convertUsdToLocal(amount, currency as CurrencyCode, rate);

  const lines = quote.lines.map((line) => ({
    ...line,
    amount: convert(line.amount),
  }));
  const total = convert(quote.total);

  return {
    currency,
    rate: isBase ? 1 : rate,
    currencyChanged: !isBase,
    lines,
    subtotal: convert(quote.subtotal),
    discount: convert(quote.discount),
    tax: quote.tax == null ? null : convert(quote.tax),
    total,
    billedAmount: convert(quote.billedAmount),
    monthlyEquivalent:
      quote.monthlyEquivalent == null ? null : convert(quote.monthlyEquivalent),
    totalMinorUnits: toProviderMinorUnits(total, currency),
  };
}
