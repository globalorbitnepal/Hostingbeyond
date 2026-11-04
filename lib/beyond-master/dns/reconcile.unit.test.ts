import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { reconcileObservedDns } from "@/lib/beyond-master/dns/reconcile";

const executing = {
  status: "executing",
  providerStatus: "uncertain",
  verified: null,
  action: "add" as const,
  type: "A",
  host: "www",
  value: "203.0.113.10",
  recordId: null,
};

describe("dns read-only reconciliation", () => {
  it("does not repeat a write and does not overwrite a stored result", () => {
    const stored = reconcileObservedDns(
      {
        ...executing,
        status: "executed",
        providerStatus: "accepted",
        verified: true,
      },
      [],
    );
    assert.equal(stored.state, "verified");
    assert.equal(stored.usedStoredResult, true);
    assert.equal(stored.writesAttempted, 0);

    const rejected = reconcileObservedDns(
      {
        ...executing,
        status: "failed",
        providerStatus: "rejected",
        verified: false,
      },
      [{ type: "A", host: "www", value: "203.0.113.10" }],
    );
    assert.equal(rejected.state, "mismatched");
    assert.equal(rejected.usedStoredResult, true);
  });

  it("classifies an observed zone without calling a provider", () => {
    const matched = reconcileObservedDns(executing, [
      { type: "A", host: "www", value: "203.0.113.10" },
    ]);
    assert.equal(matched.state, "verified");
    assert.equal(matched.writesAttempted, 0);
    const missed = reconcileObservedDns(executing, [
      { type: "A", host: "www", value: "203.0.113.9" },
    ]);
    assert.equal(missed.state, "mismatched");
    const unread = reconcileObservedDns(executing, null);
    assert.equal(unread.state, "unresolved");
    const pending = reconcileObservedDns(
      { ...executing, status: "pending", providerStatus: null },
      [],
    );
    assert.equal(pending.state, "not_executed");
  });
});
