import type { GoogleCloudTranslateResult } from "@/lib/integrations/translation/google-cloud";

function gtxTarget(code: string): string {
  return code === "zh-CN" ? "zh-CN" : code;
}

function parseGtxPayload(payload: unknown, expected: number): string[] | null {
  if (!Array.isArray(payload) || payload.length === 0) return null;
  const first = payload[0];
  if (!Array.isArray(first)) return null;
  const joined = first
    .map((row) =>
      Array.isArray(row) && typeof row[0] === "string" ? row[0] : "",
    )
    .join("");
  if (expected === 1) return [joined];
  return null;
}

async function translateOne(
  text: string,
  targetLanguage: string,
  fetchFn: typeof fetch,
): Promise<string> {
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", gtxTarget(targetLanguage));
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);
  const res = await fetchFn(url, { method: "GET", cache: "no-store" });
  if (!res.ok) {
    throw new Error(`gtx_http_${res.status}`);
  }
  const payload = (await res.json()) as unknown;
  const parsed = parseGtxPayload(payload, 1);
  if (!parsed?.[0]) {
    throw new Error("gtx_parse_failed");
  }
  return parsed[0];
}

/** Public Google Translate endpoint used when Cloud Translation v3 is not configured. */
export async function translateTextsWithGoogleGtx(
  texts: readonly string[],
  targetLanguage: string,
  fetchFn: typeof fetch = fetch,
): Promise<GoogleCloudTranslateResult> {
  if (texts.length === 0) return { ok: true, translations: [] };
  try {
    const translations = new Array<string>(texts.length);
    const concurrency = 6;
    for (let start = 0; start < texts.length; start += concurrency) {
      const slice = texts.slice(start, start + concurrency);
      const part = await Promise.all(
        slice.map((text) => translateOne(text, targetLanguage, fetchFn)),
      );
      for (let i = 0; i < part.length; i += 1) {
        translations[start + i] = part[i]!;
      }
    }
    if (translations.length !== texts.length) {
      return { ok: false, code: "translation_length_mismatch" };
    }
    return { ok: true, translations };
  } catch {
    return { ok: false, code: "translation_failed" };
  }
}
