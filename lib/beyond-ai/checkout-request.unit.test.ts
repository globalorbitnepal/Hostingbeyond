import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  paidBeyondAiPlanIds,
  parseBeyondAiBillingInterval,
  parseBeyondAiPlanId,
} from "@/lib/beyond-ai/checkout-request";
import { getPlanConfig } from "@/config/beyond-ai-product";

describe("parseBeyondAiPlanId", () => {
  it("accepts every configured plan id", () => {
    for (const id of ["free", "pro", "pro-plus", "ultra"]) {
      assert.equal(parseBeyondAiPlanId(id), id);
    }
  });

  it("rejects unknown ids instead of falling back to Pro pricing", () => {
    for (const raw of ["enterprise", "", "PRI", null, undefined, 42, {}, []]) {
      assert.equal(
        parseBeyondAiPlanId(raw),
        null,
        `${JSON.stringify(raw)} must not resolve to a plan`,
      );
    }
    // Documents why the guard exists: the shared config helper is lenient.
    assert.equal(getPlanConfig("enterprise").id, "pro");
  });

  it("trims surrounding whitespace", () => {
    assert.equal(parseBeyondAiPlanId("  ultra  "), "ultra");
  });
});

describe("parseBeyondAiBillingInterval", () => {
  it("defaults to monthly when omitted", () => {
    assert.equal(parseBeyondAiBillingInterval(undefined), "monthly");
    assert.equal(parseBeyondAiBillingInterval(null), "monthly");
  });

  it("accepts the two supported intervals", () => {
    assert.equal(parseBeyondAiBillingInterval("monthly"), "monthly");
    assert.equal(parseBeyondAiBillingInterval("yearly"), "yearly");
  });

  it("rejects anything else", () => {
    for (const raw of ["weekly", "", "MONTHLY", true, 12, {}]) {
      assert.equal(parseBeyondAiBillingInterval(raw), null);
    }
  });
});

describe("paidBeyondAiPlanIds", () => {
  it("lists only plans that require payment", () => {
    const ids = paidBeyondAiPlanIds();
    assert.equal(ids.includes("free"), false);
    assert.deepEqual(ids, ["pro", "pro-plus", "ultra"]);
  });
});
