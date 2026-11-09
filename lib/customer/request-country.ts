import { LOCALE_COOKIE, parsePreferencesCookie } from "@/lib/i18n/preferences";

/**
 * Best-effort country for a sign-in event.
 *
 * Order: edge/CDN geo headers (most accurate), then the customer's saved market
 * cookie. Returns a 2-letter ISO code or null. Never throws, never invents a
 * country — Orbit shows “—” when we genuinely do not know.
 */
export function resolveRequestCountry(request: {
  headers: Headers;
  cookies?: { get(name: string): { value: string } | undefined };
}): string | null {
  const headerCandidates = [
    "cf-ipcountry",
    "x-vercel-ip-country",
    "x-country-code",
    "x-geo-country",
  ];
  for (const name of headerCandidates) {
    const raw = request.headers.get(name)?.trim().toUpperCase();
    if (raw && /^[A-Z]{2}$/.test(raw) && raw !== "XX" && raw !== "T1") {
      return raw;
    }
  }
  const cookie = request.cookies?.get(LOCALE_COOKIE)?.value;
  if (cookie) {
    const code = parsePreferencesCookie(cookie).country?.toUpperCase();
    if (code && /^[A-Z]{2}$/.test(code)) return code;
  }
  return null;
}

/** Client IP as seen by the proxy; used for the Orbit login trail only. */
export function requestIp(request: { headers: Headers }): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  const candidate =
    first ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    "";
  return candidate ? candidate.slice(0, 64) : null;
}
