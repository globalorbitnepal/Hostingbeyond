"use client";

import { CloudHostingPageView } from "@/components/cloud/cloud-hosting-page";
import { HostingSpecs } from "@/components/hosting/hosting-specs";
import { HostingProductPremiumHero } from "@/components/hosting/hosting-product-premium-hero";
import { WebHostingPageView } from "@/components/hosting/web-hosting-page";
import type { ResolvedHostingProductPage } from "@/lib/hosting/load-hosting-product-page";
import {
  DEFAULT_HOSTING_SECTION_FLAGS,
  type HostingProductSectionFlags,
} from "@/lib/hosting/product-types";

export type HostingProductPageProps = ResolvedHostingProductPage;

function mergeFlags(flags: HostingProductSectionFlags) {
  return { ...DEFAULT_HOSTING_SECTION_FLAGS, ...flags };
}

/** Reusable hosting product template — same visual language as WebHostingPageView. */
export function HostingProductPage(props: HostingProductPageProps) {
  const flags = mergeFlags(props.sectionFlags);

  if (props.pageTemplate === "cloud" && props.cloudPage) {
    const page = props.cloudPage;
    return (
      <>
        <HostingProductPremiumHero
          eyebrow={page.heroEyebrow}
          title={page.heroTitle}
          titleAccent={page.heroTitleAccent}
          description={page.heroDescription}
          promo={page.heroPromo}
          primaryLabel={page.heroPrimaryLabel}
          primaryHref={page.heroPrimaryHref}
          secondaryLabel={page.heroSecondaryLabel}
          secondaryHref={page.heroSecondaryHref}
          cardEyebrow={page.heroCardEyebrow}
          highlights={page.heroHighlights}
          cardLine={page.heroCardLine}
          cardSubline="Isolated resources — no noisy neighbours"
          showAiCredit={false}
        />
        <CloudHostingPageView
          page={page}
          productCheckoutSlug={props.slug}
          productSlug={props.slug}
          productName={props.name}
          hideHero
        />
        {flags.specs ? (
          <HostingSpecs specifications={props.specifications} />
        ) : null}
      </>
    );
  }

  const page = props.page;
  const heroHighlights = page.features
    .filter((f) => f.visible !== false)
    .slice(0, 4)
    .map((f) => f.title);

  return (
    <>
      <HostingProductPremiumHero
        eyebrow={page.heroEyebrow}
        title={page.heroTitle}
        titleAccent={page.heroTitleAccent}
        description={page.heroDescription}
        promo={page.heroPromo}
        primaryLabel={page.heroPrimaryLabel}
        primaryHref={page.heroPrimaryHref}
        secondaryLabel={page.heroSecondaryLabel}
        secondaryHref={page.heroSecondaryHref}
        cardEyebrow={page.heroEyebrow}
        highlights={
          heroHighlights.length > 0
            ? heroHighlights
            : [
                "NVMe speed",
                "Free SSL",
                "Free domain on eligible plans",
                "Managed WordPress",
              ]
        }
      />
      <WebHostingPageView
        page={page}
        hostingPlans={props.hostingPlans}
        productName={props.name}
        productCheckoutSlug={props.slug}
        sectionFlags={flags}
        specifications={props.specifications}
        hideHero
      />
    </>
  );
}
