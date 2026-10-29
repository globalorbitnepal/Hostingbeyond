import { shouldSkipCloudTranslation } from "@/lib/integrations/translation/skip-policy";
import {
  translateTextsWithGoogleCloud,
  type CloudTranslateFn,
  type GoogleCloudTranslateErrorCode,
} from "@/lib/integrations/translation/google-cloud";
import { translateTextsWithGoogleGtx } from "@/lib/integrations/translation/google-gtx";
import { translateTextsWithMyMemory } from "@/lib/integrations/translation/google-mymemory";

export type PreparedTranslation = {
  original: string;
  translated: string;
  skipped: boolean;
};

export async function prepareCloudTranslations(
  texts: readonly string[],
  targetLanguage: string,
  env: Record<string, string | undefined> = process.env,
  translateFn?: CloudTranslateFn,
): Promise<
  | { ok: true; items: PreparedTranslation[] }
  | {
      ok: false;
      code: GoogleCloudTranslateErrorCode;
    }
> {
  const items: PreparedTranslation[] = texts.map((original) => ({
    original,
    translated: original,
    skipped: shouldSkipCloudTranslation(original),
  }));
  const pendingIndexes = items
    .map((item, index) => (item.skipped ? -1 : index))
    .filter((index) => index >= 0);
  if (pendingIndexes.length === 0) {
    return { ok: true, items };
  }
  const pendingTexts = pendingIndexes.map((index) => items[index]!.original);
  const result = await translateTextsWithGoogleCloud(
    pendingTexts,
    targetLanguage,
    env,
    translateFn,
  );
  let resolved = result;
  if (!resolved.ok && !translateFn) {
    const memory = await translateTextsWithMyMemory(
      pendingTexts,
      targetLanguage,
    );
    if (memory.ok) resolved = memory;
    else if (resolved.code === "translation_not_configured") {
      resolved = await translateTextsWithGoogleGtx(
        pendingTexts,
        targetLanguage,
      );
    }
  }
  if (!resolved.ok) return resolved;
  pendingIndexes.forEach((itemIndex, i) => {
    const translated = resolved.translations[i] ?? items[itemIndex]!.original;
    items[itemIndex] = {
      original: items[itemIndex]!.original,
      translated,
      skipped: false,
    };
  });
  return { ok: true, items };
}
