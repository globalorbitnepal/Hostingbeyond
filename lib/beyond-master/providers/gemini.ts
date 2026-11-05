import type { BeyondMasterChatTurn } from "@/lib/beyond-master/request";
import type { BeyondMasterRuntimeConfig } from "@/lib/beyond-master/settings";
import type { SseFrame } from "@/lib/beyond-master/providers/sse";
import type { ProviderStreamEvent } from "@/lib/beyond-master/providers/sse";

export type GeminiFailureCode =
  "unauthorized" | "rate_limited" | "upstream" | "empty" | "unavailable";

export const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta";

/** Default Flash model on the Gemini free tier (override with BEYOND_MASTER_AI_MODEL). */
export const GEMINI_DEFAULT_MODEL = "gemini-2.5-flash";

export function geminiGenerateUrl(config: BeyondMasterRuntimeConfig): string {
  const model = encodeURIComponent(config.model!);
  return `${GEMINI_API_BASE}/models/${model}:generateContent`;
}

export function geminiStreamUrl(config: BeyondMasterRuntimeConfig): string {
  const model = encodeURIComponent(config.model!);
  return `${GEMINI_API_BASE}/models/${model}:streamGenerateContent?alt=sse`;
}

export function geminiHeaders(apiKey: string): HeadersInit {
  return {
    "content-type": "application/json",
    "x-goog-api-key": apiKey,
  };
}

export function geminiPayload(
  config: BeyondMasterRuntimeConfig,
  messages: BeyondMasterChatTurn[],
  systemPrompt: string,
) {
  const contents = messages.map((turn) => ({
    role: turn.role === "assistant" ? "model" : "user",
    parts: [{ text: turn.content }],
  }));
  return {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      maxOutputTokens: config.maxOutputTokens,
    },
  };
}

export function classifyGeminiErrorBody(bodyText: string): GeminiFailureCode {
  const text = bodyText.toLowerCase();
  if (/api.?key|api_key_invalid|permission|forbidden/.test(text)) {
    return "unauthorized";
  }
  if (/resource_exhausted|rate.?limit|quota/.test(text)) {
    return "rate_limited";
  }
  if (
    /failed_precondition|free tier|not available in your country|enable billing|billing on your project/.test(
      text,
    )
  ) {
    return "unavailable";
  }
  return "upstream";
}

export async function geminiGenerateOnce(
  config: BeyondMasterRuntimeConfig,
  messages: BeyondMasterChatTurn[],
  systemPrompt: string,
  fetchImpl: typeof fetch = fetch,
): Promise<
  | {
      ok: true;
      text: string;
      promptTokens?: number;
      completionTokens?: number;
    }
  | { ok: false; code: GeminiFailureCode }
> {
  const response = await fetchImpl(geminiGenerateUrl(config), {
    method: "POST",
    headers: geminiHeaders(config.apiKey!),
    body: JSON.stringify(geminiPayload(config, messages, systemPrompt)),
  });
  const bodyText = await response.text();
  if (!response.ok) {
    return { ok: false, code: classifyGeminiErrorBody(bodyText) };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    return { ok: false, code: "upstream" };
  }
  const row = parsed as {
    candidates?: {
      content?: { parts?: { text?: unknown; thought?: unknown }[] };
    }[];
    usageMetadata?: {
      promptTokenCount?: unknown;
      candidatesTokenCount?: unknown;
    };
  };
  const parts = row.candidates?.[0]?.content?.parts ?? [];
  let text = "";
  for (const part of parts) {
    if (part.thought === true) continue;
    if (typeof part.text === "string") text += part.text;
  }
  if (!text.trim()) {
    return { ok: false, code: "empty" };
  }
  const prompt = row.usageMetadata?.promptTokenCount;
  const completion = row.usageMetadata?.candidatesTokenCount;
  return {
    ok: true,
    text,
    promptTokens: typeof prompt === "number" ? prompt : undefined,
    completionTokens: typeof completion === "number" ? completion : undefined,
  };
}

export function geminiEventsFromFrame(
  frame: SseFrame,
): ProviderStreamEvent[] | "done" {
  if (frame.data === "[DONE]") return "done";
  let parsed: unknown;
  try {
    parsed = JSON.parse(frame.data);
  } catch {
    return [];
  }
  if (!parsed || typeof parsed !== "object") return [];
  const row = parsed as {
    error?: { message?: unknown };
    candidates?: {
      content?: { parts?: { text?: unknown; thought?: unknown }[] };
    }[];
    usageMetadata?: {
      promptTokenCount?: unknown;
      candidatesTokenCount?: unknown;
    };
  };
  if (row.error && typeof row.error.message === "string" && row.error.message) {
    return [];
  }
  const events: ProviderStreamEvent[] = [];
  const parts = row.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.thought === true) continue;
    if (typeof part.text === "string" && part.text) {
      events.push({ type: "delta", text: part.text });
    }
  }
  const prompt = row.usageMetadata?.promptTokenCount;
  const completion = row.usageMetadata?.candidatesTokenCount;
  if (typeof prompt === "number" || typeof completion === "number") {
    events.push({
      type: "usage",
      promptTokens: typeof prompt === "number" ? prompt : undefined,
      completionTokens: typeof completion === "number" ? completion : undefined,
    });
  }
  return events;
}
