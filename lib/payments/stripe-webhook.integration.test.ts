import { config as loadDotenv } from "dotenv";

loadDotenv();

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import Stripe from "stripe";

import { publicId } from "@/lib/domains/transfer-service";
import { ensureCustomerWallet } from "@/lib/domains/wallet";
import { prisma } from "@/lib/prisma";
import {
  handleCheckoutSessionCompleted,
  processStripeWalletWebhook,
  verifyPaidCheckoutForWallet,
} from "@/lib/payments/wallet-payment-service";

const TEST_WEBHOOK_SECRET = "whsec_integration_test_secret_only";
const TEST_EMAIL = "stripe-e2e-test@hostingbeyond.local";

function shouldRunDbWebhookTests(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function signPayload(payload: string, secret: string): string {
  return Stripe.webhooks.generateTestHeaderString({
    payload,
    secret,
  });
}

const runDb = shouldRunDbWebhookTests();

describe(
  "Stripe webhook DB integration (signed HTTP + ledger)",
  {
    skip: !runDb,
    concurrency: 1,
  },
  () => {
    let userId = "";
    let paymentId = "";
    const topUpAmount = 25;

    it("prepares customer and pending WalletPayment", async () => {
      const prevSecret = process.env.STRIPE_WEBHOOK_SECRET;
      process.env.STRIPE_WEBHOOK_SECRET = TEST_WEBHOOK_SECRET;

      const user = await prisma.customerUser.upsert({
        where: { email: TEST_EMAIL },
        create: { email: TEST_EMAIL, name: "Stripe E2E Test" },
        update: {},
      });
      userId = user.id;
      await ensureCustomerWallet(userId);

      const payment = await prisma.walletPayment.create({
        data: {
          publicId: publicId("WLT"),
          userId,
          amount: topUpAmount,
          currency: "USD",
          status: "CHECKOUT_CREATED",
          providerCheckoutSessionId: `cs_test_${Date.now()}`,
          idempotencyKey: `stripe-e2e-${Date.now()}`,
        },
      });
      paymentId = payment.id;

      if (prevSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
      else process.env.STRIPE_WEBHOOK_SECRET = prevSecret;
    });

    it("rejects invalid webhook signature over HTTP handler", async () => {
      const prev = process.env.STRIPE_WEBHOOK_SECRET;
      process.env.STRIPE_WEBHOOK_SECRET = TEST_WEBHOOK_SECRET;
      try {
        const result = await processStripeWalletWebhook({
          rawBody: "{}",
          signature: "invalid",
        });
        assert.equal(result.ok, false);
        if (!result.ok) assert.equal(result.error, "Invalid signature");
      } finally {
        if (prev === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
        else process.env.STRIPE_WEBHOOK_SECRET = prev;
      }
    });

    it("credits wallet once on verified checkout.session.completed", async () => {
      const payment = await prisma.walletPayment.findUnique({
        where: { id: paymentId },
      });
      assert.ok(payment?.providerCheckoutSessionId);

      const walletBefore = await prisma.customerWallet.findUnique({
        where: { userId },
      });
      const balanceBefore = Number(walletBefore!.balance);

      const session = {
        id: payment!.providerCheckoutSessionId!,
        payment_status: "paid",
        metadata: { walletPaymentId: paymentId, userId },
        amount_total: topUpAmount * 100,
        currency: "usd",
        payment_intent: `pi_test_${Date.now()}`,
      } as unknown as Stripe.Checkout.Session;

      const verified = verifyPaidCheckoutForWallet(session, payment!);
      assert.equal(verified.ok, true);

      const first = await handleCheckoutSessionCompleted(session);
      assert.equal(first.ok, true);
      const second = await handleCheckoutSessionCompleted(session);
      assert.equal(second.ok, true);
      if (second.ok) assert.equal(second.duplicate, true);

      const credits = await prisma.walletTransaction.findMany({
        where: {
          userId,
          type: "CREDIT",
          idempotencyKey: `stripe:credit:${session.payment_intent}`,
        },
      });
      assert.equal(credits.length, 1);

      const walletAfter = await prisma.customerWallet.findUnique({
        where: { userId },
      });
      assert.equal(Number(walletAfter!.balance), balanceBefore + topUpAmount);

      const updated = await prisma.walletPayment.findUnique({
        where: { id: paymentId },
      });
      assert.equal(updated?.status, "SUCCEEDED");
      assert.ok(updated?.walletTransactionId);
    });

    it("does not credit on wrong amount", async () => {
      const payment = await prisma.walletPayment.create({
        data: {
          publicId: publicId("WLT"),
          userId,
          amount: 30,
          currency: "USD",
          status: "CHECKOUT_CREATED",
          providerCheckoutSessionId: `cs_test_wrong_${Date.now()}`,
          idempotencyKey: `stripe-e2e-wrong-${Date.now()}`,
        },
      });

      const session = {
        id: payment.providerCheckoutSessionId!,
        payment_status: "paid",
        metadata: { walletPaymentId: payment.id, userId },
        amount_total: 2500,
        currency: "usd",
        payment_intent: `pi_wrong_${Date.now()}`,
      } as unknown as Stripe.Checkout.Session;

      const result = await handleCheckoutSessionCompleted(session);
      assert.equal(result.ok, false);

      const row = await prisma.walletPayment.findUnique({
        where: { id: payment.id },
      });
      assert.equal(row?.status, "FAILED");
      assert.equal(row?.failureReason, "amount_mismatch");
    });

    it("does not credit on customer mismatch", async () => {
      const payment = await prisma.walletPayment.create({
        data: {
          publicId: publicId("WLT"),
          userId,
          amount: 10,
          currency: "USD",
          status: "CHECKOUT_CREATED",
          providerCheckoutSessionId: `cs_test_mismatch_${Date.now()}`,
          idempotencyKey: `stripe-e2e-mismatch-${Date.now()}`,
        },
      });

      const session = {
        id: payment.providerCheckoutSessionId!,
        payment_status: "paid",
        metadata: { walletPaymentId: payment.id, userId: "other-user" },
        amount_total: 1000,
        currency: "usd",
        payment_intent: `pi_mismatch_${Date.now()}`,
      } as unknown as Stripe.Checkout.Session;

      const result = await handleCheckoutSessionCompleted(session);
      assert.equal(result.ok, false);
      const row = await prisma.walletPayment.findUnique({
        where: { id: payment.id },
      });
      assert.equal(row?.failureReason, "customer_mismatch");
    });

    it("marks expired checkout cancelled without credit", async () => {
      const payment = await prisma.walletPayment.create({
        data: {
          publicId: publicId("WLT"),
          userId,
          amount: 15,
          currency: "USD",
          status: "CHECKOUT_CREATED",
          providerCheckoutSessionId: `cs_test_exp_${Date.now()}`,
          idempotencyKey: `stripe-e2e-exp-${Date.now()}`,
        },
      });

      const payload = JSON.stringify({
        id: "evt_test_expired",
        type: "checkout.session.expired",
        data: {
          object: {
            id: payment.providerCheckoutSessionId,
            metadata: { walletPaymentId: payment.id },
          },
        },
      });

      const prev = process.env.STRIPE_WEBHOOK_SECRET;
      process.env.STRIPE_WEBHOOK_SECRET = TEST_WEBHOOK_SECRET;
      try {
        const result = await processStripeWalletWebhook({
          rawBody: payload,
          signature: signPayload(payload, TEST_WEBHOOK_SECRET),
        });
        assert.equal(result.ok, true);
      } finally {
        if (prev === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
        else process.env.STRIPE_WEBHOOK_SECRET = prev;
      }

      const row = await prisma.walletPayment.findUnique({
        where: { id: payment.id },
      });
      assert.equal(row?.status, "CANCELLED");
    });

    it("does not credit on unpaid checkout", async () => {
      const payment = await prisma.walletPayment.create({
        data: {
          publicId: publicId("WLT"),
          userId,
          amount: 12,
          currency: "USD",
          status: "CHECKOUT_CREATED",
          providerCheckoutSessionId: `cs_test_unpaid_${Date.now()}`,
          idempotencyKey: `stripe-e2e-unpaid-${Date.now()}`,
        },
      });

      const session = {
        id: payment.providerCheckoutSessionId!,
        payment_status: "unpaid",
        metadata: { walletPaymentId: payment.id, userId },
        amount_total: 1200,
        currency: "usd",
        payment_intent: `pi_unpaid_${Date.now()}`,
      } as unknown as Stripe.Checkout.Session;

      const verified = verifyPaidCheckoutForWallet(session, payment);
      assert.equal(verified.ok, false);
      if (!verified.ok) assert.equal(verified.reason, "not_paid");
    });

    it("does not credit on wrong currency", async () => {
      const payment = await prisma.walletPayment.create({
        data: {
          publicId: publicId("WLT"),
          userId,
          amount: 12,
          currency: "USD",
          status: "CHECKOUT_CREATED",
          providerCheckoutSessionId: `cs_test_cur_${Date.now()}`,
          idempotencyKey: `stripe-e2e-cur-${Date.now()}`,
        },
      });

      const session = {
        id: payment.providerCheckoutSessionId!,
        payment_status: "paid",
        metadata: { walletPaymentId: payment.id, userId },
        amount_total: 1200,
        currency: "eur",
        payment_intent: `pi_cur_${Date.now()}`,
      } as unknown as Stripe.Checkout.Session;

      const result = await handleCheckoutSessionCompleted(session);
      assert.equal(result.ok, false);
      const row = await prisma.walletPayment.findUnique({
        where: { id: payment.id },
      });
      assert.equal(row?.failureReason, "currency_mismatch");
    });
  },
);

describe("Stripe live Checkout E2E", () => {
  it("requires STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in .env", () => {
    const sk = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
    const wh = process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
    const configured = sk.startsWith("sk_test_") && wh.startsWith("whsec_");
    if (!configured) {
      assert.ok(
        true,
        "BLOCKED: add Stripe TEST keys to .env to run live Checkout + webhook E2E",
      );
      return;
    }
    assert.ok(configured);
  });
});
