import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { NextRequest } from "next/server";

import { GET as oauthStart } from "@/app/api/auth/oauth/[provider]/route";
import { GET as oauthEstablish } from "@/app/api/auth/oauth/establish/route";

function req(path: string) {
  return new NextRequest(`http://localhost${path}`);
}

/**
 * OAuth route-level coverage without contacting any provider. These assert the
 * fail-closed branches only: unknown provider, missing/invalid establish token.
 */
describe("OAuth routes fail closed", () => {
  it("redirects unknown providers to the login error page", async () => {
    const res = await oauthStart(req("/api/auth/oauth/notaprovider"), {
      params: Promise.resolve({ provider: "notaprovider" }),
    });
    assert.equal(res.status, 307);
    assert.match(res.headers.get("location") ?? "", /\/login\?error=oauth$/);
  });

  it("redirects an establish request with no token", async () => {
    const res = await oauthEstablish(req("/api/auth/oauth/establish"));
    assert.equal(res.status, 307);
    assert.match(res.headers.get("location") ?? "", /\/login\?error=oauth$/);
  });

  it("redirects an establish request with a garbage token", async () => {
    const res = await oauthEstablish(
      req("/api/auth/oauth/establish?token=not-a-real-token"),
    );
    assert.equal(res.status, 307);
    assert.match(res.headers.get("location") ?? "", /\/login\?error=oauth$/);
  });

  it("never sets a session cookie on failure", async () => {
    const res = await oauthEstablish(req("/api/auth/oauth/establish"));
    assert.equal(res.headers.getSetCookie?.().length ?? 0, 0);
  });
});
