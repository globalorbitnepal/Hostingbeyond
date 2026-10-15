import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  customerAuthHints,
  listConfiguredCustomerOAuthProviders,
} from "@/lib/customer/oauth-availability";

describe("customer OAuth availability", () => {
  it("returns hints without throwing when env is unset", () => {
    const hints = customerAuthHints();
    assert.equal(hints.emailPassword, true);
    assert.equal(typeof hints.googleOAuth, "boolean");
    assert.ok(Array.isArray(hints.configuredProviders));
  });

  it("listConfiguredCustomerOAuthProviders is a subset of known providers", () => {
    const list = listConfiguredCustomerOAuthProviders();
    for (const p of list) {
      assert.ok(["google", "github", "facebook"].includes(p));
    }
  });
});
