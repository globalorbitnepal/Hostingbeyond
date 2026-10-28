"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

import { useLocale } from "@/components/locale/locale-provider";
import {
  GOOGLE_PAGE_LANGUAGE,
  clearGoogtransCookie,
  isGoogleTranslationActive,
  selectGoogleTranslateCombo,
  writeGoogtransCookie,
} from "@/lib/i18n/google-translate-client";
import { PUBLIC_ENGLISH_ONLY } from "@/lib/i18n/public-language";

const RETRY_DELAYS_MS = [0, 350, 800, 1500, 2800];

/**
 * Loads Google’s website translator (free embed), hides the default bar,
 * and syncs language with hb_prefs via googtrans cookie + combo select.
 */
export function GoogleTranslateBridge() {
  const { preferences } = useLocale();
  const pathname = usePathname();
  const [translateReady, setTranslateReady] = useState(false);
  const target = preferences.googleTargetLang ?? GOOGLE_PAGE_LANGUAGE;
  const disabled =
    PUBLIC_ENGLISH_ONLY ||
    pathname.startsWith("/orbit") ||
    pathname.startsWith("/api/orbit");

  useEffect(() => {
    if (disabled) {
      clearGoogtransCookie();
      return;
    }
    if (!isGoogleTranslationActive(target)) {
      writeGoogtransCookie(GOOGLE_PAGE_LANGUAGE);
      return;
    }
    writeGoogtransCookie(target);
  }, [target, disabled]);

  useEffect(() => {
    const onReady = () => setTranslateReady(true);
    document.addEventListener("hb-google-translate-ready", onReady);
    return () =>
      document.removeEventListener("hb-google-translate-ready", onReady);
  }, []);

  useEffect(() => {
    if (disabled || !translateReady) return;
    if (!isGoogleTranslationActive(target)) return;

    const run = () => selectGoogleTranslateCombo(target);
    run();
    const timers = RETRY_DELAYS_MS.slice(1).map((ms) =>
      window.setTimeout(run, ms),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [target, pathname, translateReady, disabled]);

  if (disabled) {
    return null;
  }

  return (
    <>
      <div id="google_translate_element" className="sr-only" aria-hidden />
      <Script
        id="google-translate-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
window.googleTranslateElementInit = function () {
  if (!window.google || !window.google.translate) return;
  new window.google.translate.TranslateElement(
    {
      pageLanguage: '${GOOGLE_PAGE_LANGUAGE}',
      autoDisplay: false,
      includedLanguages: 'en,hi,es,de,fr,pt,it,ja,ko,zh-CN,ar,nl,pl,tr,vi,th,id,uk,ro,hu,cs,sk,hr,el,he,bn,da,sv,no,fi,et,lv,lt',
      layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
    },
    'google_translate_element',
  );
  document.dispatchEvent(new Event('hb-google-translate-ready'));
};`,
        }}
      />
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
}
