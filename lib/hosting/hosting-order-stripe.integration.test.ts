import "@/lib/test/integration-env-loader";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type Stripe from "stripe";

import {
  createHostingOrderStripeCheckout,
  handleHostingOrderCheckoutCompleted,
  handleHostingOrderCheckoutExpired,
  handleHostingOrderPaymentIntentFailed,
} from "@/lib/hosting/hosting-order-stripe-payment";
import { handleCheckoutSessionCompleted } from "@/lib/payments/wallet-payment-service";
import { verifyPaidCheckoutForHostingOrder } from "@/lib/hosting/hosting-order-stripe-payment";
import { prisma } from "@/lib/prisma";
import { quoteHostingCart } from "@/lib/hosting/cart/pricing";
import { ensureHostingProductsSeeded } from "@/lib/hosting/seed-hosting-products";
import { isIntegrationDatabaseConfigured } from "@/lib/test/integration-gate";
import { Prisma } from "@prisma/client";

/** Same pattern as lib/payments/stripe-webhook.integration.test.ts — not real credentials. */
const TEST_WEBHOOK_SECRET = "whsec_integration_test_secret_only";
const TEST_STRIPE_KEY = "sk_test_integration_hostingbeyond_ci_only";

async function withIntegrationStripeConfigured<T>(
  fn: () => Promise<T>,
): Promise<T> {
  const prevSk = process.env.STRIPE_SECRET_KEY;
  const prevWh = process.env.STRIPE_WEBHOOK_SECRET;
  process.env.STRIPE_SECRET_KEY = TEST_STRIPE_KEY;
  process.env.STRIPE_WEBHOOK_SECRET = TEST_WEBHOOK_SECRET;
  try {
    return await fn();
  } finally {
    if (prevSk === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = prevSk;
    if (prevWh === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
    else process.env.STRIPE_WEBHOOK_SECRET = prevWh;
  }
}

const SEED_CART = {
  productSlug: "web-hosting",
  planKey: "essential",
  billingPeriod: "monthly" as const,
};

/** Order snapshot aligned with server quote (required for checkout create). */
async function seedQuotedOrder(userId: string) {
  const quote = await quoteHostingCart(SEED_CART);
  if (quote.errors.length) {
    throw new Error(`seedQuotedOrder: ${quote.errors.join(" ")}`);
  }
  return prisma.hostingOrder.create({
    data: {
      userId,
      status: "DRAFT",
      productSlug: SEED_CART.productSlug,
      planKey: SEED_CART.planKey,
      billingCycle: SEED_CART.billingPeriod,
      subtotal: new Prisma.Decimal(quote.subtotal),
      discount: new Prisma.Decimal(quote.discount),
      total: new Prisma.Decimal(quote.total),
      currency: quote.currency,
      configuration: SEED_CART,
    },
  });
}

/** Fixed total for webhook-only scenarios (no checkout quote path). */
async function seedWebhookOrder(userId: string, total: number) {
  return prisma.hostingOrder.create({
    data: {
      userId,
      status: "DRAFT",
      productSlug: SEED_CART.productSlug,
      planKey: SEED_CART.planKey,
      billingCycle: SEED_CART.billingPeriod,
      subtotal: new Prisma.Decimal(total),
      discount: new Prisma.Decimal(0),
      total: new Prisma.Decimal(total),
      currency: "USD",
      configuration: SEED_CART,
    },
  });
}

async function seedCheckout(
  orderId: string,
  userId: string,
  sessionId: string,
  idempotencyKey: string,
) {
  return prisma.hostingOrderCheckout.create({
    data: {
      hostingOrderId: orderId,
      userId,
      idempotencyKey,
      status: "CHECKOUT_CREATED",
      stripeCheckoutSessionId: sessionId,
    },
  });
}

describe(
  "Hosting order Stripe webhook (DB)",
  { skip: !isIntegrationDatabaseConfigured(), concurrency: 1 },
  () => {
    it("prepares hosting catalog for checkout quotes", async () => {
      await ensureHostingProductsSeeded();
    });

    it("marks order PAID once on verified checkout.session.completed", async () => {
      const user = await prisma.customerUser.create({
        data: { email: `host-stripe-${Date.now()}@example.test` },
      });
      const total = 19.99;
      const order = await seedWebhookOrder(user.id, total);
      const sessionId = `cs_test_hosting_${Date.now()}`;
      await seedCheckout(order.id, user.id, sessionId, `idem-${Date.now()}`);

      const session = {
        id: sessionId,
        payment_status: "paid",
        metadata: {
          purpose: "hosting_order",
          hostingOrderId: order.id,
          userId: user.id,
        },
        amount_total: Math.round(total * 100),
        currency: "usd",
        payment_intent: `pi_hosting_${Date.now()}`,
      } as unknown as Stripe.Checkout.Session;

      const verified = verifyPaidCheckoutForHostingOrder(session, order);
      assert.equal(verified.ok, true);

      const first = await handleCheckoutSessionCompleted(session);
      assert.equal(first.ok, true);
      if (first.ok) assert.equal(first.handled, true);

      const second = await handleCheckoutSessionCompleted(session);
      assert.equal(second.ok, true);
      if (second.ok) assert.equal(second.duplicate, true);

      const updated = await prisma.hostingOrder.findUnique({
        where: { id: order.id },
      });
      assert.equal(updated?.status, "PAID");
      assert.equal(updated?.paymentStatus, "succeeded");
      assert.ok(updated?.paidAt);
      assert.notEqual(updated?.status, "ACTIVE");

      await prisma.hostingOrderCheckout.deleteMany({
        where: { hostingOrderId: order.id },
      });
      await prisma.hostingOrder.delete({ where: { id: order.id } });
      await prisma.customerUser.delete({ where: { id: user.id } });
    });

    it("concurrent successful webhooks are idempotent", async () => {
      const user = await prisma.customerUser.create({
        data: { email: `host-conc-wh-${Date.now()}@example.test` },
      });
      const total = 22.5;
      const order = await seedWebhookOrder(user.id, total);
      const sessionId = `cs_conc_${Date.now()}`;
      await seedCheckout(order.id, user.id, sessionId, `idem-cw-${Date.now()}`);

      const session = {
        id: sessionId,
        payment_status: "paid",
        metadata: { hostingOrderId: order.id, userId: user.id },
        amount_total: Math.round(total * 100),
        currency: "usd",
        payment_intent: `pi_conc_${Date.now()}`,
      } as unknown as Stripe.Checkout.Session;

      const results = await Promise.all([
        handleCheckoutSessionCompleted(session),
        handleCheckoutSessionCompleted(session),
      ]);
      assert.ok(results.every((r) => r.ok));

      const updated = await prisma.hostingOrder.findUnique({
        where: { id: order.id },
      });
      assert.equal(updated?.status, "PAID");

      await prisma.hostingOrderCheckout.deleteMany({
        where: { hostingOrderId: order.id },
      });
      await prisma.hostingOrder.delete({ where: { id: order.id } });
      await prisma.customerUser.delete({ where: { id: user.id } });
    });

    it("rejects amount mismatch without marking PAID", async () => {
      const user = await prisma.customerUser.create({
        data: { email: `host-stripe-bad-${Date.now()}@example.test` },
      });
      const order = await seedWebhookOrder(user.id, 50);
      const sessionId = `cs_bad_${Date.now()}`;
      await seedCheckout(
        order.id,
        user.id,
        sessionId,
        `idem-bad-${Date.now()}`,
      );

      const session = {
        id: sessionId,
        payment_status: "paid",
        metadata: { hostingOrderId: order.id, userId: user.id },
        amount_total: 100,
        currency: "usd",
      } as unknown as Stripe.Checkout.Session;

      const result = await handleCheckoutSessionCompleted(session);
      assert.equal(result.ok, false);

      const updated = await prisma.hostingOrder.findUnique({
        where: { id: order.id },
      });
      assert.notEqual(updated?.status, "PAID");

      await prisma.hostingOrderCheckout.deleteMany({
        where: { hostingOrderId: order.id },
      });
      await prisma.hostingOrder.delete({ where: { id: order.id } });
      await prisma.customerUser.delete({ where: { id: user.id } });
    });

    it("rejects second paid checkout session when order is already PAID", async () => {
      const user = await prisma.customerUser.create({
        data: { email: `host-paid-2sess-${Date.now()}@example.test` },
      });
      const total = 30;
      const order = await seedWebhookOrder(user.id, total);
      const firstSessionId = `cs_first_${Date.now()}`;
      const piFirst = `pi_first_${Date.now()}`;
      await seedCheckout(
        order.id,
        user.id,
        firstSessionId,
        `idem-first-${Date.now()}`,
      );

      const paidSession = {
        id: firstSessionId,
        payment_status: "paid",
        metadata: { hostingOrderId: order.id, userId: user.id },
        amount_total: Math.round(total * 100),
        currency: "usd",
        payment_intent: piFirst,
      } as unknown as Stripe.Checkout.Session;

      const first = await handleCheckoutSessionCompleted(paidSession);
      assert.equal(first.ok, true);

      const paidOrder = await prisma.hostingOrder.findUnique({
        where: { id: order.id },
      });
      assert.equal(paidOrder?.status, "PAID");

      const secondSessionId = `cs_second_${Date.now()}`;
      const secondCheckout = await seedCheckout(
        order.id,
        user.id,
        secondSessionId,
        `idem-second-${Date.now()}`,
      );

      const secondPaidSession = {
        id: secondSessionId,
        payment_status: "paid",
        metadata: { hostingOrderId: order.id, userId: user.id },
        amount_total: Math.round(total * 100),
        currency: "usd",
        payment_intent: `pi_second_${Date.now()}`,
      } as unknown as Stripe.Checkout.Session;

      const second =
        await handleHostingOrderCheckoutCompleted(secondPaidSession);
      assert.equal(second.ok, false);
      if (!second.ok) {
        assert.equal(second.status, 409);
        assert.equal(second.error, "order_already_paid");
      }

      const stillPaid = await prisma.hostingOrder.findUnique({
        where: { id: order.id },
      });
      assert.equal(stillPaid?.status, "PAID");
      assert.equal(stillPaid?.paymentReference, piFirst);

      const secondRow = await prisma.hostingOrderCheckout.findUnique({
        where: { id: secondCheckout.id },
      });
      assert.notEqual(secondRow?.status, "COMPLETED");

      await prisma.hostingOrderCheckout.deleteMany({
        where: { hostingOrderId: order.id },
      });
      await prisma.hostingOrder.delete({ where: { id: order.id } });
      await prisma.customerUser.delete({ where: { id: user.id } });
    });

    it("rejects checkout.session.completed when payment_status is not paid", async () => {
      const user = await prisma.customerUser.create({
        data: { email: `host-unpaid-wh-${Date.now()}@example.test` },
      });
      const total = 18;
      const order = await seedWebhookOrder(user.id, total);
      const sessionId = `cs_unpaid_${Date.now()}`;
      const checkout = await seedCheckout(
        order.id,
        user.id,
        sessionId,
        `idem-unpaid-${Date.now()}`,
      );

      const session = {
        id: sessionId,
        payment_status: "unpaid",
        metadata: { hostingOrderId: order.id, userId: user.id },
        amount_total: Math.round(total * 100),
        currency: "usd",
        payment_intent: `pi_unpaid_${Date.now()}`,
      } as unknown as Stripe.Checkout.Session;

      const result = await handleCheckoutSessionCompleted(session);
      assert.equal(result.ok, false);
      if (!result.ok) assert.equal(result.error, "not_paid");

      const updated = await prisma.hostingOrder.findUnique({
        where: { id: order.id },
      });
      assert.notEqual(updated?.status, "PAID");
      assert.equal(updated?.paymentStatus, "failed:not_paid");

      const checkoutAfter = await prisma.hostingOrderCheckout.findUnique({
        where: { id: checkout.id },
      });
      assert.equal(checkoutAfter?.status, "FAILED");
      assert.equal(checkoutAfter?.failureReason, "not_paid");

      await prisma.hostingOrderCheckout.deleteMany({
        where: { hostingOrderId: order.id },
      });
      await prisma.hostingOrder.delete({ where: { id: order.id } });
      await prisma.customerUser.delete({ where: { id: user.id } });
    });

    it("marks hosting checkout failed on payment_intent.payment_failed", async () => {
      const user = await prisma.customerUser.create({
        data: { email: `host-pi-fail-${Date.now()}@example.test` },
      });
      const total = 21;
      const order = await seedWebhookOrder(user.id, total);
      const sessionId = `cs_pi_fail_${Date.now()}`;
      const checkout = await seedCheckout(
        order.id,
        user.id,
        sessionId,
        `idem-pi-fail-${Date.now()}`,
      );
      await prisma.hostingOrder.update({
        where: { id: order.id },
        data: {
          status: "PENDING_PAYMENT",
          paymentProvider: "stripe",
          paymentReference: sessionId,
          paymentStatus: "checkout_created",
        },
      });

      const intent = {
        id: `pi_fail_${Date.now()}`,
        metadata: {
          hostingOrderId: order.id,
          hostingCheckoutId: checkout.id,
          userId: user.id,
        },
        last_payment_error: { message: "card_declined" },
      } as unknown as Stripe.PaymentIntent;

      const result = await handleHostingOrderPaymentIntentFailed(intent);
      assert.equal(result.ok, true);
      if (result.ok) assert.equal(result.handled, true);

      const updated = await prisma.hostingOrder.findUnique({
        where: { id: order.id },
      });
      assert.notEqual(updated?.status, "PAID");
      assert.equal(updated?.paymentStatus, "failed:card_declined");

      const checkoutAfter = await prisma.hostingOrderCheckout.findUnique({
        where: { id: checkout.id },
      });
      assert.equal(checkoutAfter?.status, "FAILED");
      assert.equal(checkoutAfter?.failureReason, "card_declined");

      await prisma.hostingOrderCheckout.deleteMany({
        where: { hostingOrderId: order.id },
      });
      await prisma.hostingOrder.delete({ where: { id: order.id } });
      await prisma.customerUser.delete({ where: { id: user.id } });
    });

    it("rejects unknown checkout session (second paid session)", async () => {
      const user = await prisma.customerUser.create({
        data: { email: `host-stripe-2sess-${Date.now()}@example.test` },
      });
      const order = await seedWebhookOrder(user.id, 25);
      await seedCheckout(
        order.id,
        user.id,
        "cs_registered",
        `idem-reg-${Date.now()}`,
      );

      const rogueSession = {
        id: "cs_rogue",
        payment_status: "paid",
        metadata: { hostingOrderId: order.id, userId: user.id },
        amount_total: 2500,
        currency: "usd",
        payment_intent: "pi_rogue",
      } as unknown as Stripe.Checkout.Session;

      const result = await handleHostingOrderCheckoutCompleted(rogueSession);
      assert.equal(result.ok, false);

      const updated = await prisma.hostingOrder.findUnique({
        where: { id: order.id },
      });
      assert.notEqual(updated?.status, "PAID");

      await prisma.hostingOrderCheckout.deleteMany({
        where: { hostingOrderId: order.id },
      });
      await prisma.hostingOrder.delete({ where: { id: order.id } });
      await prisma.customerUser.delete({ where: { id: user.id } });
    });

    it("expired event does not downgrade a paid order", async () => {
      const user = await prisma.customerUser.create({
        data: { email: `host-exp-paid-${Date.now()}@example.test` },
      });
      const order = await prisma.hostingOrder.create({
        data: {
          userId: user.id,
          status: "PAID",
          productSlug: "web-hosting",
          planKey: "starter",
          billingCycle: "monthly",
          subtotal: new Prisma.Decimal(10),
          discount: new Prisma.Decimal(0),
          total: new Prisma.Decimal(10),
          currency: "USD",
          configuration: {},
          paymentStatus: "succeeded",
          paymentReference: "pi_done",
        },
      });
      const checkout = await seedCheckout(
        order.id,
        user.id,
        "cs_old",
        `idem-exp-${Date.now()}`,
      );

      const expired = {
        id: "cs_old",
        metadata: { hostingOrderId: order.id },
      } as unknown as Stripe.Checkout.Session;

      const result = await handleHostingOrderCheckoutExpired(expired);
      assert.equal(result.ok, true);

      const stillPaid = await prisma.hostingOrder.findUnique({
        where: { id: order.id },
      });
      assert.equal(stillPaid?.status, "PAID");

      const checkoutAfter = await prisma.hostingOrderCheckout.findUnique({
        where: { id: checkout.id },
      });
      assert.equal(checkoutAfter?.status, "CHECKOUT_CREATED");

      await prisma.hostingOrderCheckout.deleteMany({
        where: { hostingOrderId: order.id },
      });
      await prisma.hostingOrder.delete({ where: { id: order.id } });
      await prisma.customerUser.delete({ where: { id: user.id } });
    });

    it("blocks two open checkout rows per order (partial unique index)", async () => {
      const user = await prisma.customerUser.create({
        data: { email: `host-unique-${Date.now()}@example.test` },
      });
      const order = await seedQuotedOrder(user.id);

      await seedCheckout(
        order.id,
        user.id,
        `cs_a_${Date.now()}`,
        `idem-a-${Date.now()}`,
      );

      try {
        await prisma.hostingOrderCheckout.create({
          data: {
            hostingOrderId: order.id,
            userId: user.id,
            idempotencyKey: `idem-b-${Date.now()}`,
            status: "CHECKOUT_CREATED",
            stripeCheckoutSessionId: `cs_b_${Date.now()}`,
          },
        });
        assert.fail("expected unique violation");
      } catch (err) {
        assert.equal((err as { code?: string }).code, "P2002");
      }

      await prisma.hostingOrderCheckout.deleteMany({
        where: { hostingOrderId: order.id },
      });
      await prisma.hostingOrder.delete({ where: { id: order.id } });
      await prisma.customerUser.delete({ where: { id: user.id } });
    });

    it("concurrent checkout requests share one Stripe session", async () => {
      await withIntegrationStripeConfigured(async () => {
        const user = await prisma.customerUser.create({
          data: { email: `host-conc-${Date.now()}@example.test` },
        });
        const order = await seedQuotedOrder(user.id);

        let stripeCreates = 0;
        const sessionId = `cs_mock_${Date.now()}`;
        const mockCreate = async () => {
          stripeCreates += 1;
          return {
            id: sessionId,
            url: "https://checkout.stripe.test/pay",
            status: "open",
          } as Stripe.Checkout.Session;
        };
        const mockRetrieve = async (id: string) =>
          ({
            id,
            url: "https://checkout.stripe.test/pay",
            status: "open",
          }) as Stripe.Checkout.Session;

        const [a, b] = await Promise.all([
          createHostingOrderStripeCheckout(
            {
              orderId: order.id,
              userId: user.id,
              idempotencyKey: `key-a-${Date.now()}`,
            },
            { createSession: mockCreate, retrieveSession: mockRetrieve },
          ),
          createHostingOrderStripeCheckout(
            {
              orderId: order.id,
              userId: user.id,
              idempotencyKey: `key-b-${Date.now()}`,
            },
            { createSession: mockCreate, retrieveSession: mockRetrieve },
          ),
        ]);

        assert.equal(stripeCreates, 1);
        assert.equal(a.ok, true);
        assert.equal(b.ok, true);
        if (a.ok && b.ok) {
          assert.equal(a.checkoutUrl, b.checkoutUrl);
        }

        const openRows = await prisma.hostingOrderCheckout.count({
          where: {
            hostingOrderId: order.id,
            status: "CHECKOUT_CREATED",
          },
        });
        assert.equal(openRows, 1);

        await prisma.hostingOrderCheckout.deleteMany({
          where: { hostingOrderId: order.id },
        });
        await prisma.hostingOrder.delete({ where: { id: order.id } });
        await prisma.customerUser.delete({ where: { id: user.id } });
      });
    });

    it("retries after ambiguous create reuse the same session via idempotency row", async () => {
      await withIntegrationStripeConfigured(async () => {
        const user = await prisma.customerUser.create({
          data: { email: `host-retry-${Date.now()}@example.test` },
        });
        const order = await seedQuotedOrder(user.id);
        const idempotencyKey = `retry-key-${Date.now()}`;
        const sessionId = `cs_retry_${Date.now()}`;
        let calls = 0;

        const mockCreate = async () => {
          calls += 1;
          return {
            id: sessionId,
            url: "https://checkout.stripe.test/retry",
            status: "open",
          } as Stripe.Checkout.Session;
        };
        const mockRetrieve = async (id: string) =>
          ({
            id,
            url: "https://checkout.stripe.test/retry",
            status: "open",
          }) as Stripe.Checkout.Session;

        const first = await createHostingOrderStripeCheckout(
          { orderId: order.id, userId: user.id, idempotencyKey },
          { createSession: mockCreate, retrieveSession: mockRetrieve },
        );
        const second = await createHostingOrderStripeCheckout(
          { orderId: order.id, userId: user.id, idempotencyKey },
          { createSession: mockCreate, retrieveSession: mockRetrieve },
        );

        assert.equal(calls, 1);
        assert.equal(first.ok, true);
        assert.equal(second.ok, true);

        await prisma.hostingOrderCheckout.deleteMany({
          where: { hostingOrderId: order.id },
        });
        await prisma.hostingOrder.delete({ where: { id: order.id } });
        await prisma.customerUser.delete({ where: { id: user.id } });
      });
    });

    it("rethrows when mocked Stripe session creation fails and rolls back checkout row", async () => {
      await withIntegrationStripeConfigured(async () => {
        const user = await prisma.customerUser.create({
          data: { email: `host-stripe-down-${Date.now()}@example.test` },
        });
        const order = await seedQuotedOrder(user.id);
        const idempotencyKey = `stripe-fail-${Date.now()}`;

        await assert.rejects(
          async () =>
            createHostingOrderStripeCheckout(
              {
                orderId: order.id,
                userId: user.id,
                idempotencyKey,
              },
              {
                createSession: async () => {
                  throw new Error("stripe_down");
                },
                retrieveSession: async (id) =>
                  ({
                    id,
                    url: "https://checkout.stripe.test/unused",
                    status: "open",
                  }) as Stripe.Checkout.Session,
              },
            ),
          (err: unknown) =>
            err instanceof Error && err.message === "stripe_down",
        );

        const orderAfter = await prisma.hostingOrder.findUnique({
          where: { id: order.id },
        });
        assert.equal(orderAfter?.status, "DRAFT");
        assert.equal(orderAfter?.paymentStatus, null);

        const checkoutCount = await prisma.hostingOrderCheckout.count({
          where: { hostingOrderId: order.id },
        });
        assert.equal(checkoutCount, 0);

        await prisma.hostingOrder.delete({ where: { id: order.id } });
        await prisma.customerUser.delete({ where: { id: user.id } });
      });
    });
  },
);
