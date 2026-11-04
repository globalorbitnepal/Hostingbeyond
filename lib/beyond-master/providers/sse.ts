export type SseFrame = { event: string; data: string };

export function createSseParser() {
  let buffer = "";
  return {
    push(chunk: string): SseFrame[] {
      buffer += chunk.replace(/\r\n/g, "\n");
      const frames: SseFrame[] = [];
      while (true) {
        const split = buffer.indexOf("\n\n");
        if (split < 0) break;
        const raw = buffer.slice(0, split);
        buffer = buffer.slice(split + 2);
        const frame = parseSseFrame(raw);
        if (frame) frames.push(frame);
      }
      return frames;
    },
  };
}

export function parseSseFrame(raw: string): SseFrame | null {
  let event = "message";
  const data: string[] = [];
  for (const line of raw.split("\n")) {
    if (!line || line.startsWith(":")) continue;
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) data.push(line.slice(5).trimStart());
  }
  if (!data.length) return null;
  return { event, data: data.join("\n") };
}

export type ProviderStreamEvent =
  | { type: "delta"; text: string }
  | { type: "usage"; promptTokens?: number; completionTokens?: number };

export function openAiEventsFromFrame(
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
    choices?: { delta?: { content?: unknown } }[];
    usage?: { prompt_tokens?: unknown; completion_tokens?: unknown };
  };
  const events: ProviderStreamEvent[] = [];
  const text = row.choices?.[0]?.delta?.content;
  if (typeof text === "string" && text) events.push({ type: "delta", text });
  const prompt = row.usage?.prompt_tokens;
  const completion = row.usage?.completion_tokens;
  if (typeof prompt === "number" || typeof completion === "number") {
    events.push({
      type: "usage",
      promptTokens: typeof prompt === "number" ? prompt : undefined,
      completionTokens: typeof completion === "number" ? completion : undefined,
    });
  }
  return events;
}

export function anthropicEventsFromFrame(
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
    type?: string;
    delta?: { type?: string; text?: unknown; stop_reason?: unknown };
    usage?: { input_tokens?: unknown; output_tokens?: unknown };
    message?: { usage?: { input_tokens?: unknown; output_tokens?: unknown } };
  };
  if (row.type === "message_stop") return "done";
  const events: ProviderStreamEvent[] = [];
  if (row.type === "content_block_delta" && row.delta?.type === "text_delta") {
    if (typeof row.delta.text === "string" && row.delta.text) {
      events.push({ type: "delta", text: row.delta.text });
    }
  }
  const usage = row.usage ?? row.message?.usage;
  const prompt = usage?.input_tokens;
  const completion = usage?.output_tokens;
  if (typeof prompt === "number" || typeof completion === "number") {
    events.push({
      type: "usage",
      promptTokens: typeof prompt === "number" ? prompt : undefined,
      completionTokens: typeof completion === "number" ? completion : undefined,
    });
  }
  return events;
}
