import {
  readTranslationCache,
  writeTranslationCache,
} from "@/lib/integrations/translation/cache";
import {
  translateTextsWithGoogleCloud,
  type CloudTranslateFn,
  type GoogleCloudTranslateErrorCode,
} from "@/lib/integrations/translation/google-cloud";
import { translateTextsWithGoogleGtx } from "@/lib/integrations/translation/google-gtx";
import { translateTextsWithMyMemory } from "@/lib/integrations/translation/google-mymemory";
import { shouldSkipCloudTranslation } from "@/lib/integrations/translation/skip-policy";

export type PreparedTranslation = {
  original: string;
  translated: string;
  skipped: boolean;
};

type ProviderResult = { ok: true; translations: string[] };

/**
 * Provider order: paid Cloud Translation when configured, then the batched
 * public Google endpoint (fast, no key), then MyMemory as a last resort.
 */
async function runProviders(
  texts: string[],
  targetLanguage: string,
  env: Record<string, string | undefined>,
  translateFn?: CloudTranslateFn,
): Promise<
  ProviderResult | { ok: false; code: GoogleCloudTranslateErrorCode }
> {
  const cloud = await translateTextsWithGoogleCloud(
    texts,
    targetLanguage,
    env,
    translateFn,
  );
  if (cloud.ok) return cloud;
  if (translateFn) return cloud;

  const gtx = await translateTextsWithGoogleGtx(texts, targetLanguage);
  if (gtx.ok) return gtx;

  const memory = await translateTextsWithMyMemory(texts, targetLanguage);
  if (memory.ok) return memory;

  return cloud.ok ? cloud : { ok: false, code: cloud.code };
}

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

  /** Memo hits (repeat navigation) skip the upstream call entirely. */
  const memo = new Map<string, string>();
  for (const item of items) {
    if (item.skipped) continue;
    const hit = readTranslationCache(targetLanguage, item.original);
    if (hit) memo.set(item.original, hit);
  }

  const pendingIndexes = items
    .map((item, index) =>
      item.skipped || memo.has(item.original) ? -1 : index,
    )
    .filter((index) => index >= 0);

  if (pendingIndexes.length === 0) {
    for (const item of items) {
      const hit = memo.get(item.original);
      if (hit) item.translated = hit;
    }
    return { ok: true, items };
  }

  const pendingTexts = pendingIndexes.map((index) => items[index]!.original);
  const resolved = await runProviders(
    pendingTexts,
    targetLanguage,
    env,
    translateFn,
  );
  if (!resolved.ok) return resolved;

  pendingIndexes.forEach((itemIndex, i) => {
    const original = items[itemIndex]!.original;
    const translated = resolved.translations[i] ?? original;
    items[itemIndex] = { original, translated, skipped: false };
    if (translated && translated !== original) {
      writeTranslationCache(targetLanguage, original, translated);
    }
  });

  for (const item of items) {
    const hit = memo.get(item.original);
    if (hit) item.translated = hit;
  }
  return { ok: true, items };
}
