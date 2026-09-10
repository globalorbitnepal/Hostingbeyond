import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

import type { CurrencyCode } from "@/config/pricing";

countries.registerLocale(enLocale);

export type LanguageCode =
  | "en"
  | "ne"
  | "hi"
  | "es"
  | "fr"
  | "de"
  | "it"
  | "pt"
  | "ja"
  | "ko"
  | "zh"
  | "ar";

export type CountryOption = {
  code: string;
  name: string;
  currency: CurrencyCode;
  defaultLanguage: LanguageCode;
  languages: LanguageCode[];
  searchText: string;
};

export const languages: Record<
  LanguageCode,
  { code: LanguageCode; label: string; nativeLabel: string; locale: string }
> = {
  en: { code: "en", label: "English", nativeLabel: "English", locale: "en-US" },
  ne: { code: "ne", label: "Nepali", nativeLabel: "नेपाली", locale: "ne-NP" },
  hi: { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", locale: "hi-IN" },
  es: { code: "es", label: "Spanish", nativeLabel: "Español", locale: "es-ES" },
  fr: { code: "fr", label: "French", nativeLabel: "Français", locale: "fr-FR" },
  de: { code: "de", label: "German", nativeLabel: "Deutsch", locale: "de-DE" },
  it: {
    code: "it",
    label: "Italian",
    nativeLabel: "Italiano",
    locale: "it-IT",
  },
  pt: {
    code: "pt",
    label: "Portuguese",
    nativeLabel: "Português",
    locale: "pt-BR",
  },
  ja: { code: "ja", label: "Japanese", nativeLabel: "日本語", locale: "ja-JP" },
  ko: { code: "ko", label: "Korean", nativeLabel: "한국어", locale: "ko-KR" },
  zh: { code: "zh", label: "Chinese", nativeLabel: "中文", locale: "zh-CN" },
  ar: { code: "ar", label: "Arabic", nativeLabel: "العربية", locale: "ar-SA" },
};

/** ISO country → commercial currency + default language */
const countryOverrides: Record<
  string,
  {
    currency: CurrencyCode;
    defaultLanguage: LanguageCode;
    languages?: LanguageCode[];
  }
> = {
  US: { currency: "USD", defaultLanguage: "en" },
  GB: { currency: "GBP", defaultLanguage: "en" },
  CA: { currency: "CAD", defaultLanguage: "en", languages: ["en", "fr"] },
  AU: { currency: "AUD", defaultLanguage: "en" },
  NZ: { currency: "NZD", defaultLanguage: "en" },
  IE: { currency: "EUR", defaultLanguage: "en" },
  IN: { currency: "INR", defaultLanguage: "hi", languages: ["hi", "en"] },
  NP: { currency: "NPR", defaultLanguage: "ne", languages: ["ne", "en"] },
  PK: { currency: "PKR", defaultLanguage: "en" },
  BD: { currency: "BDT", defaultLanguage: "en" },
  LK: { currency: "LKR", defaultLanguage: "en" },
  AE: { currency: "AED", defaultLanguage: "ar", languages: ["ar", "en"] },
  SA: { currency: "SAR", defaultLanguage: "ar", languages: ["ar", "en"] },
  JP: { currency: "JPY", defaultLanguage: "ja", languages: ["ja", "en"] },
  KR: { currency: "KRW", defaultLanguage: "ko", languages: ["ko", "en"] },
  CN: { currency: "USD", defaultLanguage: "zh", languages: ["zh", "en"] },
  HK: { currency: "HKD", defaultLanguage: "zh", languages: ["zh", "en"] },
  SG: { currency: "SGD", defaultLanguage: "en", languages: ["en", "zh"] },
  MY: { currency: "MYR", defaultLanguage: "en" },
  TH: { currency: "THB", defaultLanguage: "en" },
  ID: { currency: "IDR", defaultLanguage: "en" },
  PH: { currency: "PHP", defaultLanguage: "en" },
  VN: { currency: "VND", defaultLanguage: "en" },
  FR: { currency: "EUR", defaultLanguage: "fr", languages: ["fr", "en"] },
  DE: { currency: "EUR", defaultLanguage: "de", languages: ["de", "en"] },
  IT: { currency: "EUR", defaultLanguage: "it", languages: ["it", "en"] },
  ES: { currency: "EUR", defaultLanguage: "es", languages: ["es", "en"] },
  PT: { currency: "EUR", defaultLanguage: "pt", languages: ["pt", "en"] },
  NL: { currency: "EUR", defaultLanguage: "en" },
  BE: { currency: "EUR", defaultLanguage: "fr", languages: ["fr", "de", "en"] },
  AT: { currency: "EUR", defaultLanguage: "de", languages: ["de", "en"] },
  CH: {
    currency: "CHF",
    defaultLanguage: "de",
    languages: ["de", "fr", "it", "en"],
  },
  SE: { currency: "SEK", defaultLanguage: "en" },
  NO: { currency: "NOK", defaultLanguage: "en" },
  DK: { currency: "DKK", defaultLanguage: "en" },
  PL: { currency: "PLN", defaultLanguage: "en" },
  TR: { currency: "TRY", defaultLanguage: "en" },
  BR: { currency: "BRL", defaultLanguage: "pt", languages: ["pt", "en"] },
  MX: { currency: "MXN", defaultLanguage: "es", languages: ["es", "en"] },
  AR: { currency: "USD", defaultLanguage: "es", languages: ["es", "en"] },
  CL: { currency: "USD", defaultLanguage: "es", languages: ["es", "en"] },
  CO: { currency: "USD", defaultLanguage: "es", languages: ["es", "en"] },
  ZA: { currency: "ZAR", defaultLanguage: "en" },
  EG: { currency: "USD", defaultLanguage: "ar", languages: ["ar", "en"] },
  NG: { currency: "USD", defaultLanguage: "en" },
  KE: { currency: "USD", defaultLanguage: "en" },
  RU: { currency: "USD", defaultLanguage: "en" },
  UA: { currency: "EUR", defaultLanguage: "en" },
  IL: { currency: "USD", defaultLanguage: "en" },
  QA: { currency: "USD", defaultLanguage: "ar", languages: ["ar", "en"] },
  KW: { currency: "USD", defaultLanguage: "ar", languages: ["ar", "en"] },
  BH: { currency: "USD", defaultLanguage: "ar", languages: ["ar", "en"] },
  OM: { currency: "USD", defaultLanguage: "ar", languages: ["ar", "en"] },
  FI: { currency: "EUR", defaultLanguage: "en" },
  GR: { currency: "EUR", defaultLanguage: "en" },
  CZ: { currency: "EUR", defaultLanguage: "en" },
  HU: { currency: "EUR", defaultLanguage: "en" },
  RO: { currency: "EUR", defaultLanguage: "en" },
  BG: { currency: "EUR", defaultLanguage: "en" },
  HR: { currency: "EUR", defaultLanguage: "en" },
  SK: { currency: "EUR", defaultLanguage: "en" },
  SI: { currency: "EUR", defaultLanguage: "en" },
  LT: { currency: "EUR", defaultLanguage: "en" },
  LV: { currency: "EUR", defaultLanguage: "en" },
  EE: { currency: "EUR", defaultLanguage: "en" },
  LU: { currency: "EUR", defaultLanguage: "fr", languages: ["fr", "de", "en"] },
  MT: { currency: "EUR", defaultLanguage: "en" },
  CY: { currency: "EUR", defaultLanguage: "en" },
  IS: { currency: "EUR", defaultLanguage: "en" },
  TW: { currency: "USD", defaultLanguage: "zh", languages: ["zh", "en"] },
  MO: { currency: "HKD", defaultLanguage: "zh", languages: ["zh", "en"] },
};

const euroCountries = new Set([
  "AT",
  "BE",
  "CY",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PT",
  "SK",
  "SI",
  "ES",
  "HR",
]);

function resolveCurrency(code: string): CurrencyCode {
  if (countryOverrides[code]?.currency) return countryOverrides[code].currency;
  if (euroCountries.has(code)) return "EUR";
  return "USD";
}

function resolveLanguages(code: string): {
  defaultLanguage: LanguageCode;
  languages: LanguageCode[];
} {
  const override = countryOverrides[code];
  if (override) {
    return {
      defaultLanguage: override.defaultLanguage,
      languages: override.languages ?? [override.defaultLanguage, "en"],
    };
  }
  return { defaultLanguage: "en", languages: ["en"] };
}

/** @deprecated Use flagImgUrl() instead — emoji flags don't render on Windows */
export function countryFlagEmoji(countryCode: string): string {
  const code = countryCode.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "🌐";
  return String.fromCodePoint(
    ...[...code].map((char) => 127397 + char.charCodeAt(0)),
  );
}

/**
 * Returns a flagcdn.com URL for a 2-letter ISO country code.
 * SVG is default (sharp at any size); PNG fallback uses standard 4:3 flag ratio.
 */
export function flagImgUrl(
  countryCode: string,
  format: "svg" | "png" = "svg",
): string {
  const code = countryCode.toLowerCase();
  if (!/^[a-z]{2}$/.test(code)) return "";
  if (format === "png") return `https://flagcdn.com/24x18/${code}.png`;
  return `https://flagcdn.com/${code}.svg`;
}

function buildCountryOptions(): CountryOption[] {
  const names = countries.getNames("en", { select: "official" });
  return Object.entries(names)
    .map(([code, name]) => {
      const { defaultLanguage, languages: langs } = resolveLanguages(code);
      const currency = resolveCurrency(code);
      const languageLabels = langs
        .map((lang) => languages[lang]?.label ?? lang)
        .join(" ");
      return {
        code,
        name,
        currency,
        defaultLanguage,
        languages: Array.from(new Set(langs)),
        searchText: `${name} ${code} ${languageLabels}`.toLowerCase(),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const countryOptions: CountryOption[] = buildCountryOptions();

export const DEFAULT_COUNTRY = "US";
export const DEFAULT_LANGUAGE: LanguageCode = "en";
export const DEFAULT_CURRENCY: CurrencyCode = "USD";

export function getCountry(code: string): CountryOption {
  return (
    countryOptions.find((country) => country.code === code) ??
    countryOptions.find((country) => country.code === DEFAULT_COUNTRY)!
  );
}

export function searchCountries(query: string): CountryOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return countryOptions;
  return countryOptions.filter((country) => {
    if (country.searchText.includes(q)) return true;
    return country.languages.some((lang) => {
      const meta = languages[lang];
      return (
        meta.label.toLowerCase().includes(q) ||
        meta.nativeLabel.toLowerCase().includes(q) ||
        meta.code.includes(q)
      );
    });
  });
}
