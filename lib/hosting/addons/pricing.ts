import type { HostingBillingCycle } from "@/lib/hosting/purchase-intent";
import { getBusinessEmailAddonPlans } from "@/lib/hosting/business-email-addon";

import { EXTRA_STORAGE_SLUG, EXTRA_STORAGE_TIERS } from "./storage-tiers";
import type {
  AddonPriceOption,
  AddonQuoteLine,
  CartAddonSelection,
} from "./types";
import type { ResolvedHostingAddon } from "./types";

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

export async function resolveAddonPriceOptions(
  addon: ResolvedHostingAddon,
): Promise<AddonPriceOption[]> {
  if (
    addon.pricingReference === "storage-nvme-tiers" ||
    addon.slug === EXTRA_STORAGE_SLUG
  ) {
    return EXTRA_STORAGE_TIERS.map((tier) => ({
      id: tier.id,
      label: tier.label,
      unitMonthlyPrice: tier.unitMonthlyPrice,
      annualMonthlyPrice: roundMoney(tier.unitMonthlyPrice * 0.9),
    }));
  }
  if (addon.pricingReference === "cms:business-email") {
    const plans = await getBusinessEmailAddonPlans();
    return plans.map((p) => ({
      id: p.id,
      label: p.name,
      unitMonthlyPrice: p.monthlyPrice,
      annualMonthlyPrice: p.annualMonthlyPrice,
      description: `${p.mailboxesLabel} · ${p.storageLabel}`,
    }));
  }
  const usdMatch = addon.pricingReference.match(/^usd:(\d+(?:\.\d+)?)$/i);
  if (usdMatch) {
    const unitMonthlyPrice = Number(usdMatch[1]);
    return [
      {
        id: addon.slug,
        label: addon.name,
        unitMonthlyPrice,
        annualMonthlyPrice: roundMoney(unitMonthlyPrice * 0.9),
        description: addon.description,
      },
    ];
  }
  return [];
}

function periodMultiplier(
  billingMode: ResolvedHostingAddon["billingMode"],
  hostingBilling: HostingBillingCycle,
): { mult: number; label: string } {
  switch (billingMode) {
    case "ONE_TIME":
      return { mult: 1, label: "one-time" };
    case "MONTHLY":
      return { mult: 1, label: "monthly" };
    case "ANNUAL":
      return { mult: 12, label: "annual" };
    case "MATCH_HOSTING":
    default:
      return hostingBilling === "annually"
        ? { mult: 12, label: "annual" }
        : { mult: 1, label: "monthly" };
  }
}

export async function quoteAddonSelections(
  addons: ResolvedHostingAddon[],
  selections: CartAddonSelection[],
  hostingBilling: HostingBillingCycle,
): Promise<{ lines: AddonQuoteLine[]; errors: string[]; total: number }> {
  const errors: string[] = [];
  const lines: AddonQuoteLine[] = [];
  let total = 0;

  for (const selection of selections) {
    if (!selection.enabled) continue;
    const addon = addons.find((a) => a.slug === selection.addonSlug);
    if (!addon) {
      errors.push(`Unknown add-on: ${selection.addonSlug}`);
      continue;
    }

    const options = await resolveAddonPriceOptions(addon);
    if (options.length === 0) {
      errors.push(`${addon.name} is not available for checkout yet.`);
      continue;
    }

    const option =
      options.find((o) => o.id === selection.optionId) ?? options[0];
    if (!selection.optionId) {
      errors.push(`Select an option for ${addon.name}.`);
      continue;
    }

    const qty = Math.min(50, Math.max(1, selection.quantity || 1));
    const chosenCycle: HostingBillingCycle =
      selection.billingPeriod === "annually" ||
      selection.billingPeriod === "monthly"
        ? selection.billingPeriod
        : addon.type === "STORAGE"
          ? "monthly"
          : periodMultiplier(addon.billingMode, hostingBilling).label ===
              "annual"
            ? "annually"
            : "monthly";
    const monthlyRate =
      chosenCycle === "annually" && option.annualMonthlyPrice
        ? option.annualMonthlyPrice
        : option.unitMonthlyPrice;
    const mult = chosenCycle === "annually" ? 12 : 1;
    const amount = roundMoney(monthlyRate * qty * mult);
    total = roundMoney(total + amount);

    lines.push({
      addonSlug: addon.slug,
      name: addon.name,
      optionLabel: option.label,
      quantity: qty,
      amount,
      billingLabel:
        chosenCycle === "annually" ? "annual" : "monthly auto-renew",
    });
  }

  return { lines, errors, total };
}
