import type { LanguageCode } from "@/config/geo";
import { getCountry } from "@/config/geo";
import { PUBLIC_ENGLISH_ONLY } from "@/lib/i18n/public-language";

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

/** Same markets and order as hostinger.com header selector (2026). */
export const HOSTINGER_LOCALE_MARKETS: HostingerLocaleMarket[] = [
  mk("AR-es", "AR", "Argentina", "Español", "es", "ES"),
  mk("AT-de", "AT", "Österreich", "Deutsch", "de", "DE"),
  mk("AU-en", "AU", "Australia", "English", "en", "EN"),
  mk("BD-bn", "BD", "বাংলাদেশ", "বাংলা", "bn", "BN"),
  mk("BE-nl", "BE", "België", "Nederlands", "nl", "NL"),
  mk("BE-fr", "BE", "Belgique", "Français", "fr", "FR"),
  mk("BR-pt", "BR", "Brasil", "Português", "pt", "PT"),
  mk("CA-en", "CA", "Canada", "English", "en", "EN"),
  mk("CA-fr", "CA", "Canada", "Français", "fr", "FR"),
  mk("CH-de", "CH", "Schweiz", "Deutsch", "de", "DE"),
  mk("CH-fr", "CH", "Suisse", "Français", "fr", "FR"),
  mk("CO-es", "CO", "Colombia", "Español", "es", "ES"),
  mk("CZ-cs", "CZ", "Česko", "Čeština", "cs", "CS"),
  mk("DK-da", "DK", "Danmark", "Dansk", "da", "DA"),
  mk("DE-de", "DE", "Deutschland", "Deutsch", "de", "DE"),
  mk("EE-et", "EE", "Eesti", "Eesti", "et", "ET"),
  mk("EG-ar", "EG", "مصر", "العربية", "ar", "AR"),
  mk("GR-el", "GR", "Ελλάδα", "Ελληνικά", "el", "EL"),
  mk("ES-es", "ES", "España", "Español", "es", "ES"),
  mk("FR-fr", "FR", "France", "Français", "fr", "FR"),
  mk("HR-hr", "HR", "Hrvatska", "Hrvatski", "hr", "HR"),
  mk("IN-en", "IN", "India", "English", "en", "EN"),
  mk("IN-hi", "IN", "भारत", "हिंदी", "hi", "HI"),
  mk("ID-id", "ID", "Indonesia", "Bahasa Indonesia", "id", "ID"),
  mk("IT-it", "IT", "Italia", "Italiano", "it", "IT"),
  mk("JP-ja", "JP", "Japan", "日本語", "ja", "JA"),
  mk("LV-lv", "LV", "Latvija", "Latviešu", "lv", "LV"),
  mk("LT-lt", "LT", "Lietuva", "Lietuvių", "lt", "LT"),
  mk("HU-hu", "HU", "Magyarország", "Magyar", "hu", "HU"),
  mk("MA-ar", "MA", "المغرب", "العربية", "ar", "AR"),
  mk("MA-fr", "MA", "Maroc", "Français", "fr", "FR"),
  mk("MY-en", "MY", "Malaysia", "English", "en", "EN"),
  mk("MX-es", "MX", "México", "Español", "es", "ES"),
  mk("NG-en", "NG", "Nigeria", "English", "en", "EN"),
  mk("NL-nl", "NL", "Nederland", "Nederlands", "nl", "NL"),
  mk("NO-no", "NO", "Norge", "Norsk", "no", "NO"),
  mk("NP-en", "NP", "Nepal", "नेपाली", "en", "EN"),
  mk("PK-en", "PK", "Pakistan", "English", "en", "EN"),
  mk("PH-en", "PH", "Philippines", "English", "en", "EN"),
  mk("PL-pl", "PL", "Polska", "Polski", "pl", "PL"),
  mk("PT-pt", "PT", "Portugal", "Português", "pt", "PT"),
  mk("RO-ro", "RO", "România", "Română", "ro", "RO"),
  mk("RU-ru", "RU", "Russia", "Русский", "en", "EN"),
  mk("SK-sk", "SK", "Slovensko", "Slovenčina", "sk", "SK"),
  mk("FI-fi", "FI", "Suomi", "Suomi", "fi", "FI"),
  mk("SE-sv", "SE", "Sverige", "Svenska", "sv", "SV"),
  mk("TR-tr", "TR", "Türkiye", "Türkçe", "tr", "TR"),
  mk("UA-uk", "UA", "Україна", "Українська", "uk", "UK"),
  mk("GB-en", "GB", "United Kingdom", "English", "en", "EN"),
  mk("US-en", "US", "United States", "English", "en", "EN"),
  mk("VN-vi", "VN", "Việt Nam", "Tiếng Việt", "vi", "VI"),
  mk("AE-en", "AE", "United Arab Emirates", "English", "en", "EN"),
  mk("IL-he", "IL", "יִשְׂרָאֵל", "עברית", "he", "HE"),
  mk("TH-th", "TH", "ประเทศไทย", "ไทย", "th", "TH"),
  mk("KR-ko", "KR", "대한민국", "한국어", "ko", "KO"),
  mk("CN-zh", "CN", "中国", "中文", "zh-CN", "ZH"),
];

export const DEFAULT_LOCALE_MARKET_ID = "US-en";

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
  const requested =
    HOSTINGER_LOCALE_MARKETS.find((m) => m.id === id) ??
    HOSTINGER_LOCALE_MARKETS.find(
      (m) => m.countryCode === (countryCode ?? "").toUpperCase(),
    ) ??
    HOSTINGER_LOCALE_MARKETS.find((m) => m.id === DEFAULT_LOCALE_MARKET_ID)!;
  /** Preserve the country — only the language is neutralised. */
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
