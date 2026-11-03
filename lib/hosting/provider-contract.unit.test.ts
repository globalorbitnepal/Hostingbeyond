import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getConfiguredHostingProvisioner,
  hostingProvisionIdempotencyKey,
  noopHostingProvisioner,
  shouldDispatchHostingProvisionAfterPayment,
  statusAfterRawProviderConfirm,
} from "@/lib/hosting/provisioning";
import {
  parseHostingProviderAcceptPayload,
  parseHostingProviderConfirmPayload,
} from "@/lib/hosting/provider-contract";

describe("hosting provider payload parsing", () => {
  it("rejects incomplete accept payloads", () => {
    assert.equal(parseHostingProviderAcceptPayload({ ok: true }).ok, false);
    assert.equal(
      parseHostingProviderAcceptPayload({ accepted: true }).ok,
      false,
    );
    assert.equal(
      parseHostingProviderAcceptPayload({
        accepted: true,
        providerRequestId: "short",
      }).ok,
      false,
    );
  });

  it("accepts a complete accept payload", () => {
    const parsed = parseHostingProviderAcceptPayload({
      accepted: true,
      providerRequestId: "provreq_12345678",
    });
    assert.equal(parsed.ok, true);
  });

  it("rejects confirm success without an account ref", () => {
    assert.equal(
      parseHostingProviderConfirmPayload({ confirmed: true }).ok,
      false,
    );
    assert.equal(parseHostingProviderConfirmPayload({ ok: true }).ok, false);
  });

  it("parses retryable failure confirms", () => {
    const parsed = parseHostingProviderConfirmPayload({
      confirmed: false,
      retryable: true,
      errorCode: "capacity",
    });
    assert.equal(parsed.ok, true);
    if (parsed.ok && parsed.payload.confirmed === false) {
      assert.equal(parsed.payload.retryable, true);
    }
  });

  it("does not activate on invalid confirm JSON", () => {
    assert.equal(
      statusAfterRawProviderConfirm("PROVISIONING", { ok: true }),
      "PROVISIONING",
    );
    assert.equal(
      statusAfterRawProviderConfirm("PROVISIONING", {
        confirmed: true,
        providerAccountRef: "acct_live_1",
      }),
      "ACTIVE",
    );
    assert.equal(
      statusAfterRawProviderConfirm("PAID", {
        confirmed: true,
        providerAccountRef: "acct_live_1",
      }),
      "PAID",
    );
  });
});

describe("payment webhook vs provision dispatch", () => {
  it("re-dispatches provision on duplicate payment webhooks when order stays PAID", () => {
    assert.equal(
      shouldDispatchHostingProvisionAfterPayment({
        webhookDuplicate: true,
        orderStatus: "PAID",
      }),
      true,
    );
    assert.equal(
      shouldDispatchHostingProvisionAfterPayment({
        webhookDuplicate: true,
        orderStatus: "PENDING_PAYMENT",
      }),
      false,
    );
    assert.equal(
      shouldDispatchHostingProvisionAfterPayment({
        webhookDuplicate: false,
        orderStatus: "PAID",
      }),
      true,
    );
    assert.equal(
      shouldDispatchHostingProvisionAfterPayment({
        webhookDuplicate: false,
        orderStatus: "PENDING_PAYMENT",
      }),
      false,
    );
  });

  it("production resolver is the no-op adapter", () => {
    assert.equal(getConfiguredHostingProvisioner(), noopHostingProvisioner);
    assert.ok(
      hostingProvisionIdempotencyKey("ord_1", "pi_1").startsWith(
        "hosting-provision:",
      ),
    );
  });
});
