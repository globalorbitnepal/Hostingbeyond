import type {
  TransactionalMailMessage,
  TransactionalMailResult,
} from "@/lib/support/ticket-contract";
import { validateTransactionalMail } from "@/lib/support/ticket-contract";

/** Names only — never log or invent values. */
export const TRANSACTIONAL_EMAIL_ENV_NAMES = [
  "EMAIL_DELIVERY_ENABLED",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "SMTP_FROM",
  "TRANSACTIONAL_EMAIL_API_KEY",
] as const;

const REQUIRED_TEMPLATE_VARS: Record<
  TransactionalMailMessage["template"],
  readonly string[]
> = {
  "support-ticket-received": ["ticketPublicId"],
  "password-reset": ["resetUrl"],
  "order-paid": ["orderPublicId"],
};

export type MailProviderConfigFlags = {
  deliveryFlagEnabled: boolean;
  smtpHostPresent: boolean;
  smtpFromPresent: boolean;
  apiKeyPresent: boolean;
};

export function mailProviderConfigFlags(
  env: Record<string, string | undefined> = process.env,
): MailProviderConfigFlags {
  return {
    deliveryFlagEnabled: env.EMAIL_DELIVERY_ENABLED === "1",
    smtpHostPresent: Boolean(env.SMTP_HOST?.trim()),
    smtpFromPresent: Boolean(env.SMTP_FROM?.trim()),
    apiKeyPresent: Boolean(env.TRANSACTIONAL_EMAIL_API_KEY?.trim()),
  };
}

export function isMailTransportConfigured(
  flags: MailProviderConfigFlags,
): boolean {
  if (!flags.deliveryFlagEnabled) return false;
  return (
    (flags.smtpHostPresent && flags.smtpFromPresent) || flags.apiKeyPresent
  );
}

const UNSAFE_VAR = /[\r\n<>]|javascript:|data:/i;

export function validateMailTemplateVars(
  message: TransactionalMailMessage,
):
  | { ok: true }
  | { ok: false; reason: "invalid_template_vars" | "unsafe_template_vars" } {
  const required = REQUIRED_TEMPLATE_VARS[message.template];
  if (!required) return { ok: false, reason: "invalid_template_vars" };
  for (const value of Object.values(message.vars)) {
    if (UNSAFE_VAR.test(value)) {
      return { ok: false, reason: "unsafe_template_vars" };
    }
  }
  for (const key of required) {
    const value = message.vars[key]?.trim();
    if (!value) return { ok: false, reason: "invalid_template_vars" };
  }
  return { ok: true };
}

export type MailLogFields = {
  template: TransactionalMailMessage["template"];
  recipientLength: number;
  ok: boolean;
  reason: string | null;
};

export function mailLogFields(
  message: TransactionalMailMessage,
  result: TransactionalMailResult | { ok: false; reason: string },
): MailLogFields {
  return {
    template: message.template,
    recipientLength: message.to.trim().length,
    ok: result.ok,
    reason: result.ok ? null : result.reason,
  };
}

export function mailIdempotencyKey(
  template: TransactionalMailMessage["template"],
  dedupe: string,
): string {
  return `mail:${template}:${dedupe}`.slice(0, 180);
}

export const MAIL_MAX_ATTEMPTS = 3;

export function nextMailAttempt(previousAttempts: number): {
  shouldRetry: boolean;
  attempt: number;
} {
  const attempt = previousAttempts + 1;
  return { attempt, shouldRetry: attempt <= MAIL_MAX_ATTEMPTS };
}

export type TransactionalMailProvider = {
  send(message: TransactionalMailMessage): Promise<TransactionalMailResult>;
};

/** Production default until a real SMTP adapter is selected and approved. */
export const disabledMailProvider: TransactionalMailProvider = {
  async send(message) {
    const recipient = validateTransactionalMail(message);
    if (!recipient.ok) return recipient;
    const vars = validateMailTemplateVars(message);
    if (!vars.ok) return vars;
    return { ok: false, reason: "not_configured" };
  },
};

export function getConfiguredMailProvider(): TransactionalMailProvider {
  return disabledMailProvider;
}

export async function attemptTransactionalMail(
  message: TransactionalMailMessage,
  provider: TransactionalMailProvider = getConfiguredMailProvider(),
): Promise<TransactionalMailResult> {
  return provider.send(message);
}
