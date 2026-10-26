import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { POST } from "@/app/api/migration/request/route";

describe("POST /api/migration/request validation", () => {
  it("returns 400 for empty body", async () => {
    const res = await POST(
      new Request("http://localhost/api/migration/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
    );
    assert.equal(res.status, 400);
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await POST(
      new Request("http://localhost/api/migration/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not-json",
      }),
    );
    assert.equal(res.status, 400);
  });
});
