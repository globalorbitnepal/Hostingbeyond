import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { POST } from "@/app/api/webhooks/stripe/route";

describe("POST /api/webhooks/stripe", () => {
  it("rejects requests without stripe-signature", async () => {
    const res = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      }),
    );
    assert.ok(
      res.status === 400 || res.status === 503,
      `expected 400 or 503 got ${res.status}`,
    );
    const json = (await res.json()) as { error?: string };
    assert.ok(json.error);
  });
});
