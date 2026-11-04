import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createSseParser,
  openAiEventsFromFrame,
} from "@/lib/beyond-master/providers/sse";
import {
  BeyondMasterProviderError,
  streamBeyondMasterProvider,
} from "@/lib/beyond-master/providers/stream";
import type { BeyondMasterRuntimeConfig } from "@/lib/beyond-master/settings";

const config: BeyondMasterRuntimeConfig = {
  configured: true,
  provider: "openai",
  model: "gpt-test",
  baseUrl: "https://example.test/v1",
  apiKey: "sk-test-super-secret-value",
  timeoutMs: 30,
  maxOutputTokens: 32,
  rateLimit: 5,
  rateWindowMs: 60_000,
  configurationError: null,
};

function sseBody(text: string) {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    },
  });
}

describe("beyond master provider stream", () => {
  it("assembles streamed OpenAI deltas and does not echo the key", async () => {
    let authorization = "";
    const chunks: string[] = [];
    for await (const event of streamBeyondMasterProvider({
      config,
      messages: [{ role: "user", content: "Hello" }],
      signal: new AbortController().signal,
      fetchImpl: async (_url, init) => {
        authorization = new Headers(init?.headers).get("authorization") ?? "";
        return new Response(
          sseBody(
            'data: {"choices":[{"delta":{"content":"Add "}}]}\n\n' +
              'data: {"choices":[{"delta":{"content":"an A record."}}],"usage":{"prompt_tokens":8,"completion_tokens":4}}\n\n' +
              "data: [DONE]\n\n",
          ),
          { status: 200 },
        );
      },
    })) {
      if (event.type === "delta") chunks.push(event.text);
    }
    assert.equal(chunks.join(""), "Add an A record.");
    assert.match(authorization, /^Bearer /);
    assert.equal(chunks.join("").includes("sk-test"), false);
  });

  it("sends the caller system prompt to the provider", async () => {
    let body = "";
    for await (const event of streamBeyondMasterProvider({
      config,
      messages: [{ role: "user", content: "Hello" }],
      systemPrompt: "Knowledge: A records use IPv4. Do not invent a price.",
      signal: new AbortController().signal,
      fetchImpl: async (_url, init) => {
        body = String(init?.body ?? "");
        return new Response(
          sseBody(
            'data: {"choices":[{"delta":{"content":"Use an A record."}}]}\n\n',
          ),
          { status: 200 },
        );
      },
    })) {
      if (event.type !== "delta") continue;
    }
    assert.match(body, /A records use IPv4/);
    assert.equal(body.includes(config.apiKey!), false);
  });

  it("retries one upstream failure and then streams", async () => {
    let calls = 0;
    const chunks: string[] = [];
    for await (const event of streamBeyondMasterProvider({
      config,
      messages: [{ role: "user", content: "Hello" }],
      signal: new AbortController().signal,
      retryDelayMs: 0,
      fetchImpl: async () => {
        calls += 1;
        if (calls === 1) return new Response("busy", { status: 503 });
        return new Response(
          sseBody('data: {"choices":[{"delta":{"content":"Retry ok"}}]}\n\n'),
          {
            status: 200,
          },
        );
      },
    })) {
      if (event.type === "delta") chunks.push(event.text);
    }
    assert.equal(calls, 2);
    assert.equal(chunks.join(""), "Retry ok");
  });

  it("times out without inventing a reply", async () => {
    const seen: string[] = [];
    await assert.rejects(
      async () => {
        for await (const event of streamBeyondMasterProvider({
          config,
          messages: [{ role: "user", content: "Hello" }],
          signal: new AbortController().signal,
          fetchImpl: (_url, init) =>
            new Promise((_resolve, reject) => {
              init?.signal?.addEventListener("abort", () => {
                reject(new DOMException("Aborted", "AbortError"));
              });
            }),
        })) {
          seen.push(event.type);
        }
      },
      (error: unknown) =>
        error instanceof BeyondMasterProviderError && error.code === "timeout",
    );
    assert.equal(seen.length, 0);
  });

  it("parses a split SSE frame", () => {
    const parser = createSseParser();
    const first = parser.push('data: {"choices":[{"delta":{"content":"Hi"}}]}');
    assert.equal(first.length, 0);
    const second = parser.push("\n\n");
    const events = second.flatMap((frame) => {
      const mapped = openAiEventsFromFrame(frame);
      return mapped === "done" ? [] : mapped;
    });
    assert.equal(events[0]?.type, "delta");
  });
});
