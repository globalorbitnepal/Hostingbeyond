import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  oauthCallbackUrl,
  oauthSiteOriginFromRequest,
} from "@/lib/customer/oauth";

describe("customer OAuth callback URLs", () => {
  it("uses the storefront host for Google redirect_uri", () => {
    const origin = oauthSiteOriginFromRequest({
      forwardedHost: "hosting.theglobalorbit.com",
      forwardedProto: "https",
    });
    assert.equal(
      oauthCallbackUrl("google", origin),
      "https://hosting.theglobalorbit.com/api/auth/oauth/google/callback",
    );
  });

  it("rewrites a bare parent domain to the storefront host", () => {
    const origin = oauthSiteOriginFromRequest({
      forwardedHost: "theglobalorbit.com",
      forwardedProto: "https",
    });
    assert.equal(
      oauthCallbackUrl("google", origin),
      "https://hosting.theglobalorbit.com/api/auth/oauth/google/callback",
    );
  });
});
