import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  oauthCallbackUrl,
  oauthSiteOriginFromRequest,
} from "@/lib/customer/oauth";

describe("customer OAuth callback URLs", () => {
  it("uses hostingbeyond.com for Google redirect_uri in production", () => {
    const prevNode = process.env.NODE_ENV;
    const prevOAuth = process.env.CUSTOMER_OAUTH_PUBLIC_ORIGIN;
    delete process.env.CUSTOMER_OAUTH_PUBLIC_ORIGIN;
    process.env.NODE_ENV = "production";
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
      process.env.NODE_ENV = prevNode;
      if (prevOAuth === undefined)
        delete process.env.CUSTOMER_OAUTH_PUBLIC_ORIGIN;
      else process.env.CUSTOMER_OAUTH_PUBLIC_ORIGIN = prevOAuth;
    }
  });

  it("uses request host in non-production dev", () => {
    const prevNode = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    try {
      const origin = oauthSiteOriginFromRequest({
        forwardedHost: "localhost:3000",
        forwardedProto: "http",
      });
      assert.equal(
        oauthCallbackUrl("google", origin),
        "http://localhost:3000/api/auth/oauth/google/callback",
      );
    } finally {
      process.env.NODE_ENV = prevNode;
    }
  });
});
