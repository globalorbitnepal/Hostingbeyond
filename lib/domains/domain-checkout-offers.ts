import { getHostingProductBySlug } from "@/lib/hosting/hosting-products";
import { getBusinessEmailAddonPlans } from "@/lib/hosting/business-email-addon";

export type DomainCheckoutServiceOffer =
  | {
      kind: "hosting";
      serviceId: string;
      productSlug: string;
      planKey: string;
      planName: string;
      billing: "monthly" | "annually";
      amount: number;
      currency: string;
      label: string;
      description: string;
      periodLabel: string;
    }
  | {
      kind: "business-email";
      serviceId: "business-email";
      planId: string;
      planName: string;
      billing: "monthly";
      amount: number;
      currency: string;
      label: string;
      description: string;
      periodLabel: string;
      mailboxesLabel: string;
    };

export type DomainCheckoutOffersPayload = {
  included: Array<{
    id: string;
    label: string;
    detail: string;
  }>;
  optional: DomainCheckoutServiceOffer[];
};

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

/** Real upsell offers for domain checkout — no invented products or prices. */
export async function getDomainCheckoutOffers(): Promise<DomainCheckoutOffersPayload> {
  const included = [
    {
      id: "whois-privacy",
      label: "WHOIS privacy",
      detail: "Included free on eligible domains",
    },
    {
      id: "dns",
      label: "DNS management",
      detail: "Included free with your domain",
    },
  ];

  const optional: DomainCheckoutServiceOffer[] = [];

  const webHosting = await getHostingProductBySlug("web-hosting");
  const activePlans =
    webHosting?.status === "ACTIVE"
      ? (webHosting.plans ?? []).filter((p) => p.active)
      : [];
  const entryPlan =
    activePlans.find((p) => p.planKey === "essential") ?? activePlans[0];
  if (entryPlan && webHosting) {
    const monthly = Number(entryPlan.monthlyPrice);
    if (monthly > 0 && webHosting.billingMonthlyEnabled) {
      optional.push({
        kind: "hosting",
        serviceId: "web-hosting",
        productSlug: webHosting.slug,
        planKey: entryPlan.planKey,
        planName: entryPlan.planName,
        billing: "monthly",
        amount: roundMoney(monthly),
        currency: entryPlan.currency || "USD",
        label: "Web Hosting",
        description: "Fast hosting to launch your site on your new domain.",
        periodLabel: "per month",
      });
    }
    const yearly = Number(entryPlan.yearlyPrice);
    if (yearly > 0 && webHosting.billingYearlyEnabled) {
      optional.push({
        kind: "hosting",
        serviceId: "web-hosting-annual",
        productSlug: webHosting.slug,
        planKey: entryPlan.planKey,
        planName: entryPlan.planName,
        billing: "annually",
        amount: roundMoney(yearly),
        currency: entryPlan.currency || "USD",
        label: "Web Hosting",
        description: "Annual web hosting for your new domain.",
        periodLabel: "per year",
      });
    }
  }

  const emailPlans = await getBusinessEmailAddonPlans();
  const emailEntry = emailPlans[0];
  if (emailEntry) {
    optional.push({
      kind: "business-email",
      serviceId: "business-email",
      planId: emailEntry.id,
      planName: emailEntry.name,
      billing: "monthly",
      amount: roundMoney(emailEntry.monthlyPrice),
      currency: "USD",
      label: "Business Email",
      description: "Professional mailboxes on your domain.",
      periodLabel: "per month",
      mailboxesLabel: emailEntry.mailboxesLabel,
    });
  }

  return { included, optional };
}

export type DomainCheckoutServiceSelection =
  | {
      kind: "hosting";
      productSlug: string;
      planKey: string;
      billing: "monthly" | "annually";
    }
  | {
      kind: "business-email";
      planId: string;
    };

export async function quoteDomainCheckoutServices(
  selections: DomainCheckoutServiceSelection[],
): Promise<{
  lines: Array<{
    key: string;
    label: string;
    detail: string;
    amount: number;
    currency: string;
    billingLabel: string;
  }>;
  servicesTotal: number;
  errors: string[];
}> {
  const offers = await getDomainCheckoutOffers();
  const lines: Array<{
    key: string;
    label: string;
    detail: string;
    amount: number;
    currency: string;
    billingLabel: string;
  }> = [];
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const selection of selections) {
    if (selection.kind === "hosting") {
      const key = `hosting:${selection.productSlug}:${selection.planKey}:${selection.billing}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const match = offers.optional.find(
        (o) =>
          o.kind === "hosting" &&
          o.productSlug === selection.productSlug &&
          o.planKey === selection.planKey &&
          o.billing === selection.billing,
      );
      if (!match || match.kind !== "hosting") {
        errors.push("Selected hosting plan is no longer available.");
        continue;
      }
      lines.push({
        key,
        label: match.label,
        detail: `${match.planName} · ${match.periodLabel}`,
        amount: match.amount,
        currency: match.currency,
        billingLabel: match.periodLabel,
      });
    } else {
      const key = `email:${selection.planId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const match = offers.optional.find(
        (o) => o.kind === "business-email" && o.planId === selection.planId,
      );
      if (!match || match.kind !== "business-email") {
        errors.push("Selected business email plan is no longer available.");
        continue;
      }
      lines.push({
        key,
        label: match.label,
        detail: `${match.planName} · ${match.mailboxesLabel}`,
        amount: match.amount,
        currency: match.currency,
        billingLabel: match.periodLabel,
      });
    }
  }

  const servicesTotal = roundMoney(
    lines.reduce((sum, line) => sum + line.amount, 0),
  );
  return { lines, servicesTotal, errors };
}
