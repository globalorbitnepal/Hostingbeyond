import type { BeyondMasterChatTurn } from "@/lib/beyond-master/request";
import type { BeyondMasterRuntimeConfig } from "@/lib/beyond-master/settings";
import type { SseFrame } from "@/lib/beyond-master/providers/sse";
import type { ProviderStreamEvent } from "@/lib/beyond-master/providers/sse";

export const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta";

/** Default Flash model on the Gemini free tier (override with BEYOND_MASTER_AI_MODEL). */
export const GEMINI_DEFAULT_MODEL = "gemini-2.5-flash";

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
    candidates?: {
      content?: { parts?: { text?: unknown }[] };
    }[];
    usageMetadata?: {
      promptTokenCount?: unknown;
      candidatesTokenCount?: unknown;
    };
  };
  const events: ProviderStreamEvent[] = [];
  const parts = row.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
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
