import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  oauthCallbackUrl,
  oauthSiteOriginFromRequest,
} from "@/lib/customer/oauth";
import { resolveRequestSiteOrigin } from "@/lib/customer/site-origin";

describe("customer OAuth callback URLs", () => {
  it("uses CUSTOMER_OAUTH_PUBLIC_ORIGIN for Google redirect_uri", () => {
    const prevOAuth = process.env.CUSTOMER_OAUTH_PUBLIC_ORIGIN;
    process.env.CUSTOMER_OAUTH_PUBLIC_ORIGIN = "https://hostingbeyond.com";
    try {
      const origin = oauthSiteOriginFromRequest({
        forwardedHost: "hosting.theglobalorbit.com",
        forwardedProto: "https",
      });
      assert.equal(
        oauthCallbackUrl("google", origin),
        "https://hostingbeyond.com/api/auth/oauth/google/callback",
      );
    } finally {
      if (prevOAuth === undefined)
        delete process.env.CUSTOMER_OAUTH_PUBLIC_ORIGIN;
      else process.env.CUSTOMER_OAUTH_PUBLIC_ORIGIN = prevOAuth;
    }
  });

  it("builds callback URL from resolved request origin on loopback", () => {
    const origin = resolveRequestSiteOrigin({
      host: "localhost:3000",
      forwardedProto: "http",
    });
    assert.equal(
      oauthCallbackUrl("google", origin),
      "http://localhost:3000/api/auth/oauth/google/callback",
    );
  });
});
