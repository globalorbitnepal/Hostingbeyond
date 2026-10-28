import { cookies } from "next/headers";

import { languages } from "@/config/geo";
import { formatUsdAsLocal, type CurrencyCode } from "@/config/pricing";
import { LOCALE_COOKIE, parsePreferencesCookie } from "@/lib/i18n/preferences";
import { translatePhrase } from "@/lib/i18n/phrases";
import { formatPrice } from "@/lib/domains/tlds";

export async function getRequestPreferences() {
  const cookieStore = await cookies();
  return parsePreferencesCookie(cookieStore.get(LOCALE_COOKIE)?.value);
}

/** Marketing/catalog display. Wallet checkout stays USD. */
export function formatCatalogUsd(
  usdAmount: number,
  currency: string,
  language: string,
): string {
  if (currency === "USD") return formatPrice(usdAmount);
  const locale =
    languages[language as keyof typeof languages]?.locale ?? "en-US";
  return formatUsdAsLocal(usdAmount, currency as CurrencyCode, locale);
}

export function localizeServerText(language: string, text: string): string {
  return translatePhrase(
    language as Parameters<typeof translatePhrase>[0],
    text,
  );
}
