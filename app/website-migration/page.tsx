import type { Metadata } from "next";

import { WebsiteMigrationPageView } from "@/components/migration/website-migration-page";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { routes } from "@/config/routes";
import { defaultHostingPlansSection } from "@/lib/orbit/defaults";
import {
  buildPublicPageMetadata,
  getHomeSections,
  getSiteSettings,
  getWebsiteMigrationPageContent,
} from "@/lib/orbit/content";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicPageMetadata("website-migration", routes.websiteMigration, {
    title: "Free Website Migration — Move Your Site to HostingBeyond",
    description:
      "Migrate unlimited websites for free on eligible HostingBeyond plans. Expert-assisted moves, Beyond AI checks, and 24/7 support with minimal downtime.",
    image: "/images/hosting/cloud.jpg",
  });
}

export default async function WebsiteMigrationPage() {
  const [sections, settings, page] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
    getWebsiteMigrationPageContent(),
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
      <WebsiteMigrationPageView page={page} hostingPlans={hostingPlans} />
      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
