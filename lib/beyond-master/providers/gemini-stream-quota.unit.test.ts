import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  GEMINI_DEFAULT_MODEL,
  classifyGeminiHttpStatus,
  shouldAttemptGeminiGenerateFallback,
} from "@/lib/beyond-master/providers/gemini";
import {
  BeyondMasterProviderError,
  publicProviderError,
  streamBeyondMasterProvider,
} from "@/lib/beyond-master/providers/stream";
import type { BeyondMasterRuntimeConfig } from "@/lib/beyond-master/settings";
import {
  readBeyondMasterRuntimeConfig,
  beyondMasterAdminStatus,
} from "@/lib/beyond-master/settings";
import {
  trimBeyondMasterProviderContext,
  BEYOND_MASTER_PROVIDER_CONTEXT_TURNS,
} from "@/lib/beyond-master/request";
import { detectGroundedTopic } from "@/lib/beyond-master/grounded";

const googleConfig: BeyondMasterRuntimeConfig = {
  configured: true,
  provider: "google",
  model: "gemini-flash-lite-latest",
  baseUrl: "https://generativelanguage.googleapis.com/v1beta",
  apiKey: "gemini-test-key",
  timeoutMs: 200,
  maxOutputTokens: 32,
  rateLimit: 5,
  rateWindowMs: 60_000,
  configurationError: null,
};

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function sseBody(text: string) {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    },
  });
}

describe("gemini free tier defaults", () => {
  it("defaults to gemini-flash-lite-latest when only GEMINI_API_KEY is set", () => {
    const config = readBeyondMasterRuntimeConfig({
      GEMINI_API_KEY: "gemini-test-key",
    });
    assert.equal(config.model, GEMINI_DEFAULT_MODEL);
    assert.equal(config.model, "gemini-flash-lite-latest");
    assert.equal(config.provider, "google");
  });

  it("honors BEYOND_MASTER_AI_MODEL override", () => {
    const config = readBeyondMasterRuntimeConfig({
      GEMINI_API_KEY: "gemini-test-key",
      BEYOND_MASTER_AI_MODEL: "gemini-flash-lite-latest",
    });
    assert.equal(config.model, "gemini-flash-lite-latest");
  });

  it("does not expose a secondary paid fallback model in admin status", () => {
    const status = beyondMasterAdminStatus({
      GEMINI_API_KEY: "gemini-test-key",
    });
    assert.equal(status.geminiFreeTierDefaultModel, "gemini-flash-lite-latest");
    assert.equal("fallbackModel" in status, false);
  });
});

describe("gemini stream quota and fallback", () => {
  it("returns streamed text when stream is 200", async () => {
    const chunks: string[] = [];
    for await (const event of streamBeyondMasterProvider({
      config: googleConfig,
      messages: [{ role: "user", content: "Hello" }],
      signal: new AbortController().signal,
      fetchImpl: async (url) => {
        assert.match(String(url), /streamGenerateContent/);
        return new Response(
          sseBody(
            'data: {"candidates":[{"content":{"parts":[{"text":"Stream ok"}]}}]}\n\n',
          ),
          { status: 200 },
        );
      },
    })) {
      if (event.type === "delta") chunks.push(event.text);
    }
    assert.equal(chunks.join(""), "Stream ok");
  });

  it("falls back to generateContent on stream 503 with the same model", async () => {
    const urls: string[] = [];
    const chunks: string[] = [];
    for await (const event of streamBeyondMasterProvider({
      config: googleConfig,
      messages: [{ role: "user", content: "Hello" }],
      signal: new AbortController().signal,
      fetchImpl: async (url) => {
        urls.push(String(url));
        if (String(url).includes("streamGenerateContent")) {
          return new Response("high demand", { status: 503 });
        }
        return jsonResponse(200, {
          candidates: [{ content: { parts: [{ text: "Generate ok" }] } }],
        });
      },
    })) {
      if (event.type === "delta") chunks.push(event.text);
    }
    assert.equal(chunks.join(""), "Generate ok");
    assert.equal(
      urls.filter((u) => u.includes("streamGenerateContent")).length,
      1,
    );
    assert.equal(
      urls.filter(
        (u) => u.includes(":generateContent") && !u.includes("stream"),
      ).length,
      1,
    );
    assert.equal(
      urls.every((u) => u.includes("gemini-flash-lite-latest")),
      true,
    );
  });

  it("does not call generateContent after stream 429", async () => {
    const urls: string[] = [];
    await assert.rejects(
      async () => {
        for await (const event of streamBeyondMasterProvider({
          config: googleConfig,
          messages: [{ role: "user", content: "Hello" }],
          signal: new AbortController().signal,
          fetchImpl: async (url) => {
            urls.push(String(url));
            return new Response("quota", { status: 429 });
          },
        })) {
          void event;
        }
      },
      (error: unknown) =>
        error instanceof BeyondMasterProviderError &&
        error.code === "rate_limited",
    );
    assert.equal(urls.length, 1);
    assert.match(urls[0]!, /streamGenerateContent/);
  });

  it("does not call generateContent after stream RESOURCE_EXHAUSTED body", async () => {
    const urls: string[] = [];
    await assert.rejects(
      async () => {
        for await (const event of streamBeyondMasterProvider({
          config: googleConfig,
          messages: [{ role: "user", content: "Hello" }],
          signal: new AbortController().signal,
          fetchImpl: async (url) => {
            urls.push(String(url));
            return jsonResponse(429, {
              error: {
                code: 429,
                status: "RESOURCE_EXHAUSTED",
                message: "Quota exceeded",
              },
            });
          },
        })) {
          void event;
        }
      },
      (error: unknown) =>
        error instanceof BeyondMasterProviderError &&
        error.code === "rate_limited",
    );
    assert.equal(urls.length, 1);
  });

  it("maps generate 429 to rate_limited after empty stream", async () => {
    const urls: string[] = [];
    await assert.rejects(
      async () => {
        for await (const event of streamBeyondMasterProvider({
          config: googleConfig,
          messages: [{ role: "user", content: "Hello" }],
          signal: new AbortController().signal,
          fetchImpl: async (url) => {
            urls.push(String(url));
            if (String(url).includes("streamGenerateContent")) {
              return new Response(sseBody('data: {"candidates":[]}\n\n'), {
                status: 200,
              });
            }
            return jsonResponse(429, {
              error: {
                code: 429,
                status: "RESOURCE_EXHAUSTED",
                message: "Quota exceeded",
              },
            });
          },
        })) {
          void event;
        }
      },
      (error: unknown) =>
        error instanceof BeyondMasterProviderError &&
        error.code === "rate_limited",
    );
    assert.equal(urls.length, 2);
  });

  it("does not switch models on stream 404 and only calls generate once", async () => {
    const urls: string[] = [];
    await assert.rejects(
      async () => {
        for await (const event of streamBeyondMasterProvider({
          config: googleConfig,
          messages: [{ role: "user", content: "Hello" }],
          signal: new AbortController().signal,
          fetchImpl: async (url) => {
            urls.push(String(url));
            return jsonResponse(404, {
              error: {
                code: 404,
                status: "NOT_FOUND",
                message: "models/gemini-flash-lite-latest not found",
              },
            });
          },
        })) {
          void event;
        }
      },
      (error: unknown) =>
        error instanceof BeyondMasterProviderError &&
        error.code === "model_unavailable",
    );
    assert.equal(urls.length, 1);
    assert.equal(
      urls.some((u) => /gemini-3|pro|gpt|anthropic/i.test(u)),
      false,
    );
  });

  it("returns safe errors when both stream and generate fail", async () => {
    await assert.rejects(
      async () => {
        for await (const event of streamBeyondMasterProvider({
          config: googleConfig,
          messages: [{ role: "user", content: "Hello" }],
          signal: new AbortController().signal,
          fetchImpl: async (url) => {
            if (String(url).includes("streamGenerateContent")) {
              return new Response("busy", { status: 503 });
            }
            return jsonResponse(500, {
              error: { status: "INTERNAL", message: "upstream" },
            });
          },
        })) {
          void event;
        }
      },
      (error: unknown) =>
        error instanceof BeyondMasterProviderError && error.code === "upstream",
    );
  });
});

