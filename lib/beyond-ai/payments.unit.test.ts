import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createBeyondAiCheckout,
  isBeyondAiDevActivationAllowed,
} from "@/lib/beyond-ai/payments";

const devEnv = { BEYOND_AI_DEV_ACTIVATE_PAID: "true" } as const;

describe("beyond-ai checkout payments", () => {
  it("requires auth for the free plan selection", async () => {
    const result = await createBeyondAiCheckout("user_1", "free", {});
    assert.equal(result.ok, false);
    assert.equal(result.ok || result.code, "auth_required");
  });

  it("fails closed when Stripe is not configured and dev activation is off", async () => {
    for (const env of [{}, { BEYOND_AI_DEV_ACTIVATE_PAID: "false" }]) {
      const result = await createBeyondAiCheckout("user_1", "pro", env);
      assert.equal(result.ok, false);
      assert.equal(result.ok || result.code, "payment_not_configured");
    }
  });

  it("does not create a real Stripe session even with a key present", async () => {
    const result = await createBeyondAiCheckout("user_1", "pro", {
      STRIPE_SECRET_KEY: "sk_test_not_real",
    });
    assert.equal(result.ok, false);
    assert.equal(result.ok || result.code, "payment_not_configured");
  });

  it("limits dev activation to the explicit dev flag", async () => {
    const allowed = await createBeyondAiCheckout("user_1", "pro", devEnv);
    assert.equal(allowed.ok, true);
    assert.equal(allowed.ok && allowed.mode, "dev_activated");

    const blocked = await createBeyondAiCheckout("user_1", "pro", {
      BEYOND_AI_DEV_ACTIVATE_PAID: "1",
    });
    assert.equal(blocked.ok, false);
  });

  it("never honors the dev bypass in a production build", async () => {
    const env = { ...devEnv, NODE_ENV: "production" };
    assert.equal(isBeyondAiDevActivationAllowed(env), false);
    for (const planId of ["pro", "pro-plus", "ultra"] as const) {
      const result = await createBeyondAiCheckout("user_1", planId, env);
      assert.equal(result.ok, false, `${planId} must not activate for free`);
      assert.equal(result.ok || result.code, "payment_not_configured");
    }
  });

  it("ignores a production-like flag value that is not exactly true", async () => {
    for (const value of ["TRUE", "yes", " true", "1"]) {
      assert.equal(
        isBeyondAiDevActivationAllowed({ BEYOND_AI_DEV_ACTIVATE_PAID: value }),
        false,
        `${value} must not enable the bypass`,
      );
    }
  });
});
