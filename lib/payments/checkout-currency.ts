import {
  defaultSettlementCurrency,
  resolveSettlementCurrency,
} from "@/lib/payments/settlement-currency";

/**
 * Checkout settlement copy.
 *
 * Storefront prices are displayed in the visitor's currency. When the payment
 * provider can charge that currency, the note simply states it. Otherwise the
 * note discloses the currency that will actually be charged — it never implies a
 * charge in a currency the provider cannot settle.
 */

/** Fallback charge currency from environment (per-currency resolution lives below). */
export const CHECKOUT_SETTLE_CURRENCY = defaultSettlementCurrency();

export type CheckoutNoteCopy = {
  /** e.g. "Charged in {currency} at checkout." */
  chargedInCheckout: string;
  /** e.g. "Prices in {local}. Charged in {checkout} at checkout." */
  chargedInLocalCheckout: string;
};

/**
 * Sentence shown under a price block.
 *
 * `settleCurrency` defaults to the provider's currency for `selectedCurrency`,
 * so the note follows the visitor's selection instead of a single fixed code.
 */
export function buildCheckoutNote(
  copy: CheckoutNoteCopy,
  selectedCurrency: string,
  settleCurrency?: string,
): string {
  const selected = (selectedCurrency || "USD").toUpperCase();
  const settle = (
    settleCurrency || resolveSettlementCurrency(selected)
  ).toUpperCase();

  if (selected === settle) {
    return copy.chargedInCheckout
      .replace(/\{currency\}/g, settle)
      .replace(/\{local\}/g, settle)
      .replace(/\{checkout\}/g, settle);
  }
  return copy.chargedInLocalCheckout
    .replace(/\{local\}/g, selected)
    .replace(/\{currency\}/g, settle)
    .replace(/\{checkout\}/g, settle);
}
