import type { DomainExtras } from "@/lib/domains/domain-extras";
import { protectionChargeUsd } from "@/lib/domains/domain-extras";
import {
  emailDueTodayForTerm,
  emailPricePerMonthForTerm,
  emailPrepaidMonths,
  emailTermCheckoutLabel,
  type EmailBillingTerm,
} from "@/lib/hosting/business-email-term-pricing";
import {
  isAnnualFreeComDomain,
  parseListedUsdPrice,
} from "@/lib/hosting/cart/booking-rules";
import type { DomainChoice } from "@/lib/hosting/cart/types";
import type { CmsBusinessEmailPlan } from "@/lib/orbit/business-email-page-content";

export type EmailHostingAddonOffer = {
  productSlug: string;
  planKey: string;
  planName: string;
  monthlyUsd: number;
  yearlyUsd: number;
  billingMonthlyEnabled: boolean;
  billingYearlyEnabled: boolean;
};

export type EmailHostingAddonSelection = {
  enabled: boolean;
  productSlug: string;
  planKey: string;
  billing: "monthly" | "annually";
};

export type EmailCartConfiguration = {
  planId: string;
  term: EmailBillingTerm;
  domainChoice: DomainChoice;
  domainName: string | null;
  domainRegisterUsd: number | null;
  domainProtection: boolean;
  hostingAddon: EmailHostingAddonSelection;
};

export type EmailCartQuoteLine = {
  id: string;
  label: string;
  amount: number;
  kind: "email" | "domain" | "protection" | "hosting";
  note?: string;
};

export type EmailCartQuote = {
  planName: string;
  term: EmailBillingTerm;
  renewalPerMonth: number;
  firstMonthFree: boolean;
  prepaidMonths: number;
  termLabel: string;
  lines: EmailCartQuoteLine[];
  total: number;
  currency: "USD";
  configuration: EmailCartConfiguration;
  errors: string[];
  freeComDomainEligible: boolean;
};

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

function hostingAddonAmount(
  offer: EmailHostingAddonOffer,
  selection: EmailHostingAddonSelection,
): number {
  if (!selection.enabled) return 0;
  if (selection.billing === "annually") {
    return roundMoney(Math.max(0, offer.yearlyUsd));
  }
  return roundMoney(Math.max(0, offer.monthlyUsd));
}

function emailDomainLine(input: {
  configuration: EmailCartConfiguration;
  freeComDomainEligible: boolean;
}): EmailCartQuoteLine | null {
  const { configuration } = input;
  const name = configuration.domainName?.trim().toLowerCase() || null;

  if (
    configuration.domainChoice === "later" ||
    configuration.domainChoice === null
  ) {
    return null;
  }

  if (configuration.domainChoice === "existing" && name) {
    return {
      id: "domain",
      label: "Domain",
      amount: 0,
      kind: "domain",
      note: `Connect ${name}`,
    };
  }

  if (configuration.domainChoice === "search" && name) {
    const complimentary = isAnnualFreeComDomain(
      name,
      configuration.hostingAddon.enabled &&
        configuration.hostingAddon.billing === "annually"
        ? "annually"
        : "monthly",
      input.freeComDomainEligible,
    );
    if (complimentary) {
      return {
        id: "domain",
        label: "Domain",
        amount: 0,
        kind: "domain",
        note: `${name} · free .com for 1 year with annual hosting`,
      };
    }
    const paid = roundMoney(
      Math.max(0, Number(configuration.domainRegisterUsd) || 0),
    );
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

export function quoteEmailCart(input: {
  plan: CmsBusinessEmailPlan;
  configuration: EmailCartConfiguration;
  extras: DomainExtras;
  hostingOffer: EmailHostingAddonOffer | null;
}): EmailCartQuote {
  const { plan, configuration, extras, hostingOffer } = input;
  const errors: string[] = [];
  const lines: EmailCartQuoteLine[] = [];

  const renewalPerMonth = roundMoney(
    emailPricePerMonthForTerm(plan, configuration.term),
  );
  const prepaidMonths = emailPrepaidMonths(configuration.term);
  const firstMonthFree = configuration.term === "monthly";
  const emailDue = firstMonthFree
    ? 0
    : emailDueTodayForTerm(plan, configuration.term);

  lines.push({
    id: "email-plan",
    label: "Business Email",
    amount: roundMoney(emailDue),
    kind: "email",
    note: firstMonthFree
      ? `${plan.name} · 1 month free · renews at $${renewalPerMonth.toFixed(2)}/mo`
      : `${plan.name} · ${emailTermCheckoutLabel(configuration.term)} · ${prepaidMonths} mailbox-months`,
  });

  const freeComDomainEligible = Boolean(
    hostingOffer &&
    configuration.hostingAddon.enabled &&
    configuration.hostingAddon.billing === "annually" &&
    hostingOffer.billingYearlyEnabled,
  );

  const domainLine = emailDomainLine({ configuration, freeComDomainEligible });
  if (domainLine) lines.push(domainLine);

  if (
    configuration.domainProtection &&
    configuration.domainChoice === "search" &&
    configuration.domainName?.trim()
  ) {
    const protection = protectionChargeUsd(extras);
    if (protection > 0) {
      lines.push({
        id: "domain-protection",
        label: extras.protectionLabel,
        amount: protection,
        kind: "protection",
        note: "per year",
      });
    }
  }

  if (hostingOffer && configuration.hostingAddon.enabled) {
    const amount = hostingAddonAmount(hostingOffer, configuration.hostingAddon);
    if (amount <= 0) {
      errors.push("Selected hosting billing is not available.");
    } else {
      lines.push({
        id: "hosting-addon",
        label: "Web Hosting",
        amount,
        kind: "hosting",
        note: `${hostingOffer.planName} · ${
          configuration.hostingAddon.billing === "annually"
            ? "per year"
            : "per month"
        }`,
      });
    }
  }

  const total = roundMoney(lines.reduce((sum, line) => sum + line.amount, 0));

  return {
    planName: plan.name,
    term: configuration.term,
    renewalPerMonth,
    firstMonthFree,
    prepaidMonths,
    termLabel: emailTermCheckoutLabel(configuration.term),
    lines,
    total,
    currency: "USD",
    configuration,
    errors,
    freeComDomainEligible,
  };
}

export function defaultEmailCartConfiguration(intent: {
  plan: string;
  term: EmailBillingTerm;
}): EmailCartConfiguration {
  return {
    planId: intent.plan,
    term: intent.term,
    domainChoice: "later",
    domainName: null,
    domainRegisterUsd: null,
    domainProtection: false,
    hostingAddon: {
      enabled: false,
      productSlug: "web-hosting",
      planKey: "essential",
      billing: "monthly",
    },
  };
}

export { parseListedUsdPrice };
