"use client";

import { useCallback, useEffect, useState } from "react";

import { CloudTranslateRuntime } from "@/components/locale/cloud-translate-runtime";
import { GoogleWebsiteTranslateRuntime } from "@/components/locale/google-website-translate-runtime";
import { useLocale } from "@/components/locale/locale-provider";
import { GOOGLE_PAGE_LANGUAGE } from "@/lib/i18n/google-translate-client";
import {
  pickStorefrontTranslationBackend,
  type StorefrontTranslationBackend,
} from "@/lib/i18n/storefront-translation";
import { PUBLIC_ENGLISH_ONLY } from "@/lib/i18n/public-language";

/**
 * Storefront translation: Cloud DOM pass first (works for native Nepali/Hindi SSR
 * plus English fallbacks). Google Website Translator is the fallback for
 * German, Spanish, etc. when the translate API is unreachable.
 */
export function StorefrontTranslationBridge() {
  const { preferences } = useLocale();
  const target = preferences.googleTargetLang ?? GOOGLE_PAGE_LANGUAGE;
  const [cloudAvailable, setCloudAvailable] = useState(true);
  const [probed, setProbed] = useState(false);

  useEffect(() => {
    if (PUBLIC_ENGLISH_ONLY) {
      setCloudAvailable(false);
      setProbed(true);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/i18n/translate", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!res.ok) throw new Error("translate probe failed");
        await res.json();
        if (!cancelled) setCloudAvailable(true);
      } catch {
        if (!cancelled) setCloudAvailable(false);
      } finally {
        if (!cancelled) setProbed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onCloudUnavailable = useCallback(() => {
    setCloudAvailable(false);
  }, []);

  if (!probed || PUBLIC_ENGLISH_ONLY) return null;

  const backend: StorefrontTranslationBackend =
    pickStorefrontTranslationBackend(target, cloudAvailable);

  if (backend === "cloud") {
    return <CloudTranslateRuntime onUnavailable={onCloudUnavailable} />;
  }
  if (backend === "widget") {
    return <GoogleWebsiteTranslateRuntime />;
  }
  return null;
}
