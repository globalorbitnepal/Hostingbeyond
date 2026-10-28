import type { Metadata } from "next";

import { PricingPageView } from "@/components/pricing/pricing-page-view";
import { SiteFooter, SiteHeader } from "@/components/layout";
import {
  buildPublicPageMetadata,
  getPricingPageContent,
} from "@/lib/orbit/content";
import {
  getLocalizedPublicChrome,
  localizeForPreferences,
} from "@/lib/i18n/public-chrome";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicPageMetadata("pricing", "/pricing", {
    title: "Hosting & Domain Pricing — Transparent Plans",
    description:
      "Compare HostingBeyond pricing for websites, ecommerce, domains, Beyond AI, VPS and business email. Premium hosting with transparent plans and 24/7 support.",
    image: "/images/home/domains.webp",
  });
}

export default async function PricingPage() {
  const [{ sections, settings, preferences }, rawPricing] = await Promise.all([
    getLocalizedPublicChrome(),
    getPricingPageContent(),
  ]);
  const pricing = localizeForPreferences(preferences, rawPricing);
  const hostingPlans = sections.hostingPlans;

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
      <PricingPageView pricing={pricing} hostingPlans={hostingPlans} />
      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
