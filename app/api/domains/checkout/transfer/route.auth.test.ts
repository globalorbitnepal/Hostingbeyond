import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { POST } from "@/app/api/domains/checkout/transfer/route";
import { setCustomerSessionTestOverride } from "@/lib/test/customer-session-test-control";

describe("POST /api/domains/checkout/transfer auth", () => {
  beforeEach(() => {
    setCustomerSessionTestOverride(async () => null);
  });

  afterEach(() => {
    setCustomerSessionTestOverride(null);
  });

  it("returns 401 without customer session", async () => {
    const res = await POST(
      new Request("http://localhost/api/domains/checkout/transfer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          domain: "example.com",
          authCode: "SECRET-CODE",
        }),
      }),
    );
    assert.equal(res.status, 401);
    const json = (await res.json()) as {
      transfer?: unknown;
      authCode?: string;
    };
    assert.equal(json.authCode, undefined);
    assert.equal(json.transfer, undefined);
  });
});
