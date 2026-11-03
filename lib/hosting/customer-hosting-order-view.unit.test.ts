import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildCustomerHostingOrderView } from "@/lib/hosting/customer-hosting-order-view";

describe("customer hosting order view", () => {
  it("does not expose provider internals", () => {
    const view = buildCustomerHostingOrderView({
      id: "ord_1",
      status: "PAID",
      paymentStatus: "succeeded",
      productSlug: "shared",
      planKey: "pro",
      billingCycle: "monthly",
      currency: "USD",
    });
    assert.equal(view.provisioningPhase, "paid_pending_activation");
    assert.equal(JSON.stringify(view).includes("HOSTING_PROVISIONER"), false);
    assert.equal(JSON.stringify(view).includes("providerRequestId"), false);
  });

  it("maps active orders to a safe message", () => {
    const view = buildCustomerHostingOrderView({
      id: "ord_2",
      status: "ACTIVE",
      paymentStatus: "succeeded",
      productSlug: "shared",
      planKey: "pro",
      billingCycle: "monthly",
      currency: "USD",
    });
    assert.equal(view.provisioningPhase, "active");
    assert.match(view.userMessage, /active/i);
  });
});
