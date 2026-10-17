import "@/lib/test/integration-env-loader";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type Stripe from "stripe";

import {
  createHostingOrderStripeCheckout,
  handleHostingOrderCheckoutCompleted,
  handleHostingOrderCheckoutExpired,
} from "@/lib/hosting/hosting-order-stripe-payment";
import { handleCheckoutSessionCompleted } from "@/lib/payments/wallet-payment-service";
import { verifyPaidCheckoutForHostingOrder } from "@/lib/hosting/hosting-order-stripe-payment";
import { prisma } from "@/lib/prisma";
import { ensureHostingProductsSeeded } from "@/lib/hosting/seed-hosting-products";
import { isIntegrationDatabaseConfigured } from "@/lib/test/integration-gate";
import { Prisma } from "@prisma/client";

async function seedOrder(userId: string, total = 19.99) {
  return prisma.hostingOrder.create({
    data: {
      userId,
      status: "DRAFT",
      productSlug: "web-hosting",
      planKey: "starter",
      billingCycle: "monthly",
      subtotal: new Prisma.Decimal(total),
      discount: new Prisma.Decimal(0),
      total: new Prisma.Decimal(total),
      currency: "USD",
      configuration: {
        productSlug: "web-hosting",
        planKey: "starter",
        billingPeriod: "monthly",
      },
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
      const order = await seedOrder(user.id, total);
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
      const order = await seedOrder(user.id, total);
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
      const order = await seedOrder(user.id, 50);
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

    it("rejects unknown checkout session (second paid session)", async () => {
      const user = await prisma.customerUser.create({
        data: { email: `host-stripe-2sess-${Date.now()}@example.test` },
      });
      const order = await seedOrder(user.id, 25);
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
      const order = await seedOrder(user.id);

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
      const user = await prisma.customerUser.create({
        data: { email: `host-conc-${Date.now()}@example.test` },
      });
      const order = await seedOrder(user.id, 12);

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

    it("retries after ambiguous create reuse the same session via idempotency row", async () => {
      const user = await prisma.customerUser.create({
        data: { email: `host-retry-${Date.now()}@example.test` },
      });
      const order = await seedOrder(user.id, 15);
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
  },
);
