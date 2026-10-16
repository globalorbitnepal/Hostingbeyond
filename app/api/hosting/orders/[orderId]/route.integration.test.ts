import "@/lib/test/integration-env-loader";

import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { Prisma } from "@prisma/client";

import { createCustomerSession } from "@/lib/customer/session";
import { setCustomerSessionTestOverride } from "@/lib/test/customer-session-test-control";
import { isIntegrationDatabaseConfigured } from "@/lib/test/integration-gate";
import { prisma } from "@/lib/prisma";

describe(
  "GET /api/hosting/orders/[orderId]",
  { skip: !isIntegrationDatabaseConfigured(), concurrency: 1 },
  () => {
    afterEach(() => {
      setCustomerSessionTestOverride(null);
    });

    it("returns 401 without session", async () => {
      setCustomerSessionTestOverride(async () => null);
      const { GET } = await import("@/app/api/hosting/orders/[orderId]/route");
      const res = await GET(new Request("http://localhost/x"), {
        params: Promise.resolve({ orderId: "any" }),
      });
      assert.equal(res.status, 401);
    });

    it("returns 404 for another user's order", async () => {
      const owner = await prisma.customerUser.create({
        data: { email: `host-owner-${Date.now()}@example.test` },
      });
      const other = await prisma.customerUser.create({
        data: { email: `host-other-${Date.now()}@example.test` },
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
          configuration: {},
        },
      });
      const { token } = await createCustomerSession(other.id);
      const sessionUser = await prisma.customerUser.findUnique({
        where: { id: other.id },
      });
      assert.ok(sessionUser);
      setCustomerSessionTestOverride(async () => sessionUser);

      const { GET } = await import("@/app/api/hosting/orders/[orderId]/route");
      const res = await GET(new Request("http://localhost/x"), {
        params: Promise.resolve({ orderId: order.id }),
      });
      assert.equal(res.status, 404);

      await prisma.hostingOrder.delete({ where: { id: order.id } });
      await prisma.customerSession.deleteMany({
        where: { userId: { in: [owner.id, other.id] } },
      });
      await prisma.customerUser.deleteMany({
        where: { id: { in: [owner.id, other.id] } },
      });
    });

    it("returns 200 for owner", async () => {
      const owner = await prisma.customerUser.create({
        data: { email: `host-get-${Date.now()}@example.test` },
      });
      const order = await prisma.hostingOrder.create({
        data: {
          userId: owner.id,
          status: "DRAFT",
          productSlug: "web-hosting",
          planKey: "starter",
          billingCycle: "monthly",
          subtotal: new Prisma.Decimal(12.5),
          discount: new Prisma.Decimal(0),
          total: new Prisma.Decimal(12.5),
          configuration: { region: "us" },
        },
      });
      setCustomerSessionTestOverride(async () => owner);

      const { GET } = await import("@/app/api/hosting/orders/[orderId]/route");
      const res = await GET(new Request("http://localhost/x"), {
        params: Promise.resolve({ orderId: order.id }),
      });
      assert.equal(res.status, 200);
      const body = (await res.json()) as {
        order: { id: string; total: number };
      };
      assert.equal(body.order.id, order.id);
      assert.equal(body.order.total, 12.5);

      await prisma.hostingOrder.delete({ where: { id: order.id } });
      await prisma.customerUser.delete({ where: { id: owner.id } });
    });
  },
);
