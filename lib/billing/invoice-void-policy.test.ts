import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { voidRejectionReason } from "@/lib/billing/invoice-void-policy";

describe("voidRejectionReason", () => {
  it("allows ISSUED", () => {
    assert.equal(voidRejectionReason("ISSUED"), null);
  });

  it("rejects PAID", () => {
    assert.equal(voidRejectionReason("PAID"), "void_not_allowed_for_paid");
  });

  it("allows idempotent VOID", () => {
    assert.equal(voidRejectionReason("VOID"), null);
  });

  it("rejects DRAFT", () => {
    assert.equal(voidRejectionReason("DRAFT"), "void_not_allowed");
  });
});
