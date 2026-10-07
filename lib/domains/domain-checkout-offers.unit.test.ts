import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { quoteDomainCheckoutServices } from "@/lib/domains/domain-checkout-offers";

describe("domain checkout service quotes", () => {
  it("deduplicates hosting selections", async () => {
    const result = await quoteDomainCheckoutServices([
      {
        kind: "hosting",
        productSlug: "web-hosting",
        planKey: "essential",
        billing: "monthly",
      },
      {
        kind: "hosting",
        productSlug: "web-hosting",
        planKey: "essential",
        billing: "monthly",
      },
    ]);
    assert.equal(result.lines.length <= 1, true);
  });
});
