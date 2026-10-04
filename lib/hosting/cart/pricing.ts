import { getEligibleAddonsForCheckout } from "@/lib/hosting/addons/for-cart";
import { quoteAddonSelections } from "@/lib/hosting/addons/pricing";
import type { CartAddonSelection } from "@/lib/hosting/addons/types";
import { getHostingProductBySlug } from "@/lib/hosting/hosting-products";
import { parseHostingBilling } from "@/lib/hosting/purchase-intent";
import { validateHostingPurchaseIntent } from "@/lib/hosting/validate-purchase-intent";

import type {
  HostingCartConfiguration,
  HostingCartQuote,
  HostingCartQuoteLine,
} from "./types";

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

function planFeatures(plan: {
  features: unknown;
  storage: string | null;
  bandwidth: string | null;
  ssl: string | null;
}): string[] {
  if (Array.isArray(plan.features) && plan.features.length > 0) {
    return plan.features.filter((f): f is string => typeof f === "string");
  }
  const out: string[] = [];
  if (plan.storage) out.push(plan.storage);
  if (plan.bandwidth) out.push(plan.bandwidth);
  if (plan.ssl) out.push(plan.ssl);
  return out.slice(0, 6);
}

function parseAddonSelections(raw: unknown): CartAddonSelection[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const o = item as Record<string, unknown>;
      return {
        addonSlug: String(o.addonSlug ?? ""),
        enabled: Boolean(o.enabled),
        quantity: Math.min(50, Math.max(1, Number(o.quantity) || 1)),
        optionId: typeof o.optionId === "string" ? o.optionId : null,
      };
    })
    .filter((s) => s.addonSlug);
}

/** Legacy v1 cart fields → generic addons[]. */
function legacyEmailToAddons(
  input: Record<string, unknown>,
): CartAddonSelection[] {
  if (!input.emailAddonEnabled) return [];
  return [
    {
      addonSlug: "business-email",
      enabled: true,
      quantity: Math.min(50, Math.max(1, Number(input.mailboxQuantity) || 1)),
      optionId:
        typeof input.emailPlanId === "string" ? input.emailPlanId : null,
    },
  ];
}

export function normalizeCartConfiguration(
  input: Partial<HostingCartConfiguration> & {
    productSlug: string;
    planKey: string;
  },
  eligibleSlugs: string[] = [],
): HostingCartConfiguration {
  const billing =
    parseHostingBilling(input.billingPeriod) ??
    parseHostingBilling(String(input.billingPeriod)) ??
    "annually";

  const rawInput = input as Record<string, unknown>;
  let addons = parseAddonSelections(input.addons ?? rawInput.addons);
  if (addons.length === 0 && rawInput.emailAddonEnabled) {
    addons = legacyEmailToAddons(rawInput);
  }

  const allowed = new Set(eligibleSlugs);
  addons = addons
    .filter((a) => (allowed.size ? allowed.has(a.addonSlug) : true))
    .map((a) => ({
      ...a,
      enabled: Boolean(a.enabled),
    }));

  return {
    productSlug: input.productSlug.trim(),
    planKey: input.planKey.trim(),
    billingPeriod: billing,
    domainChoice: input.domainChoice ?? null,
    domainName:
      typeof input.domainName === "string" && input.domainName.trim()
        ? input.domainName.trim().toLowerCase()
        : null,
    addons,
  };
}

