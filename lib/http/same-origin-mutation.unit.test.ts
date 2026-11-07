import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  crossOriginBrowserMutationBlocked,
  isTruthyEnvFlag,
  requestCanonicalSiteUrl,
} from "@/lib/http/same-origin-mutation";

describe("crossOriginBrowserMutationBlocked", () => {
  it("blocks POST when Origin host differs from request URL host", () => {
    const req = new Request("https://example.com/api/x", {
      method: "POST",
      headers: { origin: "https://evil.com" },
    });
    assert.equal(
      crossOriginBrowserMutationBlocked(req, { ignoreTestBypass: true }),
      true,
    );
  });

  it("allows POST when Origin matches request host", () => {
    const req = new Request("https://example.com/api/x", {
      method: "POST",
      headers: { origin: "https://example.com" },
    });
    assert.equal(
      crossOriginBrowserMutationBlocked(req, { ignoreTestBypass: true }),
      false,
    );
  });

  it("allows when Origin header is absent (non-strict)", () => {
    const req = new Request("https://example.com/api/x", { method: "POST" });
    assert.equal(
      crossOriginBrowserMutationBlocked(req, { ignoreTestBypass: true }),
      false,
    );
  });

  it("blocks malformed Origin", () => {
    const req = new Request("https://example.com/api/x", {
      method: "POST",
      headers: { origin: "not-a-url" },
    });
    assert.equal(
      crossOriginBrowserMutationBlocked(req, { ignoreTestBypass: true }),
      true,
    );
  });

  it("blocks when explicit Origin port differs", () => {
    const req = new Request("https://example.com/api/x", {
      method: "POST",
      headers: { origin: "https://example.com:4443" },
    });
    assert.equal(
      crossOriginBrowserMutationBlocked(req, { ignoreTestBypass: true }),
      true,
    );
  });

  it("allows implicit default HTTPS port on Origin", () => {
    const req = new Request("https://example.com:443/api/x", {
      method: "POST",
      headers: { origin: "https://example.com" },
    });
    assert.equal(
      crossOriginBrowserMutationBlocked(req, { ignoreTestBypass: true }),
      false,
    );
  });

  it("blocks HTTP vs HTTPS scheme mismatch", () => {
    const req = new Request("https://example.com/api/x", {
      method: "POST",
      headers: { origin: "http://example.com" },
    });
    assert.equal(
      crossOriginBrowserMutationBlocked(req, { ignoreTestBypass: true }),
      true,
    );
  });

  it("blocks cross-origin DELETE", () => {
    const req = new Request("https://example.com/api/x", {
      method: "DELETE",
      headers: { origin: "https://other.example" },
    });
    assert.equal(
      crossOriginBrowserMutationBlocked(req, { ignoreTestBypass: true }),
      true,
    );
  });

  it("blocks cross-origin PATCH", () => {
    const req = new Request("https://example.com/api/x", {
      method: "PATCH",
      headers: { origin: "https://attacker.test" },
    });
    assert.equal(
      crossOriginBrowserMutationBlocked(req, { ignoreTestBypass: true }),
      true,
    );
  });

  it("uses request.url host only (ignores X-Forwarded-Host)", () => {
    const req = new Request("https://example.com/api/x", {
      method: "POST",
      headers: {
        origin: "https://example.com",
        "x-forwarded-host": "evil.com",
      },
    });
    assert.equal(
      crossOriginBrowserMutationBlocked(req, { ignoreTestBypass: true }),
      false,
    );
    assert.equal(requestCanonicalSiteUrl(req).hostname, "example.com");
  });
});

describe("CSRF_STRICT_ORIGIN", () => {
  const prev = process.env.CSRF_STRICT_ORIGIN;

  afterEach(() => {
    if (prev === undefined) delete process.env.CSRF_STRICT_ORIGIN;
    else process.env.CSRF_STRICT_ORIGIN = prev;
  });

  it("blocks POST with no Origin/Referer when strict", () => {
    process.env.CSRF_STRICT_ORIGIN = "1";
    const req = new Request("https://example.com/api/x", { method: "POST" });
    assert.equal(
      crossOriginBrowserMutationBlocked(req, { ignoreTestBypass: true }),
      true,
    );
  });

  it("allows POST when Referer matches in strict mode", () => {
    process.env.CSRF_STRICT_ORIGIN = "1";
    const req = new Request("https://example.com/api/x", {
      method: "POST",
      headers: { referer: "https://example.com/orbit/page" },
    });
    assert.equal(
      crossOriginBrowserMutationBlocked(req, { ignoreTestBypass: true }),
      false,
    );
  });
});

describe("isTruthyEnvFlag", () => {
  it("recognizes common truthy strings", () => {
    assert.equal(isTruthyEnvFlag("1"), true);
    assert.equal(isTruthyEnvFlag("true"), true);
    assert.equal(isTruthyEnvFlag(undefined), false);
  });
});
