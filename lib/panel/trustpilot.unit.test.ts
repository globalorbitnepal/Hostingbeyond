import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { sanitizeTrustpilotUrl } from "@/lib/panel/trustpilot";

describe("sanitizeTrustpilotUrl", () => {
  it("keeps a blank Orbit field empty", () => {
    assert.equal(sanitizeTrustpilotUrl(""), "");
    assert.equal(sanitizeTrustpilotUrl("   "), "");
    assert.equal(sanitizeTrustpilotUrl(undefined), "");
  });

  it("accepts https review URLs and rejects other schemes", () => {
    assert.equal(
      sanitizeTrustpilotUrl("https://www.trustpilot.com/review/example.com"),
      "https://www.trustpilot.com/review/example.com",
    );
    assert.equal(sanitizeTrustpilotUrl("http://trustpilot.com"), "");
    assert.equal(sanitizeTrustpilotUrl("javascript:alert(1)"), "");
  });
});
