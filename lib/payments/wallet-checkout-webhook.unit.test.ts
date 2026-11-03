import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { planWalletCheckoutCompletedAction } from "@/lib/payments/wallet-checkout-webhook";

describe("wallet checkout webhook credit planning", () => {
  it("skips duplicate when payment already succeeded with a wallet tx", () => {
    const plan = planWalletCheckoutCompletedAction({
      paymentStatus: "SUCCEEDED",
      paymentWalletTransactionId: "wtx_1",
      sessionId: "cs_1",
      paymentIntentId: "pi_1",
    });
    assert.deepEqual(plan, { action: "skip_duplicate" });
  });

  it("reconciles when succeeded without linked wallet tx", () => {
    const plan = planWalletCheckoutCompletedAction({
      paymentStatus: "SUCCEEDED",
      paymentWalletTransactionId: null,
      sessionId: "cs_1",
      paymentIntentId: "pi_1",
    });
    assert.deepEqual(plan, {
      action: "reconcile",
      creditKey: "stripe:credit:pi_1",
    });
  });

  it("uses payment intent for credit idempotency when present", () => {
    const plan = planWalletCheckoutCompletedAction({
      paymentStatus: "CHECKOUT_CREATED",
      paymentWalletTransactionId: null,
      sessionId: "cs_1",
      paymentIntentId: "pi_abc",
    });
    assert.deepEqual(plan, {
      action: "credit",
      creditKey: "stripe:credit:pi_abc",
    });
  });

  it("falls back to session id when payment intent is missing", () => {
    const plan = planWalletCheckoutCompletedAction({
      paymentStatus: "CHECKOUT_CREATED",
      paymentWalletTransactionId: null,
      sessionId: "cs_sess",
      paymentIntentId: null,
    });
    assert.deepEqual(plan, {
      action: "credit",
      creditKey: "stripe:session:cs_sess",
    });
  });
});
