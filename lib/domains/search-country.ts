import { parsePreferencesCookie } from "@/lib/i18n/preferences";
import { LOCALE_COOKIE } from "@/lib/i18n/preferences";
import { normalizeCountryCode } from "@/lib/domains/customer-tld-priority";

export function countryFromSearchBody(
  body: { country?: string } | null | undefined,
): string | null {
  return normalizeCountryCode(body?.country);
}

export function countryFromRequest(
  request: Request,
  body?: { country?: string } | null,
): string | null {
  const fromBody = countryFromSearchBody(body);
  if (fromBody) return fromBody;

  const rawCookie = request.headers.get("cookie") ?? "";
  const match = rawCookie.match(
    new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]*)`),
  );
  if (!match?.[1]) return null;
  try {
    const prefs = parsePreferencesCookie(match[1]);
    return normalizeCountryCode(prefs.country);
  } catch {
    return null;
  }
}
