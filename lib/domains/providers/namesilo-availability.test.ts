import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  mapNameSiloBucketsToRows,
  namesiloAvailabilityIsBusy,
} from "@/lib/domains/providers/namesilo-availability";

describe("NameSilo availability adapter", () => {
  it("maps unavailable, invalid, available, and missing buckets", () => {
    const rows = mapNameSiloBucketsToRows(
      ["example.com", "bad.invalid", "free-test.com", "ghost.net"],
      {
        available: [{ domain: "free-test.com", isPremium: true }],
        unavailable: ["example.com"],
        invalid: ["bad.invalid"],
      },
    );
    const byDomain = new Map(rows.map((r) => [r.domain, r]));
    assert.equal(byDomain.get("example.com")?.status, "taken");
    assert.equal(byDomain.get("bad.invalid")?.status, "invalid");
    assert.equal(byDomain.get("free-test.com")?.status, "available");
    assert.equal(byDomain.get("free-test.com")?.supplier.register, null);
    assert.equal(byDomain.get("ghost.net")?.status, "unknown");
  });

  it("treats NameSilo 503/502/429 as a retryable busy response", () => {
    assert.equal(namesiloAvailabilityIsBusy(503), true);
    assert.equal(namesiloAvailabilityIsBusy(502), true);
    assert.equal(namesiloAvailabilityIsBusy(429), true);
    assert.equal(namesiloAvailabilityIsBusy(200), false);
    assert.equal(namesiloAvailabilityIsBusy(401), false);
  });
});
