import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseBeyondMasterChatRequest } from "@/lib/beyond-master/request";
import { allowBeyondMasterChat } from "@/lib/beyond-master/rate-limit";

describe("beyond master request validation", () => {
  it("rejects account identifiers supplied by the browser", () => {
    const parsed = parseBeyondMasterChatRequest({
      customerId: "someone-else",
      messages: [{ role: "user", content: "Show my invoices" }],
    });
    assert.equal(parsed.ok, false);
  });

  it("requires the latest turn to be the customer", () => {
    const parsed = parseBeyondMasterChatRequest({
      messages: [{ role: "assistant", content: "Hello" }],
    });
    assert.equal(parsed.ok, false);
  });

  it("accepts a short customer question", () => {
    const parsed = parseBeyondMasterChatRequest({
      messages: [{ role: "user", content: "  How do I add an A record?  " }],
    });
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.equal(parsed.messages[0]?.content, "How do I add an A record?");
      assert.equal(parsed.model, null);
    }
  });

  it("parses an optional model name without accepting client ids", () => {
    const parsed = parseBeyondMasterChatRequest({
      model: "gpt-test",
      messages: [{ role: "user", content: "Hello" }],
    });
    assert.equal(parsed.ok, true);
    if (parsed.ok) assert.equal(parsed.model, "gpt-test");
  });
});

describe("beyond master rate limit", () => {
  it("blocks the next request after the configured window is full", () => {
    const env = {
      BEYOND_MASTER_AI_RATE_LIMIT: "2",
      BEYOND_MASTER_AI_RATE_WINDOW_MS: "60000",
    };
    const request = () =>
      new Request("http://localhost/api/beyond-master/chat", {
        headers: { "x-real-ip": "203.0.113.10" },
      });
    assert.equal(allowBeyondMasterChat(request(), env), true);
    assert.equal(allowBeyondMasterChat(request(), env), true);
    assert.equal(allowBeyondMasterChat(request(), env), false);
  });
});
