import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { nextPathFromOAuthStatePayload } from "@/lib/customer/oauth-state";
import { routes } from "@/config/routes";

describe("nextPathFromOAuthStatePayload", () => {
  it("returns sanitized next for valid oauth state", () => {
    const result = nextPathFromOAuthStatePayload(
      {
        kind: "oauth",
        provider: "google",
        next: "/cart?step=3",
      },
      "google",
    );
    assert.ok(result);
    assert.equal(result.nextPath, "/cart?step=3");
  });

  it("rejects wrong provider or kind", () => {
    assert.equal(
      nextPathFromOAuthStatePayload(
        { kind: "oauth", provider: "github", next: "/account" },
        "google",
      ),
      null,
    );
    assert.equal(
      nextPathFromOAuthStatePayload(
        { kind: "customer", provider: "google", next: "/account" },
        "google",
      ),
      null,
    );
  });

  it("sanitizes malicious next in state payload", () => {
    const result = nextPathFromOAuthStatePayload(
      {
        kind: "oauth",
        provider: "google",
        next: "//phish.example",
      },
      "google",
    );
    assert.ok(result);
    assert.equal(result.nextPath, routes.account);
  });
});
