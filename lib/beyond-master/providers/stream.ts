import { BEYOND_MASTER_SYSTEM_PROMPT } from "@/lib/beyond-master/prompt";
import type { AgentLanguage } from "@/lib/beyond-master/language";
import type { BeyondMasterChatTurn } from "@/lib/beyond-master/request";
import type { BeyondMasterRuntimeConfig } from "@/lib/beyond-master/settings";
import {
  classifyGeminiErrorBody,
  geminiEventsFromFrame,
  geminiGenerateOnce,
  geminiHeaders,
  geminiPayload,
  geminiStreamUrl,
} from "@/lib/beyond-master/providers/gemini";
import {
  anthropicEventsFromFrame,
  createSseParser,
  openAiEventsFromFrame,
  type ProviderStreamEvent,
} from "@/lib/beyond-master/providers/sse";

export class BeyondMasterProviderError extends Error {
  readonly code:
    | "timeout"
    | "unauthorized"
    | "rate_limited"
    | "upstream"
    | "empty"
    | "aborted"
    | "unavailable";

  constructor(
    code:
      | "timeout"
      | "unauthorized"
      | "rate_limited"
      | "upstream"
      | "empty"
      | "aborted"
      | "unavailable",
    message: string,
  ) {
    super(message);
    this.name = "BeyondMasterProviderError";
    this.code = code;
  }
}

export function publicProviderError(
  error: unknown,
  customerLanguage?: AgentLanguage,
): string {
  const lang = customerLanguage ?? "en";
  if (error instanceof BeyondMasterProviderError) {
    if (error.code === "timeout") {
      if (lang === "hi")
        return "AI प्रदाता ने समय पर जवाब नहीं दिया। थोड़ी देर बाद फिर कोशिश करें।";
      if (lang === "ne")
        return "AI प्रदायकले समयमै जवाफ दिएन। केही बेरपछि फेरि प्रयास गर्नुहोस्।";
      return "The AI provider did not answer in time. Please try again shortly.";
    }
    if (error.code === "unauthorized") {
      if (lang === "hi")
        return "AI सहायता अस्थायी रूप से उपलब्ध नहीं है। हमारी सपोर्ट टीम से संपर्क करें।";
      if (lang === "ne")
        return "AI सहयोग अस्थायी रूपमा उपलब्ध छैन। कृपया सहयोग टोलीसँग सम्पर्क गर्नुहोस्।";
      return "AI support is temporarily unavailable. Please contact our support team.";
    }
    if (error.code === "rate_limited") {
      if (lang === "hi")
        return "AI सहायता अभी व्यस्त है। कुछ देर बाद फिर कोशिश करें, या सपोर्ट टिकट खोलें।";
      if (lang === "ne")
        return "AI सहयोग अहिले व्यस्त छ। केही बेरपछि फेरि प्रयास गर्नुहोस्, वा सहयोग टिकट खोल्नुहोस्।";
      return "AI support is busy right now. Try again shortly, or open a support ticket.";
    }
    if (error.code === "empty") {
      if (lang === "hi") return "AI से खाली जवाब मिला। फिर से भेजें।";
      if (lang === "ne") return "AI बाट खाली जवाफ आयो। फेरि पठाउनुहोस्।";
      return "The AI returned an empty reply. Please send your message again.";
    }
    if (error.code === "aborted") {
      if (lang === "hi") return "अनुरोध रद्द कर दिया गया।";
      if (lang === "ne") return "अनुरोध रद्द गरियो।";
      return "The request was cancelled.";
    }
    if (error.code === "unavailable") {
      if (lang === "hi")
        return "AI सहायता इस क्षेत्र या बिलिंग सेटअप के कारण उपलब्ध नहीं है। Google AI Studio में बिलिंग जांचें।";
      if (lang === "ne")
        return "AI सहयोग यस क्षेत्र वा बिलिङ सेटअपका कारण उपलब्ध छैन। Google AI Studio मा बिलिङ जाँच गर्नुहोस्।";
      return "AI support is unavailable for this region or billing setup. Check billing in Google AI Studio.";
    }
  }
  if (lang === "hi")
    return "AI जवाब पूरा नहीं हो सका। फिर कोशिश करें या सपोर्ट से संपर्क करें।";
  if (lang === "ne")
    return "AI जवाफ पूरा हुन सकेन। फेरि प्रयास गर्नुहोस् वा सहयोगमा सम्पर्क गर्नुहोस्।";
  return "The AI could not complete this reply. Try again or contact support.";
}

type StreamInput = {
  config: BeyondMasterRuntimeConfig;
  messages: BeyondMasterChatTurn[];
  signal: AbortSignal;
  systemPrompt?: string;
  fetchImpl?: typeof fetch;
  retryDelayMs?: number;
};

export async function* streamBeyondMasterProvider(
  input: StreamInput,
): AsyncGenerator<ProviderStreamEvent> {
  if (input.config.provider === "google") {
    yield* streamGoogleProvider(input);
    return;
  }
  const run = () => streamOnce(input);
  try {
    const iterator = run();
    const first = await iterator.next();
    if (first.done) return;
    yield first.value;
    yield* iterator;
  } catch (error) {
    if (!isRetryable(error) || input.signal.aborted) throw error;
    if (input.retryDelayMs) {
      await new Promise((resolve) => setTimeout(resolve, input.retryDelayMs));
    }
    yield* run();
  }
}

