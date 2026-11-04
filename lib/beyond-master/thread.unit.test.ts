import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { BEYOND_MASTER_PROVIDER_NOTICE } from "@/lib/beyond-master/copy";
import {
  appendProviderNotice,
  appendUserMessage,
  chatContext,
  createConversation,
  parseStoredConversations,
  validateDraft,
} from "@/lib/beyond-master/thread";

describe("beyond master thread", () => {
  it("keeps assistant replies and drops invented status notices", () => {
    const conversation = appendUserMessage(
      createConversation("2026-11-03T00:00:00.000Z", "c1"),
      {
        id: "m1",
        role: "user",
        body: "Help me configure DNS records.",
        createdAt: "2026-11-03T00:00:01.000Z",
        status: "sent",
      },
    );
    const withNotice = appendProviderNotice(conversation, {
      id: "m2",
      role: "notice",
      body: BEYOND_MASTER_PROVIDER_NOTICE,
      createdAt: "2026-11-03T00:00:02.000Z",
      status: "sent",
      code: "provider_not_configured",
    });
    assert.equal(withNotice.title, "Help me configure DNS records.");
    assert.equal(withNotice.messages[1]?.role, "notice");
    assert.deepEqual(chatContext(withNotice.messages), [
      { role: "user", content: "Help me configure DNS records." },
    ]);
  });

  it("rejects empty and oversized drafts", () => {
    assert.equal(validateDraft("   ").ok, false);
    assert.equal(validateDraft("a".repeat(4001)).ok, false);
    const accepted = validateDraft("  Check my domain  ");
    assert.equal(accepted.ok, true);
    if (accepted.ok) assert.equal(accepted.body, "Check my domain");
  });

  it("drops stored notices that are not the real status copy", () => {
    const raw = JSON.stringify({
      conversations: [
        {
          id: "c1",
          title: "Hello",
          createdAt: "2026-11-03T00:00:00.000Z",
          updatedAt: "2026-11-03T00:00:02.000Z",
          messages: [
            {
              id: "m1",
              role: "notice",
              body: "Your domain example.com was registered.",
              createdAt: "2026-11-03T00:00:02.000Z",
              status: "sent",
            },
          ],
        },
      ],
    });
    const parsed = parseStoredConversations(raw);
    assert.ok(parsed);
    assert.equal(parsed[0]?.messages.length, 0);
  });

  it("keeps a stored assistant reply", () => {
    const parsed = parseStoredConversations(
      JSON.stringify({
        conversations: [
          {
            id: "c1",
            title: "DNS",
            createdAt: "2026-11-03T00:00:00.000Z",
            updatedAt: "2026-11-03T00:00:02.000Z",
            messages: [
              {
                id: "m1",
                role: "assistant",
                body: "Add the A record at your DNS host, then wait for it to propagate.",
                createdAt: "2026-11-03T00:00:02.000Z",
                status: "sent",
              },
            ],
          },
        ],
      }),
    );
    assert.equal(parsed?.[0]?.messages[0]?.role, "assistant");
    assert.equal(chatContext(parsed?.[0]?.messages ?? []).length, 1);
  });
});
