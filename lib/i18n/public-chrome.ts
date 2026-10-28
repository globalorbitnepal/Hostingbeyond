import type { LanguageCode } from "@/config/geo";
import { localizeCopyTree } from "@/lib/i18n/localize-copy-tree";
import { getRequestPreferences } from "@/lib/i18n/server-locale";
import { getHomeSections, getSiteSettings } from "@/lib/orbit/content";

/** Header/footer navigation + site settings, localized for the visitor cookie. */
export async function getLocalizedPublicChrome() {
  const [rawSections, rawSettings, preferences] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
    getRequestPreferences(),
  ]);
  const language = preferences.language as LanguageCode;
  return {
    preferences,
    sections: localizeCopyTree(language, rawSections),
    settings: localizeCopyTree(language, rawSettings),
  };
}

export function localizePublicContent<T>(language: LanguageCode, data: T): T {
  return localizeCopyTree(language, data);
}
