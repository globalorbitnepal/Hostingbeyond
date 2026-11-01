import { cookies } from "next/headers";

import type { CurrencyCode } from "@/config/pricing";
import { LOCALE_COOKIE, parsePreferencesCookie } from "@/lib/i18n/preferences";
import { getSiteSettings } from "@/lib/orbit/content";
import { resolveUsdToLocalRate } from "@/lib/pricing/display-rates";
import { resolveSettlementCurrency } from "@/lib/payments/settlement-currency";

export type RequestSettlement = {
  /** Charge currency resolved from the visitor's storefront selection. */
  currency: string;
  /** Units of `currency` per 1 USD, matching what the storefront displayed. */
  rate: number;
  displayCurrency: string;
};

/**
 * Server-side echo of the storefront currency choice.
 *
 * The browser never sends an amount; only the locale cookie decides which
 * currency the visitor selected. The rate comes from the same table the price
 * display uses, so displayed prices and the charged amount stay identical.
 */
export async function settlementForRequest(): Promise<RequestSettlement> {
  const cookieStore = await cookies();
  const preferences = parsePreferencesCookie(
    cookieStore.get(LOCALE_COOKIE)?.value,
  );
  const settings = await getSiteSettings();
  const displayCurrency = preferences.currency;
  const currency = resolveSettlementCurrency(displayCurrency);
  const rate =
    currency === "USD"
      ? 1
      : resolveUsdToLocalRate(
          currency as CurrencyCode,
          settings.displayCurrencyRates,
        );
  return { currency, rate, displayCurrency };
}
