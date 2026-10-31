import type { HostingBillingCycle } from "@/lib/hosting/purchase-intent";

import type { DomainChoice, HostingCartQuoteLine } from "./types";

export type HostingBookingStep = "plan" | "domain" | "addons" | "review";

export const HOSTING_BOOKING_STEPS: {
  id: HostingBookingStep;
  label: string;
}[] = [
  { id: "plan", label: "Plan" },
  { id: "domain", label: "Domain" },
  { id: "addons", label: "Add-ons" },
  { id: "review", label: "Review" },
];

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

export function parseListedUsdPrice(raw: string | undefined): number | null {
  if (!raw) return null;
  const match = String(raw)
    .replace(/,/g, "")
    .match(/(\d+(?:\.\d{1,2})?)/);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value < 0) return null;
  return roundMoney(value);
}

/** Monthly hosting never includes a complimentary domain year. */
export function hostingIncludesFreeDomainYear(
  billing: HostingBillingCycle,
  productAllowsFreeDomain: boolean,
): boolean {
  return billing === "annually" && productAllowsFreeDomain;
}

export function hostingDomainQuoteLine(input: {
  billing: HostingBillingCycle;
  freeDomainEligible: boolean;
  domainChoice: DomainChoice;
  domainName: string | null;
  domainRegisterUsd: number | null;
}): HostingCartQuoteLine | null {
  const name = input.domainName?.trim().toLowerCase() || null;
  const isAnnual = input.billing === "annually";

  if (input.domainChoice === "existing" && name) {
    return {
      id: "domain",
      label: "Domain",
      amount: 0,
      kind: "domain",
      note: `Connect ${name}`,
    };
  }

  if (input.domainChoice === "search" && name) {
    if (isAnnual && input.freeDomainEligible) {
      return {
        id: "domain",
        label: "Domain",
        amount: 0,
        kind: "domain",
        note: `${name} · free for 1 year with annual hosting`,
      };
    }
    const paid = roundMoney(Math.max(0, Number(input.domainRegisterUsd) || 0));
    return {
      id: "domain",
      label: "Domain",
      amount: paid,
      kind: "domain",
      note:
        paid > 0
          ? `${name} · first-year registration`
          : `${name} · register with this order`,
    };
  }

  return null;
}

export function hostingEmailTrialQuoteLine(input: {
  billing: HostingBillingCycle;
  freeEmailMonth: boolean;
  renewalPerMonthUsd: number;
}): HostingCartQuoteLine | null {
  void input.billing;
  if (!input.freeEmailMonth) return null;
  const renew = roundMoney(Math.max(0, input.renewalPerMonthUsd));
  return {
    id: "email-trial",
    label: "Business Email",
    amount: 0,
    kind: "addon",
    note:
      renew > 0
        ? `1 month free · renews at $${renew.toFixed(2)}/mo next month`
        : "1 month free · renews next month at the listed mailbox rate",
  };
}

export function hostingDomainStepComplete(input: {
  domainChoice: DomainChoice;
  domainName: string | null;
  /** Annual complimentary domain must be registered now — no skip / existing-only. */
  requireNewRegistration?: boolean;
}): boolean {
  const name = input.domainName?.trim() || "";
  if (input.requireNewRegistration) {
    return input.domainChoice === "search" && name.length > 0;
  }
  return (
    (input.domainChoice === "search" || input.domainChoice === "existing") &&
    name.length > 0
  );
}

export function nextHostingBookingStep(
  step: HostingBookingStep,
): HostingBookingStep | null {
  const ids = HOSTING_BOOKING_STEPS.map((s) => s.id);
  const i = ids.indexOf(step);
  if (i < 0 || i >= ids.length - 1) return null;
  return ids[i + 1] ?? null;
}

export function prevHostingBookingStep(
  step: HostingBookingStep,
): HostingBookingStep | null {
  const ids = HOSTING_BOOKING_STEPS.map((s) => s.id);
  const i = ids.indexOf(step);
  if (i <= 0) return null;
  return ids[i - 1] ?? null;
}
