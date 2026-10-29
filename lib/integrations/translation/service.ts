import { shouldSkipCloudTranslation } from "@/lib/integrations/translation/skip-policy";
import {
  translateTextsWithGoogleCloud,
  type CloudTranslateFn,
  type GoogleCloudTranslateErrorCode,
} from "@/lib/integrations/translation/google-cloud";

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
  if (!result.ok) return result;
  pendingIndexes.forEach((itemIndex, i) => {
    const translated = result.translations[i] ?? items[itemIndex]!.original;
    items[itemIndex] = {
      original: items[itemIndex]!.original,
      translated,
      skipped: false,
    };
  });
  return { ok: true, items };
}
