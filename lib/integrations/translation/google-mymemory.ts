import type { GoogleCloudTranslateResult } from "@/lib/integrations/translation/google-cloud";

function mymemoryPair(targetLanguage: string): string {
  if (targetLanguage === "zh-CN") return "en|zh-CN";
  return `en|${targetLanguage}`;
}

type MyMemoryResponse = {
  responseStatus?: number | string;
  responseData?: { translatedText?: string };
};

async function translateOne(
  text: string,
  targetLanguage: string,
  fetchFn: typeof fetch,
): Promise<string> {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", mymemoryPair(targetLanguage));
  const res = await fetchFn(url, {
    method: "GET",
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`mymemory_http_${res.status}`);
  }
  const payload = (await res.json()) as MyMemoryResponse;
  const status = Number(payload.responseStatus);
  const translated = payload.responseData?.translatedText?.trim() ?? "";
  if (status !== 200 || !translated) {
    throw new Error("mymemory_empty");
  }
  if (/^MYMEMORY WARNING/i.test(translated)) {
    throw new Error("mymemory_quota");
  }
  return translated;
}

export async function translateTextsWithMyMemory(
  texts: readonly string[],
  targetLanguage: string,
  fetchFn: typeof fetch = fetch,
): Promise<GoogleCloudTranslateResult> {
  if (texts.length === 0) return { ok: true, translations: [] };
  try {
    const translations = new Array<string>(texts.length);
    const concurrency = 4;
    for (let start = 0; start < texts.length; start += concurrency) {
      const slice = texts.slice(start, start + concurrency);
      const part = await Promise.all(
        slice.map((text) => translateOne(text, targetLanguage, fetchFn)),
      );
      for (let i = 0; i < part.length; i += 1) {
        translations[start + i] = part[i]!;
      }
    }
    return { ok: true, translations };
  } catch {
    return { ok: false, code: "translation_failed" };
  }
}
