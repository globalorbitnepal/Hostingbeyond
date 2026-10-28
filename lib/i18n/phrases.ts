import type { LanguageCode } from "@/config/geo";

import { HI_PHRASES } from "@/lib/i18n/phrase-hi";

const BY_LANGUAGE: Partial<Record<LanguageCode, Record<string, string>>> = {
  hi: HI_PHRASES,
};

export function translatePhrase(language: LanguageCode, text: string): string {
  if (!text || language === "en") return text;
  const table = BY_LANGUAGE[language];
  if (!table) return text;
  return table[text] ?? text;
}
