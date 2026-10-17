import "@/lib/test/integration-env-loader";

import assert from "node:assert/strict";
import { describe, it, afterEach } from "node:test";

import {
  createCustomerSession,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { setCustomerSessionTestOverride } from "@/lib/test/customer-session-test-control";
import { prisma } from "@/lib/prisma";
import { isIntegrationDatabaseConfigured } from "@/lib/test/integration-gate";

describe(
  "Domain orders API session (HTTP integration)",
  { skip: !isIntegrationDatabaseConfigured(), concurrency: 1 },
  () => {
    afterEach(() => {
      setCustomerSessionTestOverride(null);
    });

    it("GET /api/domains/orders returns 401 without session before listing orders", async () => {
      setCustomerSessionTestOverride(async () => null);

      const { GET } = await import("@/app/api/domains/orders/route");
      const response = await GET(
        new Request("http://localhost/api/domains/orders"),
      );

      assert.equal(response.status, 401);
      const body = await response.json();
      assert.match(body.error, /sign in/i);
    });

    it("GET /api/domains/orders returns 200 with valid session token", async () => {
      const email = `orders-session-${Date.now()}@example.test`;
      const user = await prisma.customerUser.create({ data: { email } });
      const { token } = await createCustomerSession(user.id);
      const sessionUser = await getCustomerFromToken(token);
      assert.ok(sessionUser);

      setCustomerSessionTestOverride(async () => sessionUser);

      const { GET } = await import("@/app/api/domains/orders/route");
      const response = await GET(
        new Request("http://localhost/api/domains/orders"),
      );

      assert.equal(response.status, 200);
      const body = await response.json();
      assert.ok(Array.isArray(body.orders));

      await prisma.customerSession.deleteMany({ where: { userId: user.id } });
      await prisma.customerUser.delete({ where: { id: user.id } });
    });
  },
);
