"use client";

import type { ReactNode } from "react";

import { useLocale } from "@/components/locale/locale-provider";
import { translatePhrase } from "@/lib/i18n/phrases";

export function CatalogPrice({
  usd,
  className,
}: {
  usd: number;
  className?: string;
}) {
  const { formatCatalogUsd } = useLocale();
  return (
    <span className={className} translate="no">
      {formatCatalogUsd(usd)}
    </span>
  );
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
