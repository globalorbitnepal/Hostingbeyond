import { BEYOND_MASTER_SYSTEM_PROMPT } from "@/lib/beyond-master/prompt";
import type { ConversationLocale } from "@/lib/beyond-master/locale";
import { localizedProviderError } from "@/lib/beyond-master/messages/provider-errors";
import type { BeyondMasterChatTurn } from "@/lib/beyond-master/request";
import type { BeyondMasterRuntimeConfig } from "@/lib/beyond-master/settings";
import {
  classifyGeminiErrorBody,
  classifyGeminiHttpStatus,
  geminiEventsFromFrame,
  geminiGenerateOnce,
  geminiHeaders,
  geminiPayload,
  geminiStreamUrl,
  shouldAttemptGeminiGenerateFallback,
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
    | "unavailable"
    | "model_unavailable";

  constructor(
    code:
      | "timeout"
      | "unauthorized"
      | "rate_limited"
      | "upstream"
      | "empty"
      | "aborted"
      | "unavailable"
      | "model_unavailable",
    message: string,
  ) {
    super(message);
    this.name = "BeyondMasterProviderError";
    this.code = code;
  }
}

export function publicProviderError(
  error: unknown,
  customerLocale?: ConversationLocale | null,
): string {
  return localizedProviderError(error, customerLocale);
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
    if (!(error instanceof BeyondMasterProviderError)) {
      throw error;
    }
    if (
      error.code === "aborted" ||
      error.code === "unauthorized" ||
      error.code === "unavailable" ||
      error.code === "rate_limited" ||
      error.code === "model_unavailable" ||
      error.code === "timeout" ||
      !shouldAttemptGeminiGenerateFallback(error.code)
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
    if (config.provider === "google" && (!response.ok || !response.body)) {
      const bodyText = await response.text();
      const kind = classifyGeminiHttpStatus(response.status, bodyText);
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
