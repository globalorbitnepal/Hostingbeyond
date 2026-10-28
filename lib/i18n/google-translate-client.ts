/** Client-only helpers for the free Google Website Translator (not Cloud API). */

export const GOOGTRANS_COOKIE = "googtrans";

/** Page source language for HostingBeyond public copy. */
export const GOOGLE_PAGE_LANGUAGE = "en";

export function googtransCookieValue(targetLang: string): string {
  const target = targetLang.trim();
  if (!target || target === GOOGLE_PAGE_LANGUAGE) {
    return `/${GOOGLE_PAGE_LANGUAGE}/${GOOGLE_PAGE_LANGUAGE}`;
  }
  return `/${GOOGLE_PAGE_LANGUAGE}/${target}`;
}

export function isGoogleTranslationActive(
  targetLang: string | undefined | null,
): boolean {
  if (!targetLang || targetLang === GOOGLE_PAGE_LANGUAGE) return false;
  return true;
}

/** Set googtrans on current host and parent domain (Google Translate convention). */
export function writeGoogtransCookie(targetLang: string) {
  if (typeof document === "undefined") return;
  const value = googtransCookieValue(targetLang);
  const base = `path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
  document.cookie = `${GOOGTRANS_COOKIE}=${value};${base}`;
  const host = window.location.hostname;
  if (host.includes(".")) {
    const root = host.split(".").slice(-2).join(".");
    document.cookie = `${GOOGTRANS_COOKIE}=${value};domain=.${root};${base}`;
  }
}

export function clearGoogtransCookie() {
  writeGoogtransCookie(GOOGLE_PAGE_LANGUAGE);
}

export function selectGoogleTranslateCombo(targetLang: string): boolean {
  if (typeof document === "undefined") return false;
  if (!isGoogleTranslationActive(targetLang)) return true;
  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (!combo) return false;
  const lang = targetLang === "zh-CN" ? "zh-CN" : targetLang;
  if (combo.value === lang) return true;
  combo.value = lang;
  combo.dispatchEvent(new Event("change"));
  return true;
}
