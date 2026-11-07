import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  commerceCapabilitySnapshot,
  DEFAULT_OPERATOR_FEATURES,
  parseOperatorFeatures,
} from "@/lib/beyond-master/operator-features";
import { supportEventForChat } from "@/lib/beyond-master/tickets/http";

describe("beyond master operator features", () => {
  it("defaults assistant features on and ignores unknown keys", () => {
    assert.deepEqual(parseOperatorFeatures(null), DEFAULT_OPERATOR_FEATURES);
    assert.equal(
      parseOperatorFeatures({ publicChat: false }).publicChat,
      false,
    );
    assert.equal(parseOperatorFeatures({ publicChat: "no" }).publicChat, true);
  });

  it("keeps commerce off unless both env gates are set", () => {
    const snap = commerceCapabilitySnapshot({
      BEYOND_MASTER_COMMERCE_ENABLED: "false",
      BEYOND_MASTER_ALLOW_DOMAIN_REGISTER: "true",
    });
    assert.equal(snap.commerceEnabled, false);
    assert.equal(
      snap.capabilities.find((row) => row.id === "domain_register")?.enabled,
      false,
    );
  });

  it("does not enqueue humans when the human queue flag is off", async () => {
    const event = await supportEventForChat(
      "I want to talk to a human.",
      "customer-a",
      { threadId: "thread-flag-off-01", humanQueue: false },
    );
    assert.equal(event?.kind, "human_queue");
    assert.equal((event as { queued?: boolean }).queued, false);
    assert.match(
      String((event as { message?: string }).message),
      /turned off/i,
    );
  });
});
