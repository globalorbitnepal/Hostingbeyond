import type { LanguageCode } from "@/config/geo";
import { isGoogleTranslationActive } from "@/lib/i18n/google-translate-client";
import type { UserPreferences } from "@/lib/i18n/preferences";
import { resolveUiCopyLanguage } from "@/lib/i18n/ui-copy-language";

/**
 * Server-rendered copy stays English when a Cloud Translation target is active.
 * Nepali/Hindi and other native storefronts use the matching dictionary instead.
 */
export function serverCopyLanguage(preferences: UserPreferences): LanguageCode {
  if (isGoogleTranslationActive(preferences.googleTargetLang)) {
    return "en";
  }
  return resolveUiCopyLanguage(preferences);
}
