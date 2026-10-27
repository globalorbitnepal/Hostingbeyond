import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { NextRequest } from "next/server";

import { GET } from "@/app/api/orbit/activity/route";
import { setOrbitAdminSessionTestOverride } from "@/lib/test/orbit-admin-session-test-control";

describe("GET /api/orbit/activity", () => {
  beforeEach(() => {
    setOrbitAdminSessionTestOverride(async () => null);
  });

  afterEach(() => {
    setOrbitAdminSessionTestOverride(null);
  });

  it("returns 401 without Orbit admin session", async () => {
    const res = await GET(
      new NextRequest("http://localhost/api/orbit/activity"),
    );
    assert.equal(res.status, 401);
  });
});
