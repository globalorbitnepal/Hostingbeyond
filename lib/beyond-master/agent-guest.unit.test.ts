import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { shouldSkipGeminiForGuest } from "@/lib/beyond-master/agent-guest";

describe("guest deterministic path", () => {
  it("skips Gemini when catalog tools succeed", () => {
    assert.equal(
      shouldSkipGeminiForGuest({
        lastMessage: "Compare hosting plans",
        toolCalls: [{ tool: "get_hosting_plans", args: {} }],
        toolResults: [
          {
            ok: true,
            tool: "get_hosting_plans",
            data: { plans: [] },
          },
        ],
        domainResultCount: 0,
        hasCommerceProposal: false,
        hasCommerceNotice: false,
        grounded: {
          text: "fallback",
          domains: [],
          language: "en",
        },
      }),
      true,
    );
  });

  it("skips Gemini for grounded topic FAQ without tools", () => {
    assert.equal(
      shouldSkipGeminiForGuest({
        lastMessage: "How do MX records work?",
        toolCalls: [],
        toolResults: [],
        domainResultCount: 0,
        hasCommerceProposal: false,
        hasCommerceNotice: false,
        grounded: {
          text: "MX explanation",
          domains: [],
          language: "en",
        },
      }),
      true,
    );
  });

  it("does not skip when a commerce proposal is shown so the model can brief the customer", () => {
    assert.equal(
      shouldSkipGeminiForGuest({
        lastMessage: "Register example.com",
        toolCalls: [],
        toolResults: [],
        domainResultCount: 0,
        hasCommerceProposal: true,
        hasCommerceNotice: false,
        grounded: { text: "x", domains: [], language: "en" },
      }),
      false,
    );
  });
});
