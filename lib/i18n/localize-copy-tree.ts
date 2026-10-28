import type { LanguageCode } from "@/config/geo";
import { translatePhrase } from "@/lib/i18n/phrases";

const SKIP_KEYS = new Set([
  "href",
  "imageUrl",
  "logoPath",
  "ogImagePath",
  "tld",
  "id",
  "slug",
  "icon",
  "code",
  "loginHref",
  "getStartedHref",
  "url",
  "path",
  "email",
  "phone",
  "twitter",
  "linkedin",
  "facebook",
  "locale",
  "twitterHandle",
  "name",
]);

function shouldTranslateValue(key: string, value: string): boolean {
  if (SKIP_KEYS.has(key)) return false;
  if (!value.trim()) return false;
  if (/^https?:\/\//i.test(value)) return false;
  if (/^[\w.-]+@[\w.-]+\.\w+$/.test(value)) return false;
  if (/^\/[\w./?=&%-]*$/.test(value) && value.includes("/")) return false;
  if (/^[\d$.,+\s%]+$/.test(value)) return false;
  if (/^\.[a-z0-9-]+$/i.test(value)) return false;
  return true;
}

/** Walk CMS-like objects and translate visible English strings when language ≠ en. */
export function localizeCopyTree<T>(language: LanguageCode, value: T): T {
  if (language === "en") return value;
  if (typeof value === "string") {
    return translatePhrase(language, value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => localizeCopyTree(language, item)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      if (typeof nested === "string") {
        out[key] = shouldTranslateValue(key, nested)
          ? translatePhrase(language, nested)
          : nested;
      } else {
        out[key] = localizeCopyTree(language, nested);
      }
    }
    return out as T;
  }
  return value;
}
