/**
 * Single storefront language registry. Country/currency markets are separate.
 * Codes match Cloud Translation v3 (ko, id, zh-CN).
 */
export const WEBSITE_LANGUAGE_CODES = [
  "en",
  "bn",
  "pt",
  "fr",
  "zh-CN",
  "de",
  "hi",
  "ja",
  "ne",
  "ru",
  "es",
  "ko",
  "id",
] as const;

export type WebsiteLanguageCode = (typeof WEBSITE_LANGUAGE_CODES)[number];

export type WebsiteLanguage = {
  code: WebsiteLanguageCode;
  englishName: string;
  nativeName: string;
  triggerCode: string;
  /** ISO country code for circular flag in the language picker (not storefront country). */
  flagCountryCode: string;
  isDefault: boolean;
};

export type WebsiteLanguageStatus = WebsiteLanguage & { enabled: boolean };

export const DEFAULT_WEBSITE_LANGUAGE_CODE: WebsiteLanguageCode = "en";

export const WEBSITE_LANGUAGES: readonly WebsiteLanguage[] = [
  {
    code: "en",
    englishName: "English",
    nativeName: "English",
    triggerCode: "EN",
    flagCountryCode: "US",
    isDefault: true,
  },
  {
    code: "bn",
    englishName: "Bengali",
    nativeName: "বাংলা",
    triggerCode: "BN",
    flagCountryCode: "BD",
    isDefault: false,
  },
  {
    code: "pt",
    englishName: "Portuguese",
    nativeName: "Português",
    triggerCode: "PT",
    flagCountryCode: "BR",
    isDefault: false,
  },
  {
    code: "fr",
    englishName: "French",
    nativeName: "Français",
    triggerCode: "FR",
    flagCountryCode: "FR",
    isDefault: false,
  },
  {
    code: "zh-CN",
    englishName: "Simplified Chinese",
    nativeName: "简体中文",
    triggerCode: "ZH",
    flagCountryCode: "CN",
    isDefault: false,
  },
  {
    code: "de",
    englishName: "German",
    nativeName: "Deutsch",
    triggerCode: "DE",
    flagCountryCode: "DE",
    isDefault: false,
  },
  {
    code: "hi",
    englishName: "Hindi",
    nativeName: "हिन्दी",
    triggerCode: "HI",
    flagCountryCode: "IN",
    isDefault: false,
  },
  {
    code: "ja",
    englishName: "Japanese",
    nativeName: "日本語",
    triggerCode: "JA",
    flagCountryCode: "JP",
    isDefault: false,
  },
  {
    code: "ne",
    englishName: "Nepali",
    nativeName: "नेपाली",
    triggerCode: "NE",
    flagCountryCode: "NP",
    isDefault: false,
  },
  {
    code: "ru",
    englishName: "Russian",
    nativeName: "Русский",
    triggerCode: "RU",
    flagCountryCode: "RU",
    isDefault: false,
  },
  {
    code: "es",
    englishName: "Spanish",
    nativeName: "Español",
    triggerCode: "ES",
    flagCountryCode: "ES",
    isDefault: false,
  },
  {
    code: "ko",
    englishName: "Korean",
    nativeName: "한국어",
    triggerCode: "KO",
    flagCountryCode: "KR",
    isDefault: false,
  },
  {
    code: "id",
    englishName: "Indonesian",
    nativeName: "Bahasa Indonesia",
    triggerCode: "ID",
    flagCountryCode: "ID",
    isDefault: false,
  },
];

const byCode = new Map(
  WEBSITE_LANGUAGES.map((row) => [row.code, row] as const),
);

export function isWebsiteLanguageCode(
  value: unknown,
): value is WebsiteLanguageCode {
  return typeof value === "string" && byCode.has(value as WebsiteLanguageCode);
}

export function websiteLanguageByCode(
  code: string | null | undefined,
): WebsiteLanguage | undefined {
  if (!code) return undefined;
  return byCode.get(code as WebsiteLanguageCode);
}

/** Circular flag for the language tab (English → US). */
export function websiteLanguageFlagCountryCode(
  code: string | null | undefined,
): string {
  return websiteLanguageByCode(code)?.flagCountryCode ?? "US";
}

export function translationTargetCodes(): WebsiteLanguageCode[] {
  return WEBSITE_LANGUAGES.filter((row) => !row.isDefault).map(
    (row) => row.code,
  );
}

export function defaultEnabledLanguageCodes(): WebsiteLanguageCode[] {
  return WEBSITE_LANGUAGES.map((row) => row.code);
}

/** English is always enabled. Unknown codes are dropped. Registry order is kept. */
export function normalizeEnabledLanguageCodes(
  input: unknown,
): WebsiteLanguageCode[] {
  const allowed = new Set<WebsiteLanguageCode>(WEBSITE_LANGUAGE_CODES);
  const picked = new Set<WebsiteLanguageCode>([DEFAULT_WEBSITE_LANGUAGE_CODE]);
  if (Array.isArray(input)) {
    for (const raw of input) {
      if (typeof raw === "string" && allowed.has(raw as WebsiteLanguageCode)) {
        picked.add(raw as WebsiteLanguageCode);
      }
    }
  } else {
    return defaultEnabledLanguageCodes();
  }
  return WEBSITE_LANGUAGES.map((row) => row.code).filter((code) =>
    picked.has(code),
  );
}

export function withLanguageEnabledStatus(
  enabledCodes: unknown,
): WebsiteLanguageStatus[] {
  const enabled = new Set(normalizeEnabledLanguageCodes(enabledCodes));
  return WEBSITE_LANGUAGES.map((row) => ({
    ...row,
    enabled: enabled.has(row.code),
  }));
}

export function resolveWebsiteLanguageCode(
  code: unknown,
  enabledCodes?: unknown,
): WebsiteLanguageCode {
  const enabled = new Set(
    enabledCodes === undefined
      ? defaultEnabledLanguageCodes()
      : normalizeEnabledLanguageCodes(enabledCodes),
  );
  if (isWebsiteLanguageCode(code) && enabled.has(code)) {
    return code;
  }
  return DEFAULT_WEBSITE_LANGUAGE_CODE;
}

export function googleTranslateIncludedLanguages(): string {
  return WEBSITE_LANGUAGE_CODES.join(",");
}

export function isTranslationTargetAllowed(
  code: string,
  enabledCodes: unknown,
): boolean {
  if (!isWebsiteLanguageCode(code) || code === DEFAULT_WEBSITE_LANGUAGE_CODE) {
    return false;
  }
  return normalizeEnabledLanguageCodes(enabledCodes).includes(code);
}

/** Merge enabled codes onto SiteSettings without touching other fields. */
export function withEnabledWebsiteLanguages<
  T extends { websiteLanguageEnabledCodes?: string[] },
>(settings: T, enabledCodes: unknown): T {
  return {
    ...settings,
    websiteLanguageEnabledCodes: normalizeEnabledLanguageCodes(enabledCodes),
  };
}
