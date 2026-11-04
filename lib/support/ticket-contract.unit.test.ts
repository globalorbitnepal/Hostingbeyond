import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  validateSupportTicketDraft,
  validateTransactionalMail,
} from "@/lib/support/ticket-contract";

describe("support ticket contract", () => {
  it("rejects unauthenticated or empty drafts", () => {
    const missingUser = validateSupportTicketDraft({
      subject: "Help",
      body: "I cannot log in to my account",
    });
    assert.equal(missingUser.ok, false);
  });

  it("accepts a well-formed draft without claiming persistence", () => {
    const ok = validateSupportTicketDraft({
      subject: "Billing question",
      body: "Please explain last month's invoice total.",
      customerUserId: "user_1",
    });
    assert.equal(ok.ok, true);
  });
});

describe("transactional mail contract", () => {
  it("never reports a successful send", () => {
    const result = validateTransactionalMail({
      to: "customer@example.com",
      template: "support-ticket-received",
      vars: { ticketId: "not-persisted" },
    });
    assert.deepEqual(result, { ok: false, reason: "not_configured" });
  });

  it("rejects header-injection recipients", () => {
    const injected = validateTransactionalMail({
      to: "victim@example.com\nBcc: other@example.com",
      template: "order-paid",
      vars: { orderPublicId: "ord_1" },
    });
    assert.deepEqual(injected, { ok: false, reason: "invalid_recipient" });
  });

  it("rejects unsafe template variables", () => {
    const unsafe = validateTransactionalMail({
      to: "user@example.com",
      template: "support-ticket-received",
      vars: { ticketPublicId: "id\nBcc: evil@example.com" },
    });
    assert.deepEqual(unsafe, { ok: false, reason: "unsafe_template_vars" });
  });
});
