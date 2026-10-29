import type { LanguageCode } from "@/config/geo";
import { getCountry } from "@/config/geo";
import { PUBLIC_ENGLISH_ONLY } from "@/lib/i18n/public-language";
import { googleTranslateIncludedLanguages as registryTranslateLanguages } from "@/lib/i18n/website-languages";
import {
  STOREFRONT_COUNTRIES,
  searchStorefrontCountries,
} from "@/lib/i18n/storefront-countries";

/** One row in the Hostinger-style “Select location & language” list. */
export type HostingerLocaleMarket = {
  id: string;
  countryCode: string;
  /** Localized market title (left column). */
  countryName: string;
  /** Language label (right column). */
  languageLabel: string;
  /** Google Translate target language code. */
  googleTargetLang: string;
  /** Short header code (EN, HI, ES, …). */
  triggerCode: string;
  /** App dictionary language when we have one; otherwise English + Google. */
  appLanguage: LanguageCode;
  searchText: string;
};

/**
 * Cookie/market rows. Public country membership is `STOREFRONT_COUNTRIES`.
 * Canada still has two language rows here for legacy cookies only.
 */
export const HOSTINGER_LOCALE_MARKETS: HostingerLocaleMarket[] = [
  mk("AU-en", "AU", "Australia", "English", "en", "EN"),
  mk("BD-bn", "BD", "Bangladesh", "বাংলা", "bn", "BN"),
  mk("BR-pt", "BR", "Brazil", "Português", "pt", "PT"),
  mk("CA-en", "CA", "Canada", "English", "en", "EN"),
  mk("CA-fr", "CA", "Canada", "Français", "fr", "FR"),
  mk("CN-zh", "CN", "China", "中文", "zh-CN", "ZH"),
  mk("FR-fr", "FR", "France", "Français", "fr", "FR"),
  mk("DE-de", "DE", "Germany", "Deutsch", "de", "DE"),
  mk("IN-hi", "IN", "India", "हिन्दी", "hi", "HI"),
  mk("JP-ja", "JP", "Japan", "日本語", "ja", "JA"),
  mk("NP-ne", "NP", "Nepal", "नेपाली", "ne", "NE"),
  mk("RU-ru", "RU", "Russia", "Русский", "ru", "RU"),
  mk("ES-es", "ES", "Spain", "Español", "es", "ES"),
  mk("GB-en", "GB", "United Kingdom", "English", "en", "EN"),
  mk("US-en", "US", "United States", "English", "en", "EN"),
];

export const DEFAULT_LOCALE_MARKET_ID = "US-en";

/** Older cookie ids → current market ids (no data loss). */
const LEGACY_MARKET_IDS: Record<string, string> = {
  "NP-en": "NP-ne",
  "IN-en": "IN-hi",
};

function appLanguageForGoogle(code: string): LanguageCode {
  const base = code.split("-")[0] ?? "en";
  const map: Record<string, LanguageCode> = {
    en: "en",
    hi: "hi",
    ne: "ne",
    ar: "ar",
    zh: "zh",
    es: "es",
    fr: "fr",
    de: "de",
    pt: "pt",
    ja: "ja",
    ko: "ko",
  };
  return map[base] ?? "en";
}

function mk(
  id: string,
  countryCode: string,
  countryName: string,
  languageLabel: string,
  googleTargetLang: string,
  triggerCode: string,
): HostingerLocaleMarket {
  const appLanguage = appLanguageForGoogle(googleTargetLang);
  /** Include the ISO English name so "Germany" finds "Deutschland". */
  const englishName = getCountry(countryCode).name;
  const searchText =
    `${countryName} ${englishName} ${languageLabel} ${countryCode} ${googleTargetLang} ${triggerCode}`.toLowerCase();
  return {
    id,
    countryCode,
    countryName,
    languageLabel,
    googleTargetLang,
    triggerCode,
    appLanguage,
    searchText,
  };
}

function isEnglishMarket(market: HostingerLocaleMarket): boolean {
  return market.googleTargetLang === "en" && market.appLanguage === "en";
}

export function googleTranslateIncludedLanguages(): string {
  return registryTranslateLanguages();
}

/** One row per storefront country — order and membership come from STOREFRONT_COUNTRIES. */
export function uniqueCountryMarkets(): HostingerLocaleMarket[] {
  const byCode = new Map<string, HostingerLocaleMarket>();
  for (const market of HOSTINGER_LOCALE_MARKETS) {
    if (!byCode.has(market.countryCode)) byCode.set(market.countryCode, market);
  }
  return STOREFRONT_COUNTRIES.map((country) => {
    const market = byCode.get(country.code);
    if (!market) {
      throw new Error(
        `missing locale market for storefront country ${country.code}`,
      );
    }
    return { ...market, countryName: country.name };
  });
}

export function searchCountryMarkets(query: string): HostingerLocaleMarket[] {
  const allowed = new Map(
    uniqueCountryMarkets().map((market) => [market.countryCode, market]),
  );
  return searchStorefrontCountries(query)
    .map((country) => allowed.get(country.code))
    .filter((market): market is HostingerLocaleMarket => market != null);
}

/**
 * Every market is country-selectable — country drives pricing, so hiding a
 * country because its native language is unavailable would make regional
 * pricing unreachable. Language availability is handled separately by
 * {@link effectiveMarket}.
 */
export function publicLocaleMarkets(): HostingerLocaleMarket[] {
  return HOSTINGER_LOCALE_MARKETS;
}

/**
 * The market as actually applied to the page.
 *
 * When the English-only policy is active, a non-English market keeps its
 * country and currency but is *applied* as English. This is deliberate: the
 * selector must never imply the site is translated when it is not.
 */
export function effectiveMarket(
  market: HostingerLocaleMarket,
): HostingerLocaleMarket {
  if (!PUBLIC_ENGLISH_ONLY || isEnglishMarket(market)) return market;
  return {
    ...market,
    googleTargetLang: "en",
    appLanguage: "en",
    triggerCode: "EN",
  };
}

/** True when this language may actually be applied to page copy today. */
export function isMarketLanguageEnabled(
  market: HostingerLocaleMarket,
): boolean {
  return !PUBLIC_ENGLISH_ONLY || isEnglishMarket(market);
}

export function englishMarketFor(
  id: string | undefined | null,
  countryCode?: string,
): HostingerLocaleMarket {
  const requestedId = LEGACY_MARKET_IDS[id ?? ""] ?? id;
  const requested =
    HOSTINGER_LOCALE_MARKETS.find((m) => m.id === requestedId) ??
    HOSTINGER_LOCALE_MARKETS.find(
      (m) => m.countryCode === (countryCode ?? "").toUpperCase(),
    ) ??
    HOSTINGER_LOCALE_MARKETS.find((m) => m.id === DEFAULT_LOCALE_MARKET_ID)!;
  /** Preserve the country — only the language is neutralised when English-only. */
  return effectiveMarket(requested);
}

export function getLocaleMarket(
  id: string | undefined | null,
): HostingerLocaleMarket {
  return englishMarketFor(id);
}

export function searchLocaleMarkets(query: string): HostingerLocaleMarket[] {
  const markets = publicLocaleMarkets();
  const q = query.trim().toLowerCase();
  if (!q) return markets;
  return markets.filter((m) => m.searchText.includes(q));
}

export function currencyForMarket(market: HostingerLocaleMarket) {
  return getCountry(market.countryCode).currency;
}
