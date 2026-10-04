import {
  getCloudHostingPageContent,
  getEcommerceHostingPageContent,
  getHostingPageContent,
  getHomeSections,
  getPythonHostingPageContent,
  getWordPressHostingPageContent,
} from "@/lib/orbit/content";
import type { CmsCloudHostingPageContent } from "@/lib/orbit/cloud-hosting-page-content";
import type { CmsHostingPageContent } from "@/lib/orbit/hosting-page-content";
import { defaultHostingPlansSection } from "@/lib/orbit/defaults";
import type { CmsHostingPlansContent } from "@/lib/orbit/defaults";

import { getHostingProductBySlug } from "./hosting-products";
import { dbPlansToCmsHostingPlans } from "./plans-to-cms";
import {
  DEFAULT_HOSTING_SECTION_FLAGS,
  type HostingProductBenefit,
  type HostingProductSectionFlags,
  type HostingVpsSpecifications,
  type HostingWebSpecifications,
} from "./product-types";
import { getRegistryEntryBySlug } from "./products-registry";

export type ResolvedHostingProductPage = {
  slug: string;
  name: string;
  canonicalPath: string;
  pageTemplate: "standard" | "cloud";
  sectionFlags: HostingProductSectionFlags;
  benefits: HostingProductBenefit[];
  specifications: HostingWebSpecifications | HostingVpsSpecifications;
  page: CmsHostingPageContent;
  cloudPage?: CmsCloudHostingPageContent;
  hostingPlans: CmsHostingPlansContent;
  inactive: boolean;
};

async function loadLegacyPageContent(
  legacyCmsSlug: string | null | undefined,
): Promise<{
  standard?: CmsHostingPageContent;
  cloud?: CmsCloudHostingPageContent;
}> {
  switch (legacyCmsSlug) {
    case "hosting-product":
      return { standard: await getHostingPageContent() };
    case "wordpress-hosting-product":
      return { standard: await getWordPressHostingPageContent() };
    case "ecommerce-hosting-product":
      return { standard: await getEcommerceHostingPageContent() };
    case "python-hosting-product":
      return { standard: await getPythonHostingPageContent() };
    case "cloud-hosting-product":
      return { cloud: await getCloudHostingPageContent() };
    default:
      return { standard: await getHostingPageContent() };
  }
}

function overlayHeroOnPage(
  page: CmsHostingPageContent,
  product: NonNullable<Awaited<ReturnType<typeof getHostingProductBySlug>>>,
): CmsHostingPageContent {
  const titleParts = product.heroTitle.split(/\s+/);
  const accent = titleParts.length > 1 ? titleParts.pop()! : "";
  const title = titleParts.join(" ") || product.heroTitle;
  return {
    ...page,
    heroEyebrow: product.name,
    heroTitle: title,
    heroTitleAccent: accent,
    heroDescription: product.heroDescription || page.heroDescription,
    heroPrimaryLabel: product.heroCtaLabel ?? page.heroPrimaryLabel,
    heroPrimaryHref: product.heroCtaHref ?? page.heroPrimaryHref,
    heroSecondaryLabel: product.secondaryCtaLabel ?? page.heroSecondaryLabel,
    heroSecondaryHref: product.secondaryCtaHref ?? page.heroSecondaryHref,
  };
}

export async function loadHostingProductPage(
  slug: string,
): Promise<ResolvedHostingProductPage | null> {
  const registry = getRegistryEntryBySlug(slug);
  const product = await getHostingProductBySlug(slug);
  if (!registry && !product) return null;

  const resolvedSlug = product?.slug ?? registry!.slug;
  const legacy = await loadLegacyPageContent(
    product?.legacyCmsSlug ?? registry?.legacyCmsSlug,
  );

  const sectionFlags = {
    ...DEFAULT_HOSTING_SECTION_FLAGS,
    ...(registry?.sectionFlags ?? {}),
    ...((product?.sectionFlags as HostingProductSectionFlags | null) ?? {}),
  };

  const sections = await getHomeSections();
  const fallbackPlans = sections.hostingPlans ?? defaultHostingPlansSection();

  const hostingPlans = product?.plans?.length
    ? dbPlansToCmsHostingPlans(resolvedSlug, product.plans)
    : fallbackPlans;

  if (!product) {
    const page = legacy.standard ?? (await getHostingPageContent());
    return {
      slug: resolvedSlug,
      name: registry!.name,
      canonicalPath: registry!.canonicalPath,
      pageTemplate: registry!.pageTemplate,
      sectionFlags,
      benefits: [],
      specifications: {},
      page,
      cloudPage: legacy.cloud,
      hostingPlans,
      inactive: false,
    };
  }

  const page = legacy.standard
    ? overlayHeroOnPage(legacy.standard, product)
    : overlayHeroOnPage(await getHostingPageContent(), product);

  return {
    slug: product.slug,
    name: product.name,
    canonicalPath: product.canonicalPath,
    pageTemplate: product.pageTemplate === "cloud" ? "cloud" : "standard",
    sectionFlags,
    benefits: (product.benefits as HostingProductBenefit[]) ?? [],
    specifications: (product.specifications as HostingWebSpecifications) ?? {},
    page,
    cloudPage: legacy.cloud,
    hostingPlans,
    inactive: product.status !== "ACTIVE",
  };
}
