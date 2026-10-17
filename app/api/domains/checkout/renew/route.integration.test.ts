import "@/lib/test/integration-env-loader";

import assert from "node:assert/strict";
import { describe, it, afterEach } from "node:test";

import { setCustomerSessionTestOverride } from "@/lib/test/customer-session-test-control";
import { setRenewalCheckoutTestOverride } from "@/lib/test/renewal-checkout-test-control";
import { prisma } from "@/lib/prisma";
import { isIntegrationDatabaseConfigured } from "@/lib/test/integration-gate";

describe(
  "POST /api/domains/checkout/renew (HTTP integration)",
  { skip: !isIntegrationDatabaseConfigured(), concurrency: 1 },
  () => {
    afterEach(() => {
      setCustomerSessionTestOverride(null);
      setRenewalCheckoutTestOverride(null);
    });

    it("returns 409 when checkout reports in-flight conflict (P2002 path)", async () => {
      const email = `renew-route-409-${Date.now()}@example.test`;
      const user = await prisma.customerUser.create({ data: { email } });
      setCustomerSessionTestOverride(async () => user);

      setRenewalCheckoutTestOverride(async () => ({
        ok: false as const,
        error: "A renewal for this domain is already in progress.",
        status: 409,
      }));

      const { POST } = await import("@/app/api/domains/checkout/renew/route");
      const response = await POST(
        new Request("http://localhost/api/domains/checkout/renew", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            domain: "example.com",
            idempotencyKey: `http-409-${Date.now()}`,
          }),
        }),
      );

      assert.equal(response.status, 409);
      const body = await response.json();
      assert.match(body.error, /already in progress/i);

      await prisma.customerUser.delete({ where: { id: user.id } });
    });
  },
);
