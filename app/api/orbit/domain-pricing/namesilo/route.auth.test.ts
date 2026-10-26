import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { GET, POST } from "@/app/api/orbit/domain-pricing/namesilo/route";
import { setOrbitAdminSessionTestOverride } from "@/lib/test/orbit-admin-session-test-control";

describe("/api/orbit/domain-pricing/namesilo", () => {
  beforeEach(() => {
    setOrbitAdminSessionTestOverride(async () => null);
  });

  afterEach(() => {
    setOrbitAdminSessionTestOverride(null);
  });

  it("GET preview-sync returns 401 without Orbit admin session", async () => {
    const res = await GET(
      new Request(
        "http://localhost/api/orbit/domain-pricing/namesilo?action=preview-sync",
      ),
    );
    assert.equal(res.status, 401);
  });

  it("POST apply-supplier-sync returns 401 without Orbit admin session", async () => {
    const res = await POST(
      new Request(
        "http://localhost/api/orbit/domain-pricing/namesilo?action=apply-supplier-sync",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ confirm: true }),
        },
      ),
    );
    assert.equal(res.status, 401);
  });
});
