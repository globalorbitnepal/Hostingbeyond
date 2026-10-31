import type { HostingBillingCycle } from "@/lib/hosting/purchase-intent";

import type { CartAddonSelection } from "../addons/types";

export type DomainChoice = "search" | "existing" | "later" | null;

export type HostingCartConfiguration = {
  productSlug: string;
  planKey: string;
  billingPeriod: HostingBillingCycle;
  domainChoice: DomainChoice;
  domainName: string | null;
  /** First-year registration USD when buying a domain with monthly hosting. */
  domainRegisterUsd: number | null;
  /** Complimentary first month of business email on monthly hosting. */
  freeEmailMonth: boolean;
  /** Generic add-on selections (authoritative). */
  addons: CartAddonSelection[];
};

export type HostingCartQuoteLine = {
  id: string;
  label: string;
  amount: number;
  kind: "hosting" | "discount" | "domain" | "addon" | "tax";
  note?: string;
};

export type HostingCartQuote = {
  configuration: HostingCartConfiguration;
  planName: string;
  productName: string;
  currency: string;
  lines: HostingCartQuoteLine[];
  subtotal: number;
  discount: number;
  tax: number | null;
  total: number;
  freeDomainEligible: boolean;
  monthlyEquivalent: number | null;
  billedAmount: number;
  renewalPrice: number | null;
  features: string[];
  errors: string[];
  eligibleAddonSlugs: string[];
  emailTrialRenewalUsd: number | null;
};

export const HOSTING_CART_STORAGE_KEY = "hb_hosting_cart_v2";
