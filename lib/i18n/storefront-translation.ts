/**
 * Public HTML is authored in English; the Google widget translates from this.
 */
const PAGE_LANGUAGE = "en";

/** Visitor selected a non-English website language. */
export function isNonEnglishWebsiteLanguage(
  targetLang: string | undefined | null,
): boolean {
  if (!targetLang || targetLang === PAGE_LANGUAGE) return false;
  return true;
}

/**
 * Full-page Google Website Translator for every non-English storefront language,
 * including Nepali and Hindi. HTML stays English so the widget has a stable source;
 * prices and checkout notes are marked notranslate separately.
 */
export function shouldUseGoogleWebsiteTranslator(
  targetLang: string | undefined | null,
): boolean {
  return isNonEnglishWebsiteLanguage(targetLang);
}

/** Cloud DOM fallback when the Google widget cannot rewrite the page. */
export function shouldUseCloudDomTranslation(
  targetLang: string | undefined | null,
): boolean {
  return isNonEnglishWebsiteLanguage(targetLang);
}

export type StorefrontTranslationBackend = "cloud" | "widget" | "none";

/**
 * Prefer the Google widget so the *entire* page translates. Cloud DOM is only
 * used when the widget is known to be unavailable.
 */
export function pickStorefrontTranslationBackend(
  targetLang: string | undefined | null,
  cloudAvailable: boolean,
): StorefrontTranslationBackend {
  if (!isNonEnglishWebsiteLanguage(targetLang)) return "none";
  void cloudAvailable;
  return "widget";
}
