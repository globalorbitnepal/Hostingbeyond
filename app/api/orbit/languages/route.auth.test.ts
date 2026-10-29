import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { NextRequest } from "next/server";

import { GET, PUT } from "@/app/api/orbit/languages/route";
import { setOrbitAdminSessionTestOverride } from "@/lib/test/orbit-admin-session-test-control";

describe("/api/orbit/languages authorization", () => {
  beforeEach(() => {
    setOrbitAdminSessionTestOverride(async () => null);
  });

  afterEach(() => {
    setOrbitAdminSessionTestOverride(null);
  });

  it("rejects GET without an Orbit admin session", async () => {
    const res = await GET();
    assert.equal(res.status, 401);
  });

  it("rejects PUT without an Orbit admin session", async () => {
    const res = await PUT(
      new NextRequest("http://localhost/api/orbit/languages", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ enabledCodes: ["en", "hi"] }),
      }),
    );
    assert.equal(res.status, 401);
  });
});
