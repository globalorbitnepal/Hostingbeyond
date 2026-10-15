import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveTransferProviderAction } from "@/lib/domains/transfer-provider-outcome";

describe("transfer provider outcome mapping", () => {
  it("unknown outcome keeps reservation for reconciliation", () => {
    const action = resolveTransferProviderAction({
      outcome: "unknown",
      domain: "x.com",
      errorCode: "timeout",
    });
    assert.equal(action.action, "reconciliation");
  });

  it("failed outcome rolls back reservation", () => {
    const action = resolveTransferProviderAction({
      outcome: "failed",
      domain: "x.com",
      errorCode: "bad_auth",
    });
    assert.equal(action.action, "failed");
  });

  it("success outcome finalizes reservation", () => {
    const action = resolveTransferProviderAction({
      outcome: "success",
      domain: "x.com",
      providerTransferId: "ord-1",
    });
    assert.equal(action.action, "submitted");
  });
});
