import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  canTransitionHostingOrderStatus,
  hostingOrderImpliesProvisioned,
  hostingOrderIsLive,
  noopHostingProvisioner,
} from "@/lib/hosting/provisioning";

describe("hosting provisioning boundaries", () => {
  it("does not treat paid orders as live hosting", () => {
    assert.equal(hostingOrderIsLive("PAID"), false);
    assert.equal(hostingOrderImpliesProvisioned("PAID"), false);
    assert.equal(hostingOrderIsLive("ACTIVE"), true);
  });

  it("blocks PAID → ACTIVE without a provisioner step", () => {
    assert.equal(canTransitionHostingOrderStatus("PAID", "ACTIVE"), false);
    assert.equal(canTransitionHostingOrderStatus("PAID", "PROVISIONING"), true);
    assert.equal(
      canTransitionHostingOrderStatus("PROVISIONING", "ACTIVE"),
      true,
    );
  });

  it("refuses to provision without a configured adapter", async () => {
    const paid = await noopHostingProvisioner.requestProvision({
      orderId: "ord_1",
      status: "PAID",
    });
    assert.equal(paid.ok, false);
    if (!paid.ok) assert.equal(paid.reason, "provisioner_not_configured");

    const unpaid = await noopHostingProvisioner.requestProvision({
      orderId: "ord_2",
      status: "PENDING_PAYMENT",
    });
    assert.equal(unpaid.ok, false);
    if (!unpaid.ok) assert.equal(unpaid.reason, "order_not_paid");
  });
});
