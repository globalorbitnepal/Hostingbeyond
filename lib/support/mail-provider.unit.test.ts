import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  attemptTransactionalMail,
  disabledMailProvider,
  getConfiguredMailProvider,
  isMailTransportConfigured,
  mailIdempotencyKey,
  mailLogFields,
  mailProviderConfigFlags,
  nextMailAttempt,
  validateMailTemplateVars,
} from "@/lib/support/mail-provider";

const baseMessage = {
  to: "customer@example.com",
  template: "support-ticket-received" as const,
  vars: { ticketPublicId: "tck_1" },
};

describe("mail provider (delivery disabled)", () => {
  it("never reports a successful send", async () => {
    const result = await attemptTransactionalMail(baseMessage);
    assert.deepEqual(result, { ok: false, reason: "not_configured" });
    assert.equal(getConfiguredMailProvider(), disabledMailProvider);
  });

  it("requires template variables and rejects HTML injection", () => {
    const missing = validateMailTemplateVars({
      ...baseMessage,
      vars: {},
    });
    assert.deepEqual(missing, { ok: false, reason: "invalid_template_vars" });
    const injected = validateMailTemplateVars({
      ...baseMessage,
      vars: { ticketPublicId: "<script>alert(1)</script>" },
    });
    assert.deepEqual(injected, { ok: false, reason: "unsafe_template_vars" });
    const header = validateMailTemplateVars({
      ...baseMessage,
      vars: { ticketPublicId: "id\nBcc: other@example.com" },
    });
    assert.deepEqual(header, { ok: false, reason: "unsafe_template_vars" });
  });

  it("logs template and recipient length without the address or body", () => {
    const fields = mailLogFields(baseMessage, {
      ok: false,
      reason: "not_configured",
    });
    const serialized = JSON.stringify(fields);
    assert.equal(serialized.includes("customer@example.com"), false);
    assert.equal(fields.template, "support-ticket-received");
    assert.ok(fields.recipientLength > 0);
  });

  it("requires an explicit delivery flag plus transport", () => {
    assert.equal(
      isMailTransportConfigured(
        mailProviderConfigFlags({
          SMTP_HOST: "smtp.example.test",
          SMTP_FROM: "noreply@example.test",
        }),
      ),
      false,
    );
    assert.equal(
      isMailTransportConfigured(
        mailProviderConfigFlags({
          EMAIL_DELIVERY_ENABLED: "1",
          SMTP_HOST: "smtp.example.test",
          SMTP_FROM: "noreply@example.test",
        }),
      ),
      true,
    );
  });

  it("caps retries and builds idempotency keys", () => {
    assert.deepEqual(nextMailAttempt(0), { attempt: 1, shouldRetry: true });
    assert.deepEqual(nextMailAttempt(3), { attempt: 4, shouldRetry: false });
    assert.ok(mailIdempotencyKey("order-paid", "ord_1").startsWith("mail:"));
  });
});
