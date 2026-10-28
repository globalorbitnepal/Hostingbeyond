import type { LanguageCode } from "@/config/geo";
import { isGoogleTranslationActive } from "@/lib/i18n/google-translate-client";
import type { UserPreferences } from "@/lib/i18n/preferences";

/**
 * Server-rendered copy language: when Google Translate handles the target locale,
 * keep English HTML and let the widget translate client-side (avoids double translation).
 */
export function serverCopyLanguage(preferences: UserPreferences): LanguageCode {
  if (isGoogleTranslationActive(preferences.googleTargetLang)) {
    return "en";
  }
  return preferences.language;
}
