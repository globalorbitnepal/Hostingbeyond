import type { EmailBillingTerm } from "@/lib/hosting/business-email-term-pricing";
import { EMAIL_BILLING_TERM_OPTIONS } from "@/lib/hosting/business-email-term-pricing";

export type EmailBookingStep = "plan" | "domain" | "addons" | "review";

export type EmailPurchaseIntent = {
  plan: string;
  term: EmailBillingTerm;
};

const TERM_VALUES = new Set<string>(
  EMAIL_BILLING_TERM_OPTIONS.map((o) => o.value),
);

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseEmailBillingTerm(
  raw: string | null | undefined,
): EmailBillingTerm {
  const normalized = raw?.trim();
  if (normalized && TERM_VALUES.has(normalized)) {
    return normalized as EmailBillingTerm;
  }
  return "monthly";
}

export function parseEmailPurchaseIntent(
  params: URLSearchParams,
): EmailPurchaseIntent | null {
  const plan =
    params.get("plan")?.trim() || params.get("email")?.trim() || null;
  if (!plan) return null;
  const term = parseEmailBillingTerm(params.get("term"));
  return { plan, term };
}

export function parseEmailPurchaseIntentFromRecord(
  record: Record<string, string | string[] | undefined>,
): EmailPurchaseIntent | null {
  const params = new URLSearchParams();
  const plan = firstParam(record.plan) ?? firstParam(record.email);
  const term = firstParam(record.term);
  if (plan) params.set("plan", plan);
  if (term) params.set("term", term);
  return parseEmailPurchaseIntent(params);
}

export function serializeEmailPurchaseIntent(
  intent: EmailPurchaseIntent,
): string {
  const params = new URLSearchParams({
    plan: intent.plan,
    term: intent.term,
  });
  return params.toString();
}

export function emailCheckoutPath(
  intent: EmailPurchaseIntent,
  step?: EmailBookingStep,
): string {
  const params = new URLSearchParams(serializeEmailPurchaseIntent(intent));
  if (step) params.set("step", step);
  return `/checkout/business-email?${params.toString()}`;
}

export function businessEmailBookingHref(
  planId: string,
  term: EmailBillingTerm | string = "monthly",
): string {
  return emailCheckoutPath(
    {
      plan: planId.trim() || "starter",
      term: parseEmailBillingTerm(term),
    },
    "plan",
  );
}
