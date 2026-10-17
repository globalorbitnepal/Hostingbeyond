import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  decideHostingCheckoutCompletedWebhook,
  shouldMarkHostingCheckoutExpired,
  shouldMarkHostingCheckoutFailed,
} from "@/lib/hosting/hosting-order-checkout-policy";

describe("decideHostingCheckoutCompletedWebhook", () => {
  const registered = {
    id: "co_1",
    status: "CHECKOUT_CREATED",
    stripeCheckoutSessionId: "cs_reg",
  };

  it("accepts verified payment for registered session", () => {
    const d = decideHostingCheckoutCompletedWebhook({
      orderStatus: "PENDING_PAYMENT",
      orderPaymentStatus: "checkout_created",
      orderPaidPaymentReference: null,
      sessionId: "cs_reg",
      paymentIntentId: "pi_1",
      registeredCheckout: registered,
      verification: { ok: true },
    });
    assert.equal(d.action, "accept");
  });

  it("returns duplicate when order already paid with same reference", () => {
    const d = decideHostingCheckoutCompletedWebhook({
      orderStatus: "PAID",
      orderPaymentStatus: "succeeded",
      orderPaidPaymentReference: "pi_1",
      sessionId: "cs_reg",
      paymentIntentId: "pi_1",
      registeredCheckout: registered,
      verification: { ok: true },
    });
    assert.equal(d.action, "duplicate");
  });

  it("rejects second successful session on already paid order", () => {
    const d = decideHostingCheckoutCompletedWebhook({
      orderStatus: "PAID",
      orderPaymentStatus: "succeeded",
      orderPaidPaymentReference: "pi_first",
      sessionId: "cs_other",
      paymentIntentId: "pi_second",
      registeredCheckout: {
        id: "co_2",
        status: "CHECKOUT_CREATED",
        stripeCheckoutSessionId: "cs_other",
      },
      verification: { ok: true },
    });
    assert.equal(d.action, "reject_already_paid");
  });

  it("rejects unregistered session", () => {
    const d = decideHostingCheckoutCompletedWebhook({
      orderStatus: "PENDING_PAYMENT",
      orderPaymentStatus: null,
      orderPaidPaymentReference: null,
      sessionId: "cs_unknown",
      paymentIntentId: "pi_x",
      registeredCheckout: null,
      verification: { ok: true },
    });
    assert.equal(d.action, "reject");
    if (d.action === "reject") {
      assert.equal(d.reason, "unknown_checkout_session");
    }
  });

  it("rejects verification failures", () => {
    const d = decideHostingCheckoutCompletedWebhook({
      orderStatus: "PENDING_PAYMENT",
      orderPaymentStatus: null,
      orderPaidPaymentReference: null,
      sessionId: "cs_reg",
      paymentIntentId: null,
      registeredCheckout: registered,
      verification: { ok: false, reason: "currency_mismatch" },
    });
    assert.equal(d.action, "reject");
    if (d.action === "reject") {
      assert.equal(d.reason, "currency_mismatch");
    }
  });
});

describe("expired and failed guards", () => {
  it("does not expire checkout when order is paid", () => {
    assert.equal(
      shouldMarkHostingCheckoutExpired({
        orderStatus: "PAID",
        checkoutStatus: "CHECKOUT_CREATED",
      }),
      false,
    );
  });

  it("marks open checkout expired when order unpaid", () => {
    assert.equal(
      shouldMarkHostingCheckoutExpired({
        orderStatus: "PENDING_PAYMENT",
        checkoutStatus: "CHECKOUT_CREATED",
      }),
      true,
    );
  });

  it("does not fail checkout when order is paid", () => {
    assert.equal(
      shouldMarkHostingCheckoutFailed({
        orderStatus: "PAID",
        checkoutStatus: "CHECKOUT_CREATED",
      }),
      false,
    );
  });
});
