import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { GET } from "@/app/api/orbit/beyond-master/conversations/route";
import { setOrbitAdminSessionTestOverride } from "@/lib/test/orbit-admin-session-test-control";

describe("/api/orbit/beyond-master/conversations", () => {
  beforeEach(() => {
    setOrbitAdminSessionTestOverride(async () => null);
  });

  afterEach(() => {
    setOrbitAdminSessionTestOverride(null);
  });

  it("returns 401 without Orbit support session (thread read)", async () => {
    const res = await GET(
      new Request(
        "http://localhost/api/orbit/beyond-master/conversations?id=thr-integration-1",
      ),
    );
    assert.equal(res.status, 401);
  });

  it("returns 401 without Orbit support session (attachment read)", async () => {
    const res = await GET(
      new Request(
        "http://localhost/api/orbit/beyond-master/conversations?thread=thr-1&attachment=att-1",
      ),
    );
    assert.equal(res.status, 401);
  });

  it("returns 401 without Orbit support session (list)", async () => {
    const res = await GET(
      new Request("http://localhost/api/orbit/beyond-master/conversations"),
    );
    assert.equal(res.status, 401);
  });
});
