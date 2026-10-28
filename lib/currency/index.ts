/**
 * Visitor display-currency helpers (USD / INR / NPR).
 * Checkout and registrar settlement remain USD unless a payment flow is explicitly multi-currency.
 */
export {
  PUBLIC_DISPLAY_CURRENCIES,
  PUBLIC_DISPLAY_CURRENCY_LABELS,
  isPublicDisplayCurrency,
  normalizePublicDisplayCurrency,
  publicCurrencyTriggerLabel,
  type PublicDisplayCurrency,
} from "@/lib/i18n/display-currencies";

export {
  resolveUsdToLocalRate,
  mergeDisplayRateOverrides,
  type DisplayCurrencyRateOverrides,
} from "@/lib/pricing/display-rates";

export {
  convertUsdToLocal,
  formatMoney,
  formatUsdAsLocal,
} from "@/config/pricing";
