/**
 * Support tickets are not in Prisma yet. This contract is the safe application
 * layer only — persistence and SMTP are blocked until an isolated development
 * database and mail credentials exist.
 */

export type SupportTicketPriority = "low" | "normal" | "high";

export type SupportTicketDraft = {
  subject: string;
  body: string;
  customerUserId: string;
  priority?: SupportTicketPriority;
};

export type SupportTicketDraftValidation =
  | {
      ok: true;
      draft: Required<Pick<SupportTicketDraft, "priority">> &
        SupportTicketDraft;
    }
  | { ok: false; error: string };

const MAX_SUBJECT = 160;
const MAX_BODY = 8000;

export function validateSupportTicketDraft(
  input: Partial<SupportTicketDraft>,
): SupportTicketDraftValidation {
  const subject = typeof input.subject === "string" ? input.subject.trim() : "";
  const body = typeof input.body === "string" ? input.body.trim() : "";
  const customerUserId =
    typeof input.customerUserId === "string" ? input.customerUserId.trim() : "";
  const priority = input.priority ?? "normal";

  if (!customerUserId) return { ok: false, error: "Authentication required." };
  if (subject.length < 3) return { ok: false, error: "Subject is too short." };
  if (subject.length > MAX_SUBJECT) {
    return { ok: false, error: "Subject is too long." };
  }
  if (body.length < 10) return { ok: false, error: "Message is too short." };
  if (body.length > MAX_BODY)
    return { ok: false, error: "Message is too long." };
  if (priority !== "low" && priority !== "normal" && priority !== "high") {
    return { ok: false, error: "Invalid priority." };
  }

  return {
    ok: true,
    draft: { subject, body, customerUserId, priority },
  };
}

export type TransactionalMailMessage = {
  to: string;
  template: "support-ticket-received" | "password-reset" | "order-paid";
  /** Display-safe fields only. Never include secrets or card data. */
  vars: Record<string, string>;
};

export type TransactionalMailResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "not_configured"
        | "invalid_recipient"
        | "invalid_template_vars"
        | "unsafe_template_vars"
        | "provider_failed";
    };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateTransactionalMail(
  message: TransactionalMailMessage,
): TransactionalMailResult {
  const to = message.to.trim();
  if (/[\r\n]/.test(message.to) || !EMAIL_RE.test(to)) {
    return { ok: false, reason: "invalid_recipient" };
  }
  for (const value of Object.values(message.vars)) {
    if (typeof value !== "string" || /[\r\n<>]/.test(value)) {
      return { ok: false, reason: "unsafe_template_vars" };
    }
  }
  return { ok: false, reason: "not_configured" };
}
