import type { GoogleCloudTranslateResult } from "@/lib/integrations/translation/google-cloud";

/** Upstream caps how many `q` values one request may carry. */
const MAX_QUERIES_PER_REQUEST = 40;

function gtxTarget(code: string): string {
  if (code === "zh-CN") return "zh-CN";
  if (code === "zh-TW") return "zh-TW";
  return code;
}

function asStringList(payload: unknown, expected: number): string[] | null {
  if (Array.isArray(payload)) {
    if (payload.length === 1 && Array.isArray(payload[0])) {
      const inner = asStringList(payload[0], expected);
      if (inner) return inner;
    }
    if (payload.every((row) => typeof row === "string")) {
      const list = payload as string[];
      if (list.length === expected) return list;
      if (expected === 1) return [list.join("")];
      return null;
    }
    return null;
  }
  if (typeof payload === "string" && expected === 1) return [payload];
  return null;
}

function parseSinglePayload(payload: unknown): string | null {
  if (!Array.isArray(payload) || payload.length === 0) return null;
  const first = payload[0];
  if (!Array.isArray(first)) return null;
  const joined = first
    .map((row) =>
      Array.isArray(row) && typeof row[0] === "string" ? row[0] : "",
    )
    .join("");
  return joined || null;
}

/** One HTTP request for up to 40 strings — the fast path. */
async function translateBatch(
  texts: readonly string[],
  targetLanguage: string,
  fetchFn: typeof fetch,
): Promise<string[]> {
  const url = new URL("https://translate.googleapis.com/translate_a/t");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", gtxTarget(targetLanguage));
  url.searchParams.set("dt", "t");
  const body = new URLSearchParams();
  for (const text of texts) body.append("q", text);
  const res = await fetchFn(url, {
    method: "POST",
    cache: "no-store",
    headers: {
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      accept: "application/json",
    },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`gtx_http_${res.status}`);
  const parsed = asStringList((await res.json()) as unknown, texts.length);
  if (!parsed) throw new Error("gtx_parse_failed");
  return parsed;
}

/** Per-string fallback used only when the batch endpoint is rejected. */
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
  if (!res.ok) throw new Error(`gtx_http_${res.status}`);
  const parsed = parseSinglePayload((await res.json()) as unknown);
  if (!parsed) throw new Error("gtx_parse_failed");
  return parsed;
}

/** Public Google Translate endpoint used when Cloud Translation v3 is not configured. */
export async function translateTextsWithGoogleGtx(
  texts: readonly string[],
  targetLanguage: string,
  fetchFn: typeof fetch = fetch,
): Promise<GoogleCloudTranslateResult> {
  if (texts.length === 0) return { ok: true, translations: [] };
  const translations = new Array<string>(texts.length);
  try {
    for (
      let start = 0;
      start < texts.length;
      start += MAX_QUERIES_PER_REQUEST
    ) {
      const slice = texts.slice(start, start + MAX_QUERIES_PER_REQUEST);
      const part = await translateBatch(slice, targetLanguage, fetchFn);
      for (let i = 0; i < part.length; i += 1) {
        translations[start + i] = part[i]!;
      }
    }
  } catch {
    try {
      for (let i = 0; i < texts.length; i += 1) {
        translations[i] = await translateOne(
          texts[i]!,
          targetLanguage,
          fetchFn,
        );
      }
    } catch {
      return { ok: false, code: "translation_failed" };
    }
  }
  if (translations.length !== texts.length || translations.some((t) => !t)) {
    return { ok: false, code: "translation_length_mismatch" };
  }
  return { ok: true, translations };
}
