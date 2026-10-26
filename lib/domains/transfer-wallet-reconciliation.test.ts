import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isConfirmedTransferProviderFailure } from "@/lib/domains/transfer-wallet-reconciliation";
import { resolveTransferProviderAction } from "@/lib/domains/transfer-provider-outcome";

describe("transfer wallet reconciliation policy", () => {
  it("unknown provider outcome maps to reconciliation not failure", () => {
    const action = resolveTransferProviderAction({
      outcome: "unknown",
      domain: "a.com",
    });
    assert.equal(action.action, "reconciliation");
  });

  it("failed provider outcome maps to failed", () => {
    const action = resolveTransferProviderAction({
      outcome: "failed",
      domain: "a.com",
      errorCode: "x",
    });
    assert.equal(action.action, "failed");
  });

  it("does not treat ambiguous statuses as confirmed failure", () => {
    assert.equal(isConfirmedTransferProviderFailure("pending"), false);
    assert.equal(isConfirmedTransferProviderFailure("unknown"), false);
    assert.equal(isConfirmedTransferProviderFailure("in progress"), false);
  });

  it("treats explicit failure statuses as confirmed failure", () => {
    assert.equal(isConfirmedTransferProviderFailure("Transfer Failed"), true);
    assert.equal(isConfirmedTransferProviderFailure("cancelled"), true);
  });
});
