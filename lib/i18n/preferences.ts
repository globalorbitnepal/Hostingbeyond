import type { CurrencyCode } from "@/config/pricing";
import {
  DEFAULT_COUNTRY,
  DEFAULT_CURRENCY,
  DEFAULT_LANGUAGE,
  getCountry,
  type LanguageCode,
} from "@/config/geo";
import {
  DEFAULT_LOCALE_MARKET_ID,
  englishMarketFor,
} from "@/lib/i18n/hostinger-locale-markets";
import {
  isConfiguredDisplayCurrency,
  normalizePublicDisplayCurrency,
} from "@/lib/i18n/display-currencies";
import { resolveCountryDisplayCurrency } from "@/lib/i18n/country-currency";
import { isGoogleTranslationActive } from "@/lib/i18n/google-translate-client";
import { PUBLIC_ENGLISH_ONLY } from "@/lib/i18n/public-language";
import { resolveWebsiteLanguageCode } from "@/lib/i18n/website-languages";

export const LOCALE_COOKIE = "hb_prefs";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export type UserPreferences = {
  country: string;
  language: LanguageCode;
  currency: CurrencyCode;
  /** Hostinger-style market row id (e.g. US-en, IN-hi). */
  localeMarketId: string;
  /** Cloud Translation target (en = no translation). */
  googleTargetLang: string;
  /** True once the user explicitly picks a language (don't auto-overwrite). */
  languageLocked: boolean;
  /** True once the user explicitly picks a currency (don't auto-overwrite). */
  currencyLocked: boolean;
};

export const defaultPreferences: UserPreferences = {
  country: DEFAULT_COUNTRY,
  language: DEFAULT_LANGUAGE,
  currency:
    resolveCountryDisplayCurrency(DEFAULT_COUNTRY).currency ?? DEFAULT_CURRENCY,
  localeMarketId: "US-en",
  googleTargetLang: "en",
  languageLocked: false,
  currencyLocked: false,
};

const languageCodes = new Set<string>([
  "en",
  "ne",
  "hi",
  "es",
  "fr",
  "de",
  "it",
  "pt",
  "ja",
  "ko",
  "zh",
  "ar",
]);

function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === "string" && languageCodes.has(value);
}

export function normalizePreferences(
  input: Partial<UserPreferences> | null | undefined,
): UserPreferences {
  const countryFromInput =
    typeof input?.country === "string" && input.country.length === 2
      ? input.country.toUpperCase()
      : null;
  const languageLocked = PUBLIC_ENGLISH_ONLY
    ? true
    : Boolean(input?.languageLocked);
  const localeMarketId =
    typeof input?.localeMarketId === "string" && input.localeMarketId.length > 0
      ? input.localeMarketId
      : DEFAULT_LOCALE_MARKET_ID;
  const market = englishMarketFor(
    localeMarketId,
    countryFromInput ?? undefined,
  );
  const googleTargetLang = PUBLIC_ENGLISH_ONLY
    ? "en"
    : resolveWebsiteLanguageCode(
        input?.googleTargetLang ?? market.googleTargetLang,
      );
  /** Storefront HTML stays English; Cloud Translation handles the selected language. */
  const language =
    PUBLIC_ENGLISH_ONLY || isGoogleTranslationActive(googleTargetLang)
      ? DEFAULT_LANGUAGE
      : isLanguageCode(input?.language)
        ? input.language
        : DEFAULT_LANGUAGE;
  const country = getCountry(countryFromInput ?? market.countryCode);
  /**
   * Precedence: an explicit manual pick (currencyLocked) wins; otherwise the
   * country's mapped currency is used, falling back to USD when that currency
   * has no configured price — never an invented rate.
   */
  const countryCurrency = resolveCountryDisplayCurrency(country.code).currency;
  const currencyLocked = Boolean(input?.currencyLocked);
  const currency =
    currencyLocked && isConfiguredDisplayCurrency(input?.currency)
      ? normalizePublicDisplayCurrency(input?.currency, countryCurrency)
      : countryCurrency;

  return {
    country: country.code,
    language,
    currency,
    localeMarketId: market.id,
    googleTargetLang,
    languageLocked,
    currencyLocked,
  };
}

export function parsePreferencesCookie(
  raw: string | undefined | null,
): UserPreferences {
  if (!raw) return { ...defaultPreferences };
  try {
    let value = raw;
    try {
      value = decodeURIComponent(raw);
    } catch {
      value = raw;
    }
    const parsed = JSON.parse(value) as Partial<UserPreferences>;
    return normalizePreferences(parsed);
  } catch {
    return { ...defaultPreferences };
  }
}

export function serializePreferences(prefs: UserPreferences): string {
  return JSON.stringify(normalizePreferences(prefs));
}

export function preferencesCookieOptions() {
  return {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}
