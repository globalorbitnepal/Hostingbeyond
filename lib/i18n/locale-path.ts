import {
  DEFAULT_WEBSITE_LANGUAGE_CODE,
  isWebsiteLanguageCode,
  type WebsiteLanguageCode,
} from "@/lib/i18n/website-languages";

/** First URL segment for each translatable language (English has no prefix). */
export const LOCALE_URL_SEGMENT_BY_LANGUAGE: Record<
  Exclude<WebsiteLanguageCode, "en">,
  string
> = {
  bn: "bn",
  pt: "pt",
  fr: "fr",
  "zh-CN": "zh",
  de: "de",
  hi: "hi",
  ja: "ja",
  ne: "ne",
  ru: "ru",
  es: "es",
  ko: "ko",
  id: "id",
};

const LANGUAGE_BY_URL_SEGMENT = new Map<string, WebsiteLanguageCode>(
  Object.entries(LOCALE_URL_SEGMENT_BY_LANGUAGE).map(([code, segment]) => [
    segment,
    code as WebsiteLanguageCode,
  ]),
);

export const LOCALE_URL_SEGMENTS = [
  ...new Set(Object.values(LOCALE_URL_SEGMENT_BY_LANGUAGE)),
] as string[];

const SKIP_LOCALE_PREFIX = [
  "/api",
  "/_next",
  "/orbit",
  "/account",
  "/images",
  "/favicon.ico",
] as const;

export function shouldApplyLocaleRouting(pathname: string): boolean {
  if (!pathname || pathname === "/") return true;
  if (pathname.includes(".")) return false;
  return !SKIP_LOCALE_PREFIX.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function websiteLanguageToUrlSegment(
  code: WebsiteLanguageCode,
): string | null {
  if (code === DEFAULT_WEBSITE_LANGUAGE_CODE) return null;
  return LOCALE_URL_SEGMENT_BY_LANGUAGE[
    code as Exclude<WebsiteLanguageCode, "en">
  ];
}

export function websiteLanguageFromUrlSegment(
  segment: string,
): WebsiteLanguageCode | null {
  const normalized = segment.trim().toLowerCase();
  const code = LANGUAGE_BY_URL_SEGMENT.get(normalized);
  return code ?? null;
}

export type ParsedLocalePath = {
  /** Language from the URL prefix, or English when absent. */
  language: WebsiteLanguageCode;
  /** Path without locale prefix (always starts with `/`). */
  pathname: string;
  /** Whether a locale segment was present. */
  hadPrefix: boolean;
};

export function stripLocalePrefixFromPath(pathname: string): ParsedLocalePath {
  const raw = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const parts = raw.split("/").filter(Boolean);
  if (parts.length === 0) {
    return {
      language: DEFAULT_WEBSITE_LANGUAGE_CODE,
      pathname: "/",
      hadPrefix: false,
    };
  }
  const first = parts[0]!;
  const fromUrl = websiteLanguageFromUrlSegment(first);
  if (!fromUrl) {
    return {
      language: DEFAULT_WEBSITE_LANGUAGE_CODE,
      pathname: raw,
      hadPrefix: false,
    };
  }
  const rest = parts.slice(1);
  return {
    language: fromUrl,
    pathname: rest.length ? `/${rest.join("/")}` : "/",
    hadPrefix: true,
  };
}

/** Public storefront path with optional locale prefix for SEO URLs. */
export function localizePublicPath(
  pathname: string,
  language: WebsiteLanguageCode,
): string {
  const { pathname: bare } = stripLocalePrefixFromPath(pathname);
  const segment = websiteLanguageToUrlSegment(language);
  if (!segment) return bare;
  if (bare === "/") return `/${segment}`;
  return `/${segment}${bare}`;
}

export function resolveLanguageForPublicRequest(
  pathname: string,
  cookieLang: unknown,
): WebsiteLanguageCode {
  const fromPath = stripLocalePrefixFromPath(pathname).language;
  if (fromPath !== DEFAULT_WEBSITE_LANGUAGE_CODE) return fromPath;
  if (isWebsiteLanguageCode(cookieLang)) return cookieLang;
  return DEFAULT_WEBSITE_LANGUAGE_CODE;
}

export const LOCALE_REWRITE_HEADER = "x-hb-locale-rewrite";

/**
 * Prefixed SEO URLs are rewritten to the English route.
 * Do not 307 unprefixed URLs back to the prefix — that loops with the rewrite.
 */
export function localePrefixRewritePath(pathname: string): string | null {
  const parsed = stripLocalePrefixFromPath(pathname);
  if (!parsed.hadPrefix) return null;
  return parsed.pathname;
}
