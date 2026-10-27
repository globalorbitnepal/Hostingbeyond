import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { GET, PUT } from "@/app/api/orbit/migration-requests/route";
import { setOrbitAdminSessionTestOverride } from "@/lib/test/orbit-admin-session-test-control";

describe("/api/orbit/migration-requests", () => {
  beforeEach(() => {
    setOrbitAdminSessionTestOverride(async () => null);
  });

  afterEach(() => {
    setOrbitAdminSessionTestOverride(null);
  });

  it("GET returns 401 without Orbit admin session", async () => {
    const res = await GET(
      new Request("http://localhost/api/orbit/migration-requests"),
    );
    assert.equal(res.status, 401);
  });

  it("PUT returns 401 without Orbit admin session", async () => {
    const res = await PUT(
      new Request("http://localhost/api/orbit/migration-requests", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: "x", status: "open" }),
      }),
    );
    assert.equal(res.status, 401);
  });
});
