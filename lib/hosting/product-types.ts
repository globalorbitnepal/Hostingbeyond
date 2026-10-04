import type { StoredPageSeo } from "@/lib/orbit/page-seo";

export type HostingProductCategoryKey =
  "website" | "developer" | "vps" | "business";

export type HostingProductSectionFlags = {
  breadcrumb?: boolean;
  trustBadges?: boolean;
  pricing?: boolean;
  comparison?: boolean;
  features?: boolean;
  specs?: boolean;
  includedFeatures?: boolean;
  whyHostingBeyond?: boolean;
  wordpressSpotlight?: boolean;
  faq?: boolean;
  finalCta?: boolean;
};

export const DEFAULT_HOSTING_SECTION_FLAGS: HostingProductSectionFlags = {
  breadcrumb: true,
  trustBadges: true,
  pricing: true,
  comparison: true,
  features: true,
  specs: false,
  includedFeatures: false,
  whyHostingBeyond: true,
  wordpressSpotlight: true,
  faq: true,
  finalCta: true,
};

export type HostingProductBenefit = {
  id: string;
  label: string;
  icon?: string;
};

export type HostingProductFeature = {
  id: string;
  title: string;
  description: string;
  icon?: string;
};

export type HostingProductFaq = {
  id: string;
  question: string;
  answer: string;
};

export type HostingVpsSpecifications = {
  cpuCores?: string;
  ram?: string;
  nvmeStorage?: string;
  bandwidth?: string;
  ipv4?: string;
  ipv6?: string;
  location?: string;
  virtualization?: string;
  operatingSystem?: string;
  rootAccess?: string;
  snapshots?: string;
  backups?: string;
  support?: string;
};

export type HostingWebSpecifications = {
  storage?: string;
  storageType?: string;
  cpu?: string;
  ram?: string;
  bandwidth?: string;
  websites?: string;
  domains?: string;
  emailAccounts?: string;
  databases?: string;
  ssl?: string;
  backup?: string;
  controlPanel?: string;
  operatingSystem?: string;
  support?: string;
};

export type HostingProductSeo = StoredPageSeo & {
  focusKeyword?: string;
  canonicalUrl?: string;
};

export type HostingProductRegistryEntry = {
  slug: string;
  name: string;
  category: HostingProductCategoryKey;
  canonicalPath: string;
  legacyCmsSlug?: string;
  seoRegistrySlug: string;
  pageTemplate: "standard" | "cloud";
  sectionFlags: HostingProductSectionFlags;
  /** Preserve mega-menu / legacy query URLs */
  legacyQueryRedirects?: Array<{
    search: Record<string, string>;
    targetPath: string;
  }>;
};
