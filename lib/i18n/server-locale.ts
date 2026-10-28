import { cookies } from "next/headers";

import { languages } from "@/config/geo";
import { formatUsdAsLocal, type CurrencyCode } from "@/config/pricing";
import { LOCALE_COOKIE, parsePreferencesCookie } from "@/lib/i18n/preferences";
import { translatePhrase } from "@/lib/i18n/phrases";
import { formatPrice } from "@/lib/domains/tlds";
import { getSiteSettings } from "@/lib/orbit/content";
import { resolveUsdToLocalRate } from "@/lib/pricing/display-rates";

export async function getRequestPreferences() {
  const cookieStore = await cookies();
  return parsePreferencesCookie(cookieStore.get(LOCALE_COOKIE)?.value);
}

/** Marketing/catalog display. Wallet checkout stays USD. */
export async function formatCatalogUsd(
  usdAmount: number,
  currency: string,
  language: string,
): Promise<string> {
  if (currency === "USD") return formatPrice(usdAmount);
  const settings = await getSiteSettings();
  const locale =
    languages[language as keyof typeof languages]?.locale ?? "en-US";
  const rate = resolveUsdToLocalRate(
    currency as CurrencyCode,
    settings.displayCurrencyRates,
  );
  return formatUsdAsLocal(usdAmount, currency as CurrencyCode, locale, rate);
}

export function localizeServerText(language: string, text: string): string {
  return translatePhrase(
    language as Parameters<typeof translatePhrase>[0],
    text,
  );
}
