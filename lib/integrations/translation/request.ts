import { z } from "zod";

import { googleTranslateIncludedLanguages } from "@/lib/i18n/website-languages";

export const TRANSLATE_MAX_STRINGS = 40;
export const TRANSLATE_MAX_CHARS_EACH = 500;
export const TRANSLATE_MAX_CHARS_TOTAL = 6_000;

const allowedTargets = new Set(
  googleTranslateIncludedLanguages()
    .split(",")
    .map((code) => code.trim())
    .filter(Boolean),
);

export const cloudTranslateRequestSchema = z.object({
  targetLanguage: z
    .string()
    .trim()
    .min(2)
    .max(12)
    .refine((code) => allowedTargets.has(code) && code !== "en", {
      message: "unsupported_target_language",
    }),
  texts: z
    .array(z.string().max(TRANSLATE_MAX_CHARS_EACH))
    .min(1)
    .max(TRANSLATE_MAX_STRINGS),
});

export type CloudTranslateRequest = z.infer<typeof cloudTranslateRequestSchema>;

export function totalTranslateChars(texts: readonly string[]): number {
  return texts.reduce((sum, text) => sum + text.length, 0);
}
