import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { nextLetsEncryptExpiry } from "@/lib/panel/ssl-dates";

describe("SSL inventory dates", () => {
  it("advances Let's Encrypt windows in 90-day cycles", () => {
    const now = new Date("2026-11-11T00:00:00.000Z");
    const expiry = nextLetsEncryptExpiry("2026-08-13T00:00:00.000Z", now);
    assert.equal(expiry, "2026-11-11T00:00:00.000Z");
  });
});
