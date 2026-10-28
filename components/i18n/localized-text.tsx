"use client";

import type { ReactNode } from "react";

import { useLocale } from "@/components/locale/locale-provider";
import { translatePhrase } from "@/lib/i18n/phrases";

export function CatalogPrice({ usd }: { usd: number }) {
  const { formatCatalogUsd } = useLocale();
  return <>{formatCatalogUsd(usd)}</>;
}

export function LocalizedText({
  text,
  children,
}: {
  text?: string;
  children?: ReactNode;
}) {
  const { preferences } = useLocale();
  if (typeof children === "string") {
    return <>{translatePhrase(preferences.language, children)}</>;
  }
  if (text) return <>{translatePhrase(preferences.language, text)}</>;
  return <>{children}</>;
}
