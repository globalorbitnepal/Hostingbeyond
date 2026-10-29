"use client";

import { CloudTranslateRuntime } from "@/components/locale/cloud-translate-runtime";

/**
 * Storefront translation entry. The free website widget is not used:
 * it rewrote the DOM and crashed Next.js. Cloud Translation is server-only.
 */
export function GoogleTranslateBridge() {
  return <CloudTranslateRuntime />;
}
