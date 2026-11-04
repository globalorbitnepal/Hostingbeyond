import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { decideOrbitSessionTrust } from "@/lib/orbit/session-trust";

describe("orbit session trust policy", () => {
  it("allows only an active database session and fails closed otherwise", () => {
    assert.equal(
      decideOrbitSessionTrust({
        jwtValid: true,
        hasAdminUserId: true,
        databaseUnavailable: false,
        sessionFound: true,
        sessionExpired: false,
      }).outcome,
      "database_session",
    );
    const unavailable = decideOrbitSessionTrust({
      jwtValid: true,
      hasAdminUserId: true,
      databaseUnavailable: true,
      sessionFound: true,
      sessionExpired: true,
    });
    assert.equal(unavailable.outcome, "reject");
    if (unavailable.outcome === "reject")
      assert.equal(unavailable.reason, "database_unavailable");
    const revoked = decideOrbitSessionTrust({
      jwtValid: true,
      hasAdminUserId: true,
      databaseUnavailable: false,
      sessionFound: false,
      sessionExpired: false,
    });
    assert.equal(revoked.outcome, "reject");
    if (revoked.outcome === "reject")
      assert.equal(revoked.reason, "session_missing");
  });
});
