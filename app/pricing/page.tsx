import type { Metadata } from "next";

import { PricingPageView } from "@/components/pricing/pricing-page-view";
import { SiteFooter, SiteHeader } from "@/components/layout";
import {
  buildPublicPageMetadata,
  getPricingPageContent,
} from "@/lib/orbit/content";
import {
  getPublicLaunchHostingCatalog,
  getPublicWebHostingPlans,
} from "@/lib/hosting/public-hosting-plans";
import {
  getLocalizedPublicChrome,
  localizeForPreferences,
} from "@/lib/i18n/public-chrome";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicPageMetadata("pricing", "/pricing", {
    title: "Hosting Plans & Pricing | HostingBeyond",
    description:
      "Compare web, WordPress, ecommerce, and Node.js hosting. Four plans on each product. Annual billing is 10% off the monthly price.",
    image: "/images/home/domains.webp",
  });
}

export default async function PricingPage() {
  const [
    { sections, settings, preferences },
    rawPricing,
    publicHostingPlans,
    launchCatalog,
  ] = await Promise.all([
    getLocalizedPublicChrome(),
    getPricingPageContent(),
    getPublicWebHostingPlans(),
    getPublicLaunchHostingCatalog(),
  ]);
  const pricing = localizeForPreferences(preferences, rawPricing);
  pricing.categories = pricing.categories.filter(
    (category) => category.id !== "vps",
  );
  const hostingPlans = publicHostingPlans;

  return (
    <div className="hb-band-cream min-h-dvh overflow-x-hidden">
      <div className="hb-band-purple">
        <SiteHeader
          navigation={sections.navigation}
          loginLabel={settings.loginLabel}
          loginHref={settings.loginHref}
          getStartedLabel={settings.getStartedLabel}
          getStartedHref={settings.getStartedHref}
          logoPath={settings.logoPath}
        />
      </div>
      <PricingPageView
        pricing={pricing}
        hostingPlans={hostingPlans}
        launchCatalog={launchCatalog}
      />
      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
