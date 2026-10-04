import type { HostingProductCategory } from "@prisma/client";

import type { HostingAddonEligibility } from "./types";

export function parseAddonEligibility(raw: unknown): HostingAddonEligibility {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    productSlugs: Array.isArray(o.productSlugs)
      ? o.productSlugs.filter((s): s is string => typeof s === "string")
      : undefined,
    productCategories: Array.isArray(o.productCategories)
      ? o.productCategories.filter((s): s is string => typeof s === "string")
      : undefined,
    planKeys: Array.isArray(o.planKeys)
      ? o.planKeys.filter((s): s is string => typeof s === "string")
      : undefined,
  };
}

export function isAddonEligible(
  rules: HostingAddonEligibility,
  ctx: {
    productSlug: string;
    productCategory: HostingProductCategory;
    planKey: string;
  },
): boolean {
  if (rules.productSlugs?.length) {
    if (!rules.productSlugs.includes(ctx.productSlug)) return false;
  }
  if (rules.productCategories?.length) {
    if (!rules.productCategories.includes(ctx.productCategory)) return false;
  }
  if (rules.planKeys?.length) {
    if (!rules.planKeys.includes(ctx.planKey)) return false;
  }
  return true;
}
