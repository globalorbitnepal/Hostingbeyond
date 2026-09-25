import type { Metadata } from "next";

import { WebHostingPageView } from "@/components/hosting/web-hosting-page";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { routes } from "@/config/routes";
import { defaultHostingPlansSection } from "@/lib/orbit/defaults";
import {
  buildPublicPageMetadata,
  getHomeSections,
  getHostingPageContent,
  getSiteSettings,
} from "@/lib/orbit/content";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicPageMetadata("hosting", routes.hosting, {
    title: "Web Hosting — Fast NVMe WordPress Hosting",
    description:
      "Compare HostingBeyond web hosting plans with free SSL, NVMe storage, managed WordPress, free domain options, and 24/7 support. Save up to 70% on annual billing.",
    image: "/images/hosting/cloud.jpg",
  });
}

export default async function WebHostingPage() {
  const [sections, settings, page] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
    getHostingPageContent(),
  ]);

  const hostingPlans = sections.hostingPlans ?? defaultHostingPlansSection();

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
      <WebHostingPageView page={page} hostingPlans={hostingPlans} />
      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