function isRetryable(error: unknown) {
  return (
    error instanceof BeyondMasterProviderError &&
    (error.code === "upstream" || error.code === "rate_limited")
  );
}

async function* streamGoogleProvider(
  input: StreamInput,
): AsyncGenerator<ProviderStreamEvent> {
  try {
    yield* streamOnce(input);
  } catch (error) {
    if (
      !(error instanceof BeyondMasterProviderError) ||
      error.code === "aborted" ||
      error.code === "unauthorized" ||
      error.code === "unavailable"
    ) {
      throw error;
    }
    const fallback = await geminiGenerateOnce(
      input.config,
      input.messages,
      input.systemPrompt ?? BEYOND_MASTER_SYSTEM_PROMPT,
      input.fetchImpl,
    );
    if (!fallback.ok) {
      throw new BeyondMasterProviderError(
        fallback.code,
        "Gemini request failed.",
      );
    }
    yield { type: "delta", text: fallback.text };
    yield {
      type: "usage",
      promptTokens: fallback.promptTokens,
      completionTokens: fallback.completionTokens,
    };
  }
}

async function* streamOnce(
  input: StreamInput,
): AsyncGenerator<ProviderStreamEvent> {
  const config = input.config;
  if (
    !config.configured ||
    !config.provider ||
    !config.model ||
    !config.apiKey ||
    !config.baseUrl
  ) {
    throw new BeyondMasterProviderError(
      "upstream",
      "Provider is not configured.",
    );
  }
  const fetchImpl = input.fetchImpl ?? fetch;
  const timeout = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    timeout.abort();
  }, config.timeoutMs);
  const onAbort = () => timeout.abort();
  input.signal.addEventListener("abort", onAbort, { once: true });
  try {
    const url =
      config.provider === "google" ? geminiStreamUrl(config) : endpoint(config);
    const response = await fetchImpl(url, {
      method: "POST",
      headers:
        config.provider === "google"
          ? geminiHeaders(config.apiKey!)
          : headers(config),
      body: JSON.stringify(
        config.provider === "google"
          ? geminiPayload(
              config,
              input.messages,
              input.systemPrompt ?? BEYOND_MASTER_SYSTEM_PROMPT,
            )
          : payload(config, input.messages, input.systemPrompt),
      ),
      signal: timeout.signal,
    });
    if (
      response.status === 401 ||
      response.status === 403 ||
      (config.provider === "google" && response.status === 400)
    ) {
      if (config.provider !== "google" || response.status !== 400) {
        throw new BeyondMasterProviderError(
          "unauthorized",
          "Provider rejected credentials.",
        );
      }
      const bodyText = await response.text();
      const kind = classifyGeminiErrorBody(bodyText);
      throw new BeyondMasterProviderError(
        kind,
        `Provider status ${response.status}.`,
      );
    }
    if (response.status === 429) {
      throw new BeyondMasterProviderError(
        "rate_limited",
        "Provider rate limited the request.",
      );
    }
    if (!response.ok || !response.body) {
      throw new BeyondMasterProviderError(
        "upstream",
        `Provider status ${response.status}.`,
      );
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const parser = createSseParser();
    const map =
      config.provider === "anthropic"
        ? anthropicEventsFromFrame
        : config.provider === "google"
          ? geminiEventsFromFrame
          : openAiEventsFromFrame;
    let produced = false;
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      for (const frame of parser.push(
        decoder.decode(chunk.value, { stream: true }),
      )) {
        const mapped = map(frame);
        if (mapped === "done") return;
        for (const event of mapped) {
          if (event.type === "delta") produced = true;
          yield event;
        }
      }
    }
    if (!produced)
      throw new BeyondMasterProviderError(
        "empty",
        "Provider returned no text.",
      );
  } catch (error) {
    if (error instanceof BeyondMasterProviderError) throw error;
    if (timeout.signal.aborted || input.signal.aborted) {
      if (input.signal.aborted && !timedOut) {
        throw new BeyondMasterProviderError("aborted", "Cancelled.");
      }
      throw new BeyondMasterProviderError("timeout", "Timed out.");
    }
    throw new BeyondMasterProviderError("upstream", "Provider request failed.");
  } finally {
    clearTimeout(timer);
    input.signal.removeEventListener("abort", onAbort);
  }
}

function endpoint(config: BeyondMasterRuntimeConfig) {
  const base = config.baseUrl!;
  if (config.provider === "anthropic") return `${base}/v1/messages`;
  return `${base}/chat/completions`;
}

function headers(config: BeyondMasterRuntimeConfig): HeadersInit {
  if (config.provider === "anthropic") {
    return {
      "content-type": "application/json",
      "x-api-key": config.apiKey!,
      "anthropic-version": "2023-06-01",
    };
  }
  return {
    "content-type": "application/json",
    authorization: `Bearer ${config.apiKey}`,
  };
}

function payload(
  config: BeyondMasterRuntimeConfig,
  messages: BeyondMasterChatTurn[],
  systemPrompt = BEYOND_MASTER_SYSTEM_PROMPT,
) {
  if (config.provider === "anthropic") {
    return {
      model: config.model,
      max_tokens: config.maxOutputTokens,
      stream: true,
      system: systemPrompt,
      messages,
    };
  }
  return {
    model: config.model,
    max_tokens: config.maxOutputTokens,
    stream: true,
    stream_options: { include_usage: true },
    messages: [{ role: "system", content: systemPrompt }, ...messages],
  };
}
