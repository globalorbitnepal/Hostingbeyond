import type { LanguageCode } from "@/config/geo";
import { isGoogleTranslationActive } from "@/lib/i18n/google-translate-client";
import type { UserPreferences } from "@/lib/i18n/preferences";

/**
 * Server-rendered copy stays English when a Cloud Translation target is active.
 * The client runtime may rewrite visible text nodes after load.
 */
export function serverCopyLanguage(preferences: UserPreferences): LanguageCode {
  if (isGoogleTranslationActive(preferences.googleTargetLang)) {
    return "en";
  }
  return preferences.language;
}
