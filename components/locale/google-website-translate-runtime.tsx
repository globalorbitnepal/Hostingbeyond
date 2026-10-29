"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useLocale } from "@/components/locale/locale-provider";
import {
  GOOGLE_PAGE_LANGUAGE,
  GOOGLE_TRANSLATE_ELEMENT_ID,
  bootGoogleWebsiteTranslator,
  clearGoogtransCookie,
  installReactGoogleTranslateGuards,
  isGoogleTranslationActive,
  pageIsGoogleTranslated,
  selectGoogleTranslateCombo,
  writeGoogtransCookie,
} from "@/lib/i18n/google-translate-client";
import { PUBLIC_ENGLISH_ONLY } from "@/lib/i18n/public-language";

export function GoogleWebsiteTranslateRuntime() {
  const { preferences } = useLocale();
  const pathname = usePathname();
  const target = preferences.googleTargetLang ?? GOOGLE_PAGE_LANGUAGE;
  const skip =
    PUBLIC_ENGLISH_ONLY ||
    pathname.startsWith("/orbit") ||
    pathname.startsWith("/api/orbit");

  useEffect(() => {
    installReactGoogleTranslateGuards();
  }, []);

  useEffect(() => {
    if (skip || !isGoogleTranslationActive(target)) {
      clearGoogtransCookie();
      if (pageIsGoogleTranslated()) {
        window.location.reload();
      }
      return;
    }

    writeGoogtransCookie(target);
    bootGoogleWebsiteTranslator();

    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (selectGoogleTranslateCombo(target) || tries > 24) {
        window.clearInterval(timer);
      }
    }, 250);

    return () => window.clearInterval(timer);
  }, [skip, target, pathname]);

  return (
    <div
      id={GOOGLE_TRANSLATE_ELEMENT_ID}
      aria-hidden
      className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
    />
  );
}
