"use client";

import { useCallback, useState } from "react";

import { CloudTranslateRuntime } from "@/components/locale/cloud-translate-runtime";
import { GoogleWebsiteTranslateRuntime } from "@/components/locale/google-website-translate-runtime";
import { useLocale } from "@/components/locale/locale-provider";
import { GOOGLE_PAGE_LANGUAGE } from "@/lib/i18n/google-translate-client";
import { isNonEnglishWebsiteLanguage } from "@/lib/i18n/storefront-translation";
import { PUBLIC_ENGLISH_ONLY } from "@/lib/i18n/public-language";

/**
 * Full-site translation: boot Google Website Translator immediately so every
 * language (including Hindi/Nepali) rewrites the live DOM. Cloud DOM is a
 * fallback if the widget script never lands.
 */
export function StorefrontTranslationBridge() {
  const { preferences } = useLocale();
  const target = preferences.googleTargetLang ?? GOOGLE_PAGE_LANGUAGE;
  const [widgetFailed, setWidgetFailed] = useState(false);

  const onWidgetFailed = useCallback(() => {
    setWidgetFailed(true);
  }, []);

  if (PUBLIC_ENGLISH_ONLY || !isNonEnglishWebsiteLanguage(target)) {
    return null;
  }

  return (
    <>
      <GoogleWebsiteTranslateRuntime onFailed={onWidgetFailed} />
      {widgetFailed ? <CloudTranslateRuntime /> : null}
    </>
  );
}
