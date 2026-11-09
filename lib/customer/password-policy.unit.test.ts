import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  requiresCurrentPassword,
  validateNewPassword,
} from "@/lib/customer/password-policy";

describe("requiresCurrentPassword", () => {
  it("asks email/password customers for their current password", () => {
    assert.equal(
      requiresCurrentPassword({ hasPassword: true, oauthLinked: false }),
      true,
    );
  });

  it("never asks a Google-only customer", () => {
    assert.equal(
      requiresCurrentPassword({ hasPassword: false, oauthLinked: true }),
      false,
    );
  });

  it("does not ask an OAuth customer who already has a password", () => {
    assert.equal(
      requiresCurrentPassword({ hasPassword: true, oauthLinked: true }),
      false,
    );
  });
});

describe("validateNewPassword", () => {
  it("accepts a matching pair of 8+ characters", () => {
    assert.equal(
      validateNewPassword({
        newPassword: "hunter2hunter",
        confirmPassword: "hunter2hunter",
      }).ok,
      true,
    );
  });

  it("rejects short passwords", () => {
    const result = validateNewPassword({
      newPassword: "short",
      confirmPassword: "short",
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /at least 8/);
  });

  it("rejects mismatched confirmation", () => {
    const result = validateNewPassword({
      newPassword: "longenough1",
      confirmPassword: "longenough2",
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /do not match/);
  });
});
