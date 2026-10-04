import type { HostingAddonBillingMode, HostingAddonType } from "@prisma/client";

export type HostingAddonEligibility = {
  productSlugs?: string[];
  productCategories?: string[];
  planKeys?: string[];
};

export type ResolvedHostingAddon = {
  id: string;
  slug: string;
  name: string;
  description: string;
  type: HostingAddonType;
  billingMode: HostingAddonBillingMode;
  pricingReference: string;
  displayOrder: number;
};

export type CartAddonSelection = {
  addonSlug: string;
  enabled: boolean;
  quantity: number;
  optionId: string | null;
};

export type AddonPriceOption = {
  id: string;
  label: string;
  unitMonthlyPrice: number;
  description?: string;
};

export type AddonQuoteLine = {
  addonSlug: string;
  name: string;
  optionLabel: string | null;
  quantity: number;
  amount: number;
  billingLabel: string;
};
