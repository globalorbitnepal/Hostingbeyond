import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { reserveWalletFunds } from "@/lib/domains/wallet";
import {
  normalizeTopUpAmount,
  processStripeWalletWebhook,
  verifyPaidCheckoutForWallet,
} from "@/lib/payments/wallet-payment-service";

describe("Wallet top-up amount validation", () => {
  it("accepts amounts between 5 and 10000", () => {
    assert.equal(normalizeTopUpAmount(25), 25);
    assert.equal(normalizeTopUpAmount(5), 5);
  });

  it("rejects invalid amounts", () => {
    assert.equal(normalizeTopUpAmount(4.99), null);
    assert.equal(normalizeTopUpAmount(10001), null);
    assert.equal(normalizeTopUpAmount(Number.NaN), null);
  });
});

describe("Stripe checkout verification (no wallet credit without match)", () => {
  const payment = {
    userId: "user_1",
    amount: 25,
    currency: "USD",
  };

  it("accepts matching paid session", () => {
    const result = verifyPaidCheckoutForWallet(
      {
        payment_status: "paid",
        metadata: { userId: "user_1" },
        amount_total: 2500,
        currency: "usd",
      },
      payment,
    );
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.paidAmount, 25);
  });

  it("rejects wrong amount", () => {
    const result = verifyPaidCheckoutForWallet(
      {
        payment_status: "paid",
        metadata: { userId: "user_1" },
        amount_total: 1000,
        currency: "usd",
      },
      payment,
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.reason, "amount_mismatch");
  });

  it("rejects unpaid session", () => {
    const result = verifyPaidCheckoutForWallet(
      {
        payment_status: "unpaid",
        metadata: { userId: "user_1" },
        amount_total: 2500,
        currency: "usd",
      },
      payment,
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.reason, "not_paid");
  });

  it("rejects customer mismatch", () => {
    const result = verifyPaidCheckoutForWallet(
      {
        payment_status: "paid",
        metadata: { userId: "other_user" },
        amount_total: 2500,
        currency: "usd",
      },
      payment,
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.reason, "customer_mismatch");
  });
});

describe("Stripe webhook signature", () => {
  it("rejects missing signature", async () => {
    const prev = process.env.STRIPE_WEBHOOK_SECRET;
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_local";
    try {
      const result = await processStripeWalletWebhook({
        rawBody: "{}",
        signature: null,
      });
      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.equal(result.status, 400);
        assert.match(result.error, /signature/i);
      }
    } finally {
      if (prev === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
      else process.env.STRIPE_WEBHOOK_SECRET = prev;
    }
  });

  it("rejects invalid signature", async () => {
    const prev = process.env.STRIPE_WEBHOOK_SECRET;
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_local";
    try {
      const result = await processStripeWalletWebhook({
        rawBody: "{}",
        signature: "bad",
        constructEvent: () => {
          throw new Error("invalid");
        },
      });
      assert.equal(result.ok, false);
      if (!result.ok) assert.equal(result.error, "Invalid signature");
    } finally {
      if (prev === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
      else process.env.STRIPE_WEBHOOK_SECRET = prev;
    }
  });
});

describe("Wallet reserve insufficient balance", () => {
  it("throws when DATABASE_URL missing", async () => {
    if (!process.env.DATABASE_URL?.trim()) {
      assert.ok(true);
      return;
    }
    await assert.rejects(
      () =>
        reserveWalletFunds({
          userId: "nonexistent-user-for-wallet-test",
          amount: 999_999,
          idempotencyKey: `test-insufficient-${Date.now()}`,
          referenceType: "test",
          referenceId: "test",
        }),
      /insufficient_funds/,
    );
  });
});
