"use client";

import { StorefrontTranslationBridge } from "@/components/locale/storefront-translation-bridge";

/**
 * Public storefront translation (Cloud DOM + Website Translator fallback).
 */
export function GoogleTranslateBridge() {
  return <StorefrontTranslationBridge />;
}
