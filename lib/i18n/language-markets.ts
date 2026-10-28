import type { LanguageCode } from "@/config/geo";

/** Public language picker labels (locale × region). Extend when adding languages. */
export type LanguageMarketOption = {
  code: LanguageCode;
  title: string;
  region: string;
};

export const LANGUAGE_MARKET_OPTIONS: LanguageMarketOption[] = [
  { code: "en", title: "English", region: "United States" },
  { code: "hi", title: "हिन्दी", region: "India" },
];

export function languageMarketOption(code: LanguageCode): LanguageMarketOption {
  return (
    LANGUAGE_MARKET_OPTIONS.find((o) => o.code === code) ??
    LANGUAGE_MARKET_OPTIONS[0]
  );
}

/** Compact trigger label in header pill */
export function languageTriggerLabel(code: LanguageCode): string {
  const opt = languageMarketOption(code);
  if (code === "en") return "English (US)";
  if (code === "hi") return "हिन्दी (India)";
  return `${opt.title} (${opt.region})`;
}
