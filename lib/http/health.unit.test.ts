import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { healthPayload } from "@/lib/http/health";

describe("healthPayload", () => {
  it("reports liveness without extra fields", () => {
    const body = healthPayload();
    assert.equal(body.ok, true);
    assert.equal(body.service, "hostingbeyond");
    assert.equal(Object.keys(body).sort().join(","), "ok,service");
  });
});
