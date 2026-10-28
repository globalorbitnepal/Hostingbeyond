import type { CurrencyCode } from "@/config/pricing";
import {
  DEFAULT_COUNTRY,
  DEFAULT_CURRENCY,
  DEFAULT_LANGUAGE,
  getCountry,
  type LanguageCode,
} from "@/config/geo";

export const LOCALE_COOKIE = "hb_prefs";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export type UserPreferences = {
  country: string;
  language: LanguageCode;
  currency: CurrencyCode;
  /** True once the user explicitly picks a language (don't auto-overwrite). */
  languageLocked: boolean;
};

export const defaultPreferences: UserPreferences = {
  country: DEFAULT_COUNTRY,
  language: DEFAULT_LANGUAGE,
  currency: DEFAULT_CURRENCY,
  languageLocked: false,
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
  const countryCode =
    typeof input?.country === "string" && input.country.length === 2
      ? input.country.toUpperCase()
      : DEFAULT_COUNTRY;
  const country = getCountry(countryCode);
  const languageLocked = Boolean(input?.languageLocked);
  const language = isLanguageCode(input?.language)
    ? input.language
    : DEFAULT_LANGUAGE;
  const currency =
    typeof input?.currency === "string" && input.currency.length === 3
      ? (input.currency.toUpperCase() as CurrencyCode)
      : country.currency;

  return {
    country: country.code,
    language,
    currency,
    languageLocked,
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
