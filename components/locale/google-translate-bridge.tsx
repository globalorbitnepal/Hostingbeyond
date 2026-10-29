"use client";

import { GoogleWebsiteTranslateRuntime } from "@/components/locale/google-website-translate-runtime";

/**
 * Live storefront translation uses Google Website Translator so copy is
 * translated in the browser. Cloud Translation remains available for Orbit.
 */
export function GoogleTranslateBridge() {
  return <GoogleWebsiteTranslateRuntime />;
}
