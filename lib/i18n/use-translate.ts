"use client";

import { useCallback } from "react";

import { useLocale } from "@/components/locale/locale-provider";
import { translatePhrase } from "@/lib/i18n/phrases";

export function useTranslate() {
  const { preferences } = useLocale();
  return useCallback(
    (text: string) => translatePhrase(preferences.language, text),
    [preferences.language],
  );
}