describe("public provider quota messages", () => {
  it("shows the approved English quota message", () => {
    const message = publicProviderError(
      new BeyondMasterProviderError("rate_limited", "quota"),
      "en",
    );
    assert.match(message, /available usage limit/);
    assert.equal(message.includes("billing"), false);
  });

  it("shows the approved Hindi quota message", () => {
    const message = publicProviderError(
      new BeyondMasterProviderError("rate_limited", "quota"),
      "hi",
    );
    assert.match(message, /उपलब्ध उपयोग सीमा/);
    assert.equal(message.includes("billing"), false);
  });

  it("shows the approved Nepali quota message", () => {
    const message = publicProviderError(
      new BeyondMasterProviderError("rate_limited", "quota"),
      "ne",
    );
    assert.match(message, /उपलब्ध प्रयोग सीमा/);
    assert.match(message, /केही समयपछि/);
    assert.match(message, /टोलीसँग/);
    assert.equal(/keihi|samaypachhi/i.test(message), false);
  });

  it("rejects non-Google providers for live AI Agent configuration", () => {
    const config = readBeyondMasterRuntimeConfig({
      BEYOND_MASTER_AI_PROVIDER: "openai",
      BEYOND_MASTER_AI_MODEL: "gpt-test",
      BEYOND_MASTER_AI_API_KEY: "sk-test",
    });
    assert.equal(config.configured, false);
    assert.equal(config.configurationError, "provider");
  });
});

describe("provider context trimming", () => {
  it("keeps only the most recent turns for the model", () => {
    const messages = Array.from({ length: 20 }, (_, index) => ({
      role: index % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `turn-${index}`,
    }));
    const trimmed = trimBeyondMasterProviderContext(messages);
    assert.equal(trimmed.length, BEYOND_MASTER_PROVIDER_CONTEXT_TURNS);
    assert.equal(trimmed[0]?.content, "turn-8");
  });
});

describe("grounded public topic detection", () => {
  it("detects DNS questions without requiring account data", () => {
    assert.equal(detectGroundedTopic("How do I add an A record?"), "dns");
  });
});

describe("gemini error classification helpers", () => {
  it("classifies HTTP 503 as upstream eligible for one generate fallback", () => {
    assert.equal(classifyGeminiHttpStatus(503, ""), "upstream");
    assert.equal(shouldAttemptGeminiGenerateFallback("upstream"), true);
  });

  it("classifies RESOURCE_EXHAUSTED as rate_limited without fallback", () => {
    assert.equal(
      classifyGeminiHttpStatus(
        429,
        JSON.stringify({ error: { status: "RESOURCE_EXHAUSTED" } }),
      ),
      "rate_limited",
    );
    assert.equal(shouldAttemptGeminiGenerateFallback("rate_limited"), false);
  });
});
