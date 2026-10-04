import type { Metadata } from "next";

import { WebHostingPageView } from "@/components/hosting/web-hosting-page";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { routes } from "@/config/routes";
import {
  buildPublicPageMetadata,
  getEcommerceHostingPageContent,
  getHomeSections,
  getPricingPageContent,
  getSiteSettings,
} from "@/lib/orbit/content";
import { ecommercePlansSection } from "@/lib/orbit/stack-hosting-plans";

export const dynamic = "force-dynamic";

const ECOMMERCE_PATH = `${routes.hosting}/ecommerce`;

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicPageMetadata("ecommerce-hosting", ECOMMERCE_PATH, {
    title: "Ecommerce Hosting — WooCommerce NVMe Online Stores",
    description:
      "WooCommerce ecommerce hosting with NVMe storage, free SSL checkout, scalable store plans, abandoned-cart tools, and 24/7 support on HostingBeyond.",
    image: "/images/hosting/ecommerce.jpg",
  });
}

export default async function EcommerceHostingPage() {
  const [sections, settings, page, pricing] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
    getEcommerceHostingPageContent(),
    getPricingPageContent(),
  ]);

  const plansContent = ecommercePlansSection(pricing);

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
      <WebHostingPageView page={page} hostingPlans={plansContent} />
      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
