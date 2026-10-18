import "@/lib/test/integration-env-loader";

import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { Prisma } from "@prisma/client";

import { quoteHostingCart } from "@/lib/hosting/cart/pricing";
import { ensureHostingProductsSeeded } from "@/lib/hosting/seed-hosting-products";
import { setCustomerSessionTestOverride } from "@/lib/test/customer-session-test-control";
import { isIntegrationDatabaseConfigured } from "@/lib/test/integration-gate";
import { prisma } from "@/lib/prisma";

const SEED_CART = {
  productSlug: "web-hosting",
  planKey: "essential",
  billingPeriod: "monthly" as const,
};

async function seedQuotedOrderForOwner(userId: string) {
  const quote = await quoteHostingCart(SEED_CART);
  if (quote.errors.length) {
    throw new Error(`seedQuotedOrderForOwner: ${quote.errors.join(" ")}`);
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

describe(
  "POST /api/hosting/orders/[orderId]/checkout",
  { skip: !isIntegrationDatabaseConfigured(), concurrency: 1 },
  () => {
    afterEach(() => {
      setCustomerSessionTestOverride(null);
    });

    it("returns 401 without session", async () => {
      setCustomerSessionTestOverride(async () => null);
      const { POST } =
        await import("@/app/api/hosting/orders/[orderId]/checkout/route");
      const res = await POST(
        new Request("http://localhost/x", { method: "POST" }),
        {
          params: Promise.resolve({ orderId: "any" }),
        },
      );
      assert.equal(res.status, 401);
    });

    it("returns 404 for another user's order", async () => {
      const owner = await prisma.customerUser.create({
        data: { email: `host-co-${Date.now()}@example.test` },
      });
      const other = await prisma.customerUser.create({
        data: { email: `host-co2-${Date.now()}@example.test` },
      });
      const order = await prisma.hostingOrder.create({
        data: {
          userId: owner.id,
          status: "DRAFT",
          productSlug: "web-hosting",
          planKey: "starter",
          billingCycle: "monthly",
          subtotal: new Prisma.Decimal(10),
          discount: new Prisma.Decimal(0),
          total: new Prisma.Decimal(10),
          currency: "USD",
          configuration: {
            productSlug: "web-hosting",
            planKey: "starter",
            billingPeriod: "monthly",
          },
        },
      });
      setCustomerSessionTestOverride(async () => other);

      const { POST } =
        await import("@/app/api/hosting/orders/[orderId]/checkout/route");
      const res = await POST(
        new Request("http://localhost/x", { method: "POST" }),
        {
          params: Promise.resolve({ orderId: order.id }),
        },
      );
      assert.equal(res.status, 404);

      await prisma.hostingOrder.delete({ where: { id: order.id } });
      await prisma.customerUser.deleteMany({
        where: { id: { in: [owner.id, other.id] } },
      });
    });

    it("returns 503 when Stripe payment configuration is missing", async () => {
      await ensureHostingProductsSeeded();

      const owner = await prisma.customerUser.create({
        data: { email: `host-co-503-${Date.now()}@example.test` },
      });
      const order = await seedQuotedOrderForOwner(owner.id);
      setCustomerSessionTestOverride(async () => owner);

      const prevSk = process.env.STRIPE_SECRET_KEY;
      const prevWh = process.env.STRIPE_WEBHOOK_SECRET;
      delete process.env.STRIPE_SECRET_KEY;
      delete process.env.STRIPE_WEBHOOK_SECRET;

      try {
        const { POST } =
          await import("@/app/api/hosting/orders/[orderId]/checkout/route");
        const res = await POST(
          new Request("http://localhost/x", { method: "POST" }),
          {
            params: Promise.resolve({ orderId: order.id }),
          },
        );
        assert.equal(res.status, 503);
        const body = (await res.json()) as { error?: string };
        assert.equal(
          body.error,
          "Online payment for hosting is not configured yet. Contact support to complete your order.",
        );

        const openCheckouts = await prisma.hostingOrderCheckout.count({
          where: {
            hostingOrderId: order.id,
            status: "CHECKOUT_CREATED",
          },
        });
        assert.equal(openCheckouts, 0);

        const anyCheckouts = await prisma.hostingOrderCheckout.count({
          where: {
            hostingOrderId: order.id,
            stripeCheckoutSessionId: { not: null },
          },
        });
        assert.equal(anyCheckouts, 0);

        const orderAfter = await prisma.hostingOrder.findUnique({
          where: { id: order.id },
        });
        assert.equal(orderAfter?.status, "DRAFT");
      } finally {
        if (prevSk === undefined) delete process.env.STRIPE_SECRET_KEY;
        else process.env.STRIPE_SECRET_KEY = prevSk;
        if (prevWh === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
        else process.env.STRIPE_WEBHOOK_SECRET = prevWh;
      }

      await prisma.hostingOrderCheckout.deleteMany({
        where: { hostingOrderId: order.id },
      });
      await prisma.hostingOrder.delete({ where: { id: order.id } });
      await prisma.customerUser.delete({ where: { id: owner.id } });
    });
  },
);
