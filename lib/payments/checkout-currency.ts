/**
 * Checkout settlement copy.
 *
 * Storefront prices are displayed in the visitor's currency, but the payment
 * provider settles in a single currency today. Keep that fact in one place so
 * every pricing surface states it the same way — and leads with the currency the
 * visitor actually selected.
 */

/**
 * Currency the payment provider actually charges today.
 * Override with `NEXT_PUBLIC_CHECKOUT_CURRENCY` once a local-currency gateway
 * (for example NPR) is live, without touching any copy.
 */
export const CHECKOUT_SETTLE_CURRENCY = (
  process.env.NEXT_PUBLIC_CHECKOUT_CURRENCY || "USD"
).toUpperCase();

export type CheckoutNoteCopy = {
  /** e.g. "Charged in {currency} at checkout." */
  chargedInCheckout: string;
  /** e.g. "Prices in {local}. Charged in {checkout} at checkout." */
  chargedInLocalCheckout: string;
};

/**
 * Sentence shown under a price block.
 *
 * When the selected currency is also the settlement currency we only state the
 * charge. Otherwise the selected currency leads and the settlement currency is
 * disclosed after it, so the note never contradicts the prices above it.
 */
export function buildCheckoutNote(
  copy: CheckoutNoteCopy,
  selectedCurrency: string,
  settleCurrency: string = CHECKOUT_SETTLE_CURRENCY,
): string {
  const selected = (selectedCurrency || settleCurrency).toUpperCase();
  const settle = (settleCurrency || "USD").toUpperCase();

  if (selected === settle) {
    return copy.chargedInCheckout.replace(/\{currency\}/g, settle);
  }
  return copy.chargedInLocalCheckout
    .replace(/\{local\}/g, selected)
    .replace(/\{checkout\}/g, settle);
}
