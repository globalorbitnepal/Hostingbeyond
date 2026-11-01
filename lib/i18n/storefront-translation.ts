import type { LanguageCode } from "@/config/geo";
import { GOOGLE_PAGE_LANGUAGE } from "@/lib/i18n/google-translate-client";
import { appLanguageForGoogle } from "@/lib/i18n/hostinger-locale-markets";
import {
  resolveUiCopyLanguage,
  usesNativeStorefrontCopy,
} from "@/lib/i18n/ui-copy-language";
import type { UserPreferences } from "@/lib/i18n/preferences";

/** Visitor selected a non-English website language. */
export function isNonEnglishWebsiteLanguage(
  targetLang: string | undefined | null,
): boolean {
  if (!targetLang || targetLang === GOOGLE_PAGE_LANGUAGE) return false;
  return true;
}

/** Free Google Website Translator widget (English HTML → target). Skip for native SSR locales. */
export function shouldUseGoogleWebsiteTranslator(
  targetLang: string | undefined | null,
): boolean {
  if (!isNonEnglishWebsiteLanguage(targetLang)) return false;
  return !usesNativeStorefrontCopy(appLanguageForGoogle(targetLang as string));
}

/** Cloud DOM translation (API with GTX / MyMemory fallbacks). All non-English targets. */
export function shouldUseCloudDomTranslation(
  targetLang: string | undefined | null,
): boolean {
  return isNonEnglishWebsiteLanguage(targetLang);
}

export function usesNativeStorefrontDictionary(
  preferences: UserPreferences,
): boolean {
  return usesNativeStorefrontCopy(resolveUiCopyLanguage(preferences));
}

export type StorefrontTranslationBackend = "cloud" | "widget" | "none";

export function pickStorefrontTranslationBackend(
  targetLang: string | undefined | null,
  cloudAvailable: boolean,
): StorefrontTranslationBackend {
  if (!isNonEnglishWebsiteLanguage(targetLang)) return "none";
  if (shouldUseCloudDomTranslation(targetLang) && cloudAvailable) {
    return "cloud";
  }
  if (shouldUseGoogleWebsiteTranslator(targetLang)) return "widget";
  if (usesNativeStorefrontCopy(appLanguageForGoogle(targetLang ?? "en"))) {
    return cloudAvailable ? "cloud" : "none";
  }
  return "none";
}
