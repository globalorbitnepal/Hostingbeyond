"use client";

import { CloudHostingPageView } from "@/components/cloud/cloud-hosting-page";
import { HostingProductBreadcrumb } from "@/components/hosting/hosting-product-breadcrumb";
import { HostingSpecs } from "@/components/hosting/hosting-specs";
import { HostingTrustBadges } from "@/components/hosting/hosting-trust-badges";
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
    return (
      <>
        {flags.breadcrumb ? (
          <HostingProductBreadcrumb productName={props.name} />
        ) : null}
        {flags.trustBadges ? (
          <HostingTrustBadges benefits={props.benefits} />
        ) : null}
        <CloudHostingPageView
          page={props.cloudPage}
          productCheckoutSlug={props.slug}
        />
        {flags.specs ? (
          <HostingSpecs specifications={props.specifications} />
        ) : null}
      </>
    );
  }

  return (
    <>
      {flags.breadcrumb ? (
        <HostingProductBreadcrumb productName={props.name} />
      ) : null}
      {flags.trustBadges ? (
        <HostingTrustBadges benefits={props.benefits} />
      ) : null}
      <WebHostingPageView
        page={props.page}
        hostingPlans={props.hostingPlans}
        productName={props.name}
        productCheckoutSlug={props.slug}
        sectionFlags={flags}
        specifications={props.specifications}
      />
    </>
  );
}