export async function quoteHostingCart(
  rawConfig: Partial<HostingCartConfiguration> & {
    productSlug: string;
    planKey: string;
  },
): Promise<HostingCartQuote> {
  const intent = await validateHostingPurchaseIntent({
    product: rawConfig.productSlug ?? "",
    plan: rawConfig.planKey ?? "",
    billing:
      parseHostingBilling(rawConfig.billingPeriod) ??
      parseHostingBilling(String(rawConfig.billingPeriod)) ??
      "annually",
  });

  if (!intent) {
    const configuration = normalizeCartConfiguration({
      ...rawConfig,
      productSlug: rawConfig.productSlug ?? "",
      planKey: rawConfig.planKey ?? "",
    });
    return emptyQuote(
      configuration,
      ["Invalid product, plan, or billing."],
      [],
    );
  }

  const product = await getHostingProductBySlug(intent.product);
  if (!product || product.status !== "ACTIVE") {
    const configuration = normalizeCartConfiguration({
      ...rawConfig,
      productSlug: intent.product,
      planKey: intent.plan,
    });
    return emptyQuote(
      configuration,
      ["This hosting product is not available."],
      [],
    );
  }

  const plan = product.plans.find((p) => p.active && p.planKey === intent.plan);
  if (!plan) {
    const configuration = normalizeCartConfiguration({
      ...rawConfig,
      productSlug: intent.product,
      planKey: intent.plan,
    });
    return emptyQuote(configuration, ["Selected plan is not available."], []);
  }

  const eligibleAddons = await getEligibleAddonsForCheckout({
    productSlug: product.slug,
    productCategory: product.category,
    planKey: plan.planKey,
  });
  const eligibleSlugs = eligibleAddons.map((a) => a.slug);

  const configuration = normalizeCartConfiguration(
    {
      ...rawConfig,
      productSlug: intent.product,
      planKey: intent.plan,
    },
    eligibleSlugs,
  );

  const errors: string[] = [];

  if (intent.billing === "monthly" && !product.billingMonthlyEnabled) {
    errors.push("Monthly billing is not available for this product.");
  }
  if (intent.billing === "annually" && !product.billingYearlyEnabled) {
    errors.push("Annual billing is not available for this product.");
  }

  const monthly = Number(plan.monthlyPrice);
  const yearly = Number(plan.yearlyPrice);
  const isAnnual = intent.billing === "annually";

  const hostingList = roundMoney(monthly * (isAnnual ? 12 : 1));
  const hostingCharge = roundMoney(isAnnual ? yearly : monthly);
  const discount = roundMoney(Math.max(0, hostingList - hostingCharge));

  const freeDomainEligible =
    isAnnual && Boolean(product.freeDomainAnnualEnabled);

  const lines: HostingCartQuoteLine[] = [
    {
      id: "hosting",
      label: "Hosting",
      amount: hostingCharge,
      kind: "hosting",
    },
  ];

  if (isAnnual && discount > 0) {
    lines.push({
      id: "annual-discount",
      label: "Annual discount",
      amount: -discount,
      kind: "discount",
    });
  }

  if (isAnnual && freeDomainEligible) {
    lines.push({
      id: "domain",
      label: "Domain",
      amount: 0,
      kind: "domain",
      note: "Free domain for 1 year (eligible annual plans)",
    });
  } else if (!isAnnual) {
    lines.push({
      id: "domain-separate",
      label: "Domain",
      amount: 0,
      kind: "domain",
      note: "Add a domain separately",
    });
  }

  const addonQuote = await quoteAddonSelections(
    eligibleAddons,
    configuration.addons,
    configuration.billingPeriod,
  );
  errors.push(...addonQuote.errors);

  for (const addonLine of addonQuote.lines) {
    lines.push({
      id: `addon-${addonLine.addonSlug}`,
      label: `${addonLine.name} — ${addonLine.optionLabel}`,
      amount: addonLine.amount,
      kind: "addon",
      note: `${addonLine.quantity} × ${addonLine.billingLabel}`,
    });
  }

  const subtotal = roundMoney(hostingCharge + addonQuote.total);
  const total = subtotal;
  const monthlyEquivalent = isAnnual ? roundMoney(yearly / 12) : monthly;

  return {
    configuration,
    planName: plan.planName,
    productName: product.name,
    currency: plan.currency || "USD",
    lines,
    subtotal,
    discount,
    tax: null,
    total,
    freeDomainEligible,
    monthlyEquivalent,
    billedAmount: hostingCharge,
    renewalPrice: null,
    features: planFeatures(plan),
    errors,
    eligibleAddonSlugs: eligibleSlugs,
  };
}

function emptyQuote(
  configuration: HostingCartConfiguration,
  errors: string[],
  eligibleAddonSlugs: string[],
): HostingCartQuote {
  return {
    configuration,
    planName: "",
    productName: "",
    currency: "USD",
    lines: [],
    subtotal: 0,
    discount: 0,
    tax: null,
    total: 0,
    freeDomainEligible: false,
    monthlyEquivalent: null,
    billedAmount: 0,
    renewalPrice: null,
    features: [],
    errors,
    eligibleAddonSlugs,
  };
}

export function parseCartBody(
  body: unknown,
): Partial<HostingCartConfiguration> | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  if (typeof o.productSlug !== "string" || typeof o.planKey !== "string") {
    return null;
  }

  const addons = parseAddonSelections(o.addons);
  const legacy = legacyEmailToAddons(o);

  return {
    productSlug: o.productSlug,
    planKey: o.planKey,
    billingPeriod:
      typeof o.billingPeriod === "string"
        ? (o.billingPeriod as HostingCartConfiguration["billingPeriod"])
        : undefined,
    domainChoice:
      o.domainChoice === "search" ||
      o.domainChoice === "existing" ||
      o.domainChoice === "later" ||
      o.domainChoice === null
        ? o.domainChoice
        : undefined,
    domainName: typeof o.domainName === "string" ? o.domainName : undefined,
    addons: addons.length ? addons : legacy.length ? legacy : undefined,
  };
}
