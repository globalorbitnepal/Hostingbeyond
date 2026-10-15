import type { CmsBusinessEmailPlan } from "@/lib/orbit/business-email-page-content";

/** Matches /business-email pricing — monthly first, then commitment terms. */
export type EmailBillingTerm = "monthly" | "12" | "24" | "36" | "48";

export const EMAIL_BILLING_TERM_OPTIONS: {
  value: EmailBillingTerm;
  label: string;
}[] = [
  { value: "monthly", label: "Monthly" },
  { value: "12", label: "12 mo" },
  { value: "24", label: "24 mo" },
  { value: "36", label: "36 mo" },
  { value: "48", label: "48 mo" },
];

function parseUsd(value: string): number {
  const n = parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function emailPricePerMonthForTerm(
  plan: CmsBusinessEmailPlan,
  term: EmailBillingTerm,
): number {
  switch (term) {
    case "monthly":
      return parseUsd(plan.original);
    case "12":
      return parseUsd(plan.renew);
    case "24":
      return parseUsd(plan.price24);
    case "48":
      return parseUsd(plan.price);
    case "36": {
      const p24 = parseUsd(plan.price24);
      const p48 = parseUsd(plan.price);
      if (p24 > 0 && p48 > 0) {
        return Math.round((p24 + (p48 - p24) * 0.5) * 100) / 100;
      }
      return p24;
    }
    default:
      return parseUsd(plan.price);
  }
}

export function emailTermCheckoutLabel(term: EmailBillingTerm): string {
  if (term === "monthly") return "Billed monthly";
  return `${term}-month term · per mailbox / mo`;
}

export function availableEmailTermsForPlan(
  plan: CmsBusinessEmailPlan,
): EmailBillingTerm[] {
  return EMAIL_BILLING_TERM_OPTIONS.map((o) => o.value).filter(
    (term) => emailPricePerMonthForTerm(plan, term) > 0,
  );
}
