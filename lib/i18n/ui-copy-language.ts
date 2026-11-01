import type { LanguageCode } from "@/config/geo";
import {
  appLanguageForGoogle,
  getLocaleMarket,
} from "@/lib/i18n/hostinger-locale-markets";
import type { UserPreferences } from "@/lib/i18n/preferences";

/**
 * Languages with a full native storefront dictionary (no Cloud Translation pass).
 * Checkout and pricing copy must stay stable — Google Translate must not rewrite
 * currency codes or settlement sentences.
 */
export const NATIVE_STOREFRONT_LANGUAGES = new Set<LanguageCode>(["ne", "hi"]);

export function usesNativeStorefrontCopy(language: LanguageCode): boolean {
  return NATIVE_STOREFRONT_LANGUAGES.has(language);
}

/** Dictionary + HTML copy language for the visitor's selected market. */
export function resolveUiCopyLanguage(
  preferences: UserPreferences,
): LanguageCode {
  const market = getLocaleMarket(preferences.localeMarketId);
  if (market?.appLanguage) return market.appLanguage;
  return appLanguageForGoogle(preferences.googleTargetLang);
}
