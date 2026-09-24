import type { Metadata } from "next";

import { PricingPageView } from "@/components/pricing/pricing-page-view";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { getHomeSections, getSiteSettings } from "@/lib/orbit/content";

export const metadata: Metadata = {
  title: "Pricing — HostingBeyond",
  description:
    "Compare HostingBeyond pricing for websites, ecommerce, domains, Beyond AI builder, VPS, AI agents, and business email. Premium hosting with transparent plans and 24/7 support.",
};

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const [sections, settings] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
  ]);

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
      <PricingPageView hostingPlans={hostingPlans} />
      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
