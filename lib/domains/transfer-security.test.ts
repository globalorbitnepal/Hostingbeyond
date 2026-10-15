import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  internalTransferErrorNote,
  TRANSFER_IN_PROGRESS_STATUSES,
} from "@/lib/domains/transfer-security";
import { checkTransferEligibility } from "@/lib/domains/transfer";

describe("transfer security helpers", () => {
  it("in-progress statuses include pending payment", () => {
    assert.ok(TRANSFER_IN_PROGRESS_STATUSES.includes("PENDING_PAYMENT"));
  });

  it("internalTransferErrorNote strips unsafe characters", () => {
    assert.equal(
      internalTransferErrorNote("bad auth code: XyZ9-secret-key"),
      "bad_auth_code__XyZ9-secret-key",
    );
  });

  it("legacy catalogue check never confirms registrar eligibility", () => {
    const row = checkTransferEligibility("google.com");
    assert.equal(row.transferEligibilityConfirmed, false);
    if (row.eligible) {
      assert.equal(row.registryCheckOnly, true);
      assert.match(row.message, /not a guarantee|appears registered/i);
    }
  });
});
