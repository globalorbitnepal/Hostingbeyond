import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns liveness JSON without config or database fields", async () => {
    const res = await GET();
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("cache-control"), "no-store");
    const body = (await res.json()) as Record<string, unknown>;
    assert.deepEqual(body, { ok: true, service: "hostingbeyond" });
    assert.equal("databaseUrlPresent" in body, false);
    assert.equal("DATABASE_URL" in body, false);
  });
});
