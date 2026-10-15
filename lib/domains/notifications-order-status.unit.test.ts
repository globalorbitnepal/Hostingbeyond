import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { customerMessageForOrderStatus } from "@/lib/domains/notifications";

describe("customerMessageForOrderStatus", () => {
  it("uses renewal copy for reconciliation", () => {
    const msg = customerMessageForOrderStatus(
      "RECONCILIATION_REQUIRED",
      "renew",
    );
    assert.match(msg, /renewal/i);
    assert.match(msg, /held/i);
  });

  it("uses registration copy by default", () => {
    const msg = customerMessageForOrderStatus("FAILED", "register");
    assert.match(msg, /registration/i);
  });
});
