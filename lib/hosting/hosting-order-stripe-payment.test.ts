import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isHostingCheckoutPaymentAvailable,
  verifyPaidCheckoutForHostingOrder,
} from "@/lib/hosting/hosting-order-stripe-payment";

describe("verifyPaidCheckoutForHostingOrder", () => {
  const order = {
    id: "order_1",
    userId: "user_1",
    total: 49.99,
    currency: "USD",
  };

  it("accepts matching paid session", () => {
    const r = verifyPaidCheckoutForHostingOrder(
      {
        payment_status: "paid",
        metadata: { hostingOrderId: "order_1", userId: "user_1" },
        amount_total: 4999,
        currency: "usd",
      },
      order,
    );
    assert.equal(r.ok, true);
  });

  it("rejects amount mismatch", () => {
    const r = verifyPaidCheckoutForHostingOrder(
      {
        payment_status: "paid",
        metadata: { hostingOrderId: "order_1", userId: "user_1" },
        amount_total: 1000,
        currency: "usd",
      },
      order,
    );
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.reason, "amount_mismatch");
  });

  it("rejects customer mismatch", () => {
    const r = verifyPaidCheckoutForHostingOrder(
      {
        payment_status: "paid",
        metadata: { hostingOrderId: "order_1", userId: "other" },
        amount_total: 4999,
        currency: "usd",
      },
      order,
    );
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.reason, "customer_mismatch");
  });

  it("rejects currency mismatch", () => {
    const r = verifyPaidCheckoutForHostingOrder(
      {
        payment_status: "paid",
        metadata: { hostingOrderId: "order_1", userId: "user_1" },
        amount_total: 4999,
        currency: "eur",
      },
      order,
    );
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.reason, "currency_mismatch");
  });

  it("rejects unpaid session", () => {
    const r = verifyPaidCheckoutForHostingOrder(
      {
        payment_status: "unpaid",
        metadata: { hostingOrderId: "order_1", userId: "user_1" },
        amount_total: 4999,
        currency: "usd",
      },
      order,
    );
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.reason, "not_paid");
  });
});

describe("isHostingCheckoutPaymentAvailable", () => {
  it("returns boolean without throwing", () => {
    assert.equal(typeof isHostingCheckoutPaymentAvailable(), "boolean");
  });
});
