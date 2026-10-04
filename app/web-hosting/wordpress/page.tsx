import type { Metadata } from "next";

import { WebHostingPageView } from "@/components/hosting/web-hosting-page";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { routes } from "@/config/routes";
import { defaultHostingPlansSection } from "@/lib/orbit/defaults";
import {
  buildPublicPageMetadata,
  getHomeSections,
  getSiteSettings,
  getWordPressHostingPageContent,
} from "@/lib/orbit/content";

export const dynamic = "force-dynamic";

const WORDPRESS_PATH = `${routes.hosting}/wordpress`;

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicPageMetadata("wordpress-hosting", WORDPRESS_PATH, {
    title: "WordPress Hosting — Managed & WooCommerce Ready",
    description:
      "Managed WordPress hosting on NVMe with one-click install, free SSL, automatic updates, WooCommerce support, and 24/7 expert help on HostingBeyond.",
    image: "/images/home/wordpress.webp",
  });
}

export default async function WordPressHostingPage() {
  const [sections, settings, page] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
    getWordPressHostingPageContent(),
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
