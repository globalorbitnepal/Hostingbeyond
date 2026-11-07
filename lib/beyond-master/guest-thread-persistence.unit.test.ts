import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Regression for a live browser defect.
 *
 * Guest threads receive their capability token in the RESPONSE of the first
 * POST /api/beyond-master/threads. The client used `navigator.sendBeacon`, which
 * cannot read responses, so the token was never stored and every later save
 * failed with 400 `guest_capability_required`. Multi-turn guest conversations
 * silently stopped persisting.
 */
describe("guest thread persistence uses a readable request", () => {
  const source = readFileSync(
    path.join(process.cwd(), "lib/beyond-master/ui-store.ts"),
    "utf8",
  );

  it("does not fire-and-forget thread saves via sendBeacon", () => {
    assert.equal(
      source.includes("navigator.sendBeacon"),
      false,
      "sendBeacon discards the issued guest capability token",
    );
  });

  it("stores the guest capability token returned by the save response", () => {
    assert.match(source, /guestCapabilityToken\?: string/);
    assert.match(source, /guestCapabilityToken: json\.guestCapabilityToken/);
  });
});
