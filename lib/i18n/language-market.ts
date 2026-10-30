import type { UserPreferences } from "@/lib/i18n/preferences";
import { resolveCountryDisplayCurrency } from "@/lib/i18n/country-currency";
import type { PublicDisplayCurrency } from "@/lib/i18n/display-currencies";
import { HOSTINGER_LOCALE_MARKETS } from "@/lib/i18n/hostinger-locale-markets";
import {
  DEFAULT_WEBSITE_LANGUAGE_CODE,
  websiteLanguageByCode,
  type WebsiteLanguageCode,
} from "@/lib/i18n/website-languages";

export type LanguageStorefront = {
  country: string;
  currency: PublicDisplayCurrency;
  localeMarketId: string;
  googleTargetLang: WebsiteLanguageCode;
  triggerCode: string;
};

/**
 * Flag-country metadata for a language chip. Not used to change prices —
 * Portuguese is Portugal, not Brazilian Real.
 */
export function storefrontFromWebsiteLanguage(
  code: WebsiteLanguageCode,
): LanguageStorefront {
  const lang =
    websiteLanguageByCode(code) ??
    websiteLanguageByCode(DEFAULT_WEBSITE_LANGUAGE_CODE)!;
  const country = lang.flagCountryCode.toUpperCase();
  const currency = resolveCountryDisplayCurrency(country).currency;
  const langBase = lang.code.split("-")[0] ?? lang.code;
  const market =
    HOSTINGER_LOCALE_MARKETS.find(
      (row) =>
        row.countryCode === country &&
        (row.googleTargetLang === lang.code ||
          row.googleTargetLang.split("-")[0] === langBase),
    ) ?? HOSTINGER_LOCALE_MARKETS.find((row) => row.countryCode === country);
  return {
    country,
    currency,
    localeMarketId:
      market?.id ?? `${country}-${lang.triggerCode.toLowerCase()}`,
    googleTargetLang: lang.code,
    triggerCode: lang.triggerCode,
  };
}

/** Apply a website language without touching country or display currency. */
export function preferencesKeepingCurrencyForLanguage(
  prefs: UserPreferences,
  code: WebsiteLanguageCode,
): Pick<
  UserPreferences,
  | "googleTargetLang"
  | "languageLocked"
  | "country"
  | "localeMarketId"
  | "currency"
  | "currencyLocked"
> {
  return {
    googleTargetLang: code,
    languageLocked: true,
    country: prefs.country,
    localeMarketId: prefs.localeMarketId,
    currency: prefs.currency,
    currencyLocked: prefs.currencyLocked,
  };
}
