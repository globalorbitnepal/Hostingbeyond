import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { GET, POST } from "@/app/api/orbit/domain-reconciliation/route";
import { setOrbitAdminSessionTestOverride } from "@/lib/test/orbit-admin-session-test-control";

describe("/api/orbit/domain-reconciliation", () => {
  beforeEach(() => {
    setOrbitAdminSessionTestOverride(async () => null);
  });

  afterEach(() => {
    setOrbitAdminSessionTestOverride(null);
  });

  it("GET returns 401 without Orbit admin session", async () => {
    const res = await GET();
    assert.equal(res.status, 401);
  });

  it("POST returns 401 without Orbit admin session", async () => {
    const res = await POST(
      new Request("http://localhost/api/orbit/domain-reconciliation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: "x", action: "check" }),
      }),
    );
    assert.equal(res.status, 401);
  });
});
