/** Client-only helpers for the free Google Website Translator. */

import { shouldUseGoogleWebsiteTranslator } from "@/lib/i18n/storefront-translation";
import { googleTranslateIncludedLanguages } from "@/lib/i18n/website-languages";

export const GOOGTRANS_COOKIE = "googtrans";
export const GOOGLE_TRANSLATE_ELEMENT_ID = "google_translate_element";
export const GOOGLE_TRANSLATE_SCRIPT_ID = "hb-google-translate-script";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (
          options: Record<string, unknown>,
          elementId: string,
        ) => unknown;
      };
    };
  }
}

/** Page source language for HostingBeyond public copy. */
export const GOOGLE_PAGE_LANGUAGE = "en";

export function googtransCookieValue(targetLang: string): string {
  const target = targetLang.trim();
  if (!target || target === GOOGLE_PAGE_LANGUAGE) {
    return `/${GOOGLE_PAGE_LANGUAGE}/${GOOGLE_PAGE_LANGUAGE}`;
  }
  return `/${GOOGLE_PAGE_LANGUAGE}/${target}`;
}

/** Host + parent domains Google may have used for a leftover googtrans cookie. */
export function googtransCookieDomains(hostname: string): string[] {
  const host = hostname.trim().toLowerCase();
  if (!host) return [];
  const domains = new Set<string>([host]);
  if (host.includes(".")) {
    domains.add(`.${host}`);
    const labels = host.split(".").filter(Boolean);
    if (labels.length >= 2) {
      domains.add(`.${labels.slice(-2).join(".")}`);
    }
  }
  return [...domains];
}

export function googtransCookieBase(
  https: boolean,
  maxAgeSeconds: number,
): string {
  const secure = https ? ";Secure" : "";
  return `path=/;max-age=${maxAgeSeconds};SameSite=Lax${secure}`;
}

export function isGoogleTranslationActive(
  targetLang: string | undefined | null,
): boolean {
  return shouldUseGoogleWebsiteTranslator(targetLang);
}

function expireGoogtransCookies() {
  if (typeof document === "undefined") return;
  const https = window.location.protocol === "https:";
  const expireVariants = [
    googtransCookieBase(https, 0),
    "path=/;max-age=0;SameSite=Lax",
    "path=/;max-age=0;SameSite=Lax;Secure",
  ];
  const domains = ["", ...googtransCookieDomains(window.location.hostname)];
  for (const domain of domains) {
    const domainPart = domain ? `;domain=${domain}` : "";
    for (const expire of expireVariants) {
      document.cookie = `${GOOGTRANS_COOKIE}=;${expire}${domainPart}`;
    }
  }
}

/** Set googtrans on current host and parent domain (Google Translate convention). */
export function writeGoogtransCookie(targetLang: string) {
  if (typeof document === "undefined") return;
  expireGoogtransCookies();
  const value = googtransCookieValue(targetLang);
  const https = window.location.protocol === "https:";
  const base = googtransCookieBase(https, 60 * 60 * 24 * 365);
  document.cookie = `${GOOGTRANS_COOKIE}=${value};${base}`;
  for (const domain of googtransCookieDomains(window.location.hostname)) {
    document.cookie = `${GOOGTRANS_COOKIE}=${value};domain=${domain};${base}`;
  }
}

export function clearGoogtransCookie() {
  writeGoogtransCookie(GOOGLE_PAGE_LANGUAGE);
}

export function googleTranslateComboLang(targetLang: string): string {
  return targetLang === "zh-CN" ? "zh-CN" : targetLang;
}

export function googleTranslateComboMatches(targetLang: string): boolean {
  if (typeof document === "undefined") return false;
  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  return combo?.value === googleTranslateComboLang(targetLang);
}

let googleTranslateGuardsInstalled = false;

/**
 * Google Translate rewrites the live DOM. React 19 then throws
 * NotFoundError on removeChild/insertBefore. Guard those ops.
 */
export function installReactGoogleTranslateGuards() {
  if (googleTranslateGuardsInstalled || typeof Node === "undefined") return;
  googleTranslateGuardsInstalled = true;
  const proto = Node.prototype;

  const removeChild = proto.removeChild;
  proto.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) return child;
    return removeChild.call(this, child) as T;
  };

  const insertBefore = proto.insertBefore;
  proto.insertBefore = function <T extends Node>(
    newNode: T,
    referenceNode: Node | null,
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      return newNode;
    }
    return insertBefore.call(this, newNode, referenceNode) as T;
  };
}

if (typeof window !== "undefined") {
  installReactGoogleTranslateGuards();
}

export function selectGoogleTranslateCombo(targetLang: string): boolean {
  if (typeof document === "undefined") return false;
  if (!isGoogleTranslationActive(targetLang)) return true;
  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (!combo) return false;
  const lang = googleTranslateComboLang(targetLang);
  if (combo.value !== lang) {
    combo.value = lang;
    combo.dispatchEvent(new Event("change", { bubbles: true }));
  }
  return combo.value === lang;
}

export function pageIsGoogleTranslated(): boolean {
  if (typeof document === "undefined") return false;
  const html = document.documentElement;
  const body = document.body;
  return (
    html.classList.contains("translated-ltr") ||
    html.classList.contains("translated-rtl") ||
    body.classList.contains("translated-ltr") ||
    body.classList.contains("translated-rtl")
  );
}

export function googleTranslateElementOptions(): Record<string, unknown> {
  return {
    pageLanguage: GOOGLE_PAGE_LANGUAGE,
    includedLanguages: googleTranslateIncludedLanguages(),
    autoDisplay: false,
    multilanguagePage: true,
  };
}

export function bootGoogleWebsiteTranslator() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  installReactGoogleTranslateGuards();
  window.googleTranslateElementInit = () => {
    const TranslateElement = window.google?.translate?.TranslateElement;
    const host = document.getElementById(GOOGLE_TRANSLATE_ELEMENT_ID);
    if (!TranslateElement || !host) return;
    if (host.childElementCount > 0) return;
    new TranslateElement(
      googleTranslateElementOptions(),
      GOOGLE_TRANSLATE_ELEMENT_ID,
    );
  };
  const existing = document.getElementById(GOOGLE_TRANSLATE_SCRIPT_ID);
  if (existing) {
    window.googleTranslateElementInit();
    return;
  }
  const script = document.createElement("script");
  script.id = GOOGLE_TRANSLATE_SCRIPT_ID;
  script.async = true;
  script.src =
    "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  document.body.appendChild(script);
}
