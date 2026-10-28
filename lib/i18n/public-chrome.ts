import type { LanguageCode } from "@/config/geo";
import { localizeCopyTree } from "@/lib/i18n/localize-copy-tree";
import { serverCopyLanguage } from "@/lib/i18n/server-copy-language";
import { getRequestPreferences } from "@/lib/i18n/server-locale";
import { getHomeSections, getSiteSettings } from "@/lib/orbit/content";

/** Header/footer navigation + site settings, localized for the visitor cookie. */
export async function getLocalizedPublicChrome() {
  const [rawSections, rawSettings, preferences] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
    getRequestPreferences(),
  ]);
  const language = serverCopyLanguage(preferences);
  return {
    preferences,
    sections: localizeCopyTree(language, rawSections),
    settings: localizeCopyTree(language, rawSettings),
  };
}

export function localizePublicContent<T>(language: LanguageCode, data: T): T {
  return localizeCopyTree(language, data);
}

/** CMS/public copy respecting Google Translate vs manual i18n. */
export function localizeForPreferences<T>(
  preferences: Awaited<ReturnType<typeof getRequestPreferences>>,
  data: T,
): T {
  return localizeCopyTree(serverCopyLanguage(preferences), data);
}
