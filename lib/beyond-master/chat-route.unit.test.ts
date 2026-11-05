import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { POST } from "@/app/api/beyond-master/chat/route";
import { setBeyondMasterChatTestOverride } from "@/lib/beyond-master/chat-test-hook";
import { beyondMasterAdminStatus } from "@/lib/beyond-master/settings";

describe("beyond master chat route", () => {
  it("answers from grounded Agent help when no language model is configured", async () => {
    const previous = {
      provider: process.env.BEYOND_MASTER_AI_PROVIDER,
      model: process.env.BEYOND_MASTER_AI_MODEL,
      key: process.env.BEYOND_MASTER_AI_API_KEY,
    };
    delete process.env.BEYOND_MASTER_AI_PROVIDER;
    delete process.env.BEYOND_MASTER_AI_MODEL;
    delete process.env.BEYOND_MASTER_AI_API_KEY;
    try {
      const response = await POST(
        new Request("http://localhost/api/beyond-master/chat", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-real-ip": "198.51.100.20",
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: "Help me with DNS" }],
          }),
        }),
      );
      const text = await response.text();
      assert.equal(response.status, 200);
      assert.match(text, /event: delta/);
      assert.match(text, /account\/my-domains/);
      assert.equal(text.includes("provider_not_configured"), false);
      assert.equal(text.includes("registered"), false);
    } finally {
      if (previous.provider === undefined)
        delete process.env.BEYOND_MASTER_AI_PROVIDER;
      else process.env.BEYOND_MASTER_AI_PROVIDER = previous.provider;
      if (previous.model === undefined)
        delete process.env.BEYOND_MASTER_AI_MODEL;
      else process.env.BEYOND_MASTER_AI_MODEL = previous.model;
      if (previous.key === undefined)
        delete process.env.BEYOND_MASTER_AI_API_KEY;
      else process.env.BEYOND_MASTER_AI_API_KEY = previous.key;
    }
  });

  it("streams adapter deltas and stops the test override afterwards", async () => {
    let systemPrompt = "";
    setBeyondMasterChatTestOverride(async function* (input) {
      systemPrompt = input.systemPrompt;
      yield { type: "delta", text: "Check the A record." };
      yield { type: "usage", promptTokens: 2, completionTokens: 3 };
    });
    try {
      const response = await POST(
        new Request("http://localhost/api/beyond-master/chat", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-real-ip": "198.51.100.21",
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: "What is an A record?" }],
          }),
        }),
      );
      const text = await response.text();
      assert.match(text, /event: delta/);
      assert.match(text, /Check the A record/);
      assert.match(text, /event: done/);
      assert.match(systemPrompt, /Conversation language:/);
      assert.match(systemPrompt, /AI Agent/);
      assert.match(systemPrompt, /A, AAAA, CNAME, MX, TXT, NS, and SRV/);
      assert.equal(systemPrompt.includes("Category billing"), false);
      assert.equal(systemPrompt.includes("sk-"), false);
    } finally {
      setBeyondMasterChatTestOverride(null);
    }
  });
});

describe("orbit beyond master status", () => {
  it("shows configuration without the API key", () => {
    const secret = "sk-orbit-secret";
    const status = beyondMasterAdminStatus({
      BEYOND_MASTER_AI_PROVIDER: "openai",
      BEYOND_MASTER_AI_MODEL: "gpt-test",
      BEYOND_MASTER_AI_API_KEY: secret,
    });
    assert.equal(JSON.stringify(status).includes(secret), false);
    assert.equal(status.credentialsPresent, true);
  });
});
