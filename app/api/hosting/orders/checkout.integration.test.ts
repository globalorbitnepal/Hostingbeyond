import "@/lib/test/integration-env-loader";

import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { Prisma } from "@prisma/client";

import { setCustomerSessionTestOverride } from "@/lib/test/customer-session-test-control";
import { isIntegrationDatabaseConfigured } from "@/lib/test/integration-gate";
import { prisma } from "@/lib/prisma";

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
  },
);
