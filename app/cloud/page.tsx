import type { Metadata } from "next";

import { CloudHostingPageView } from "@/components/cloud/cloud-hosting-page";
import { SiteFooter, SiteHeader } from "@/components/layout";
import {
  buildPublicPageMetadata,
  getCloudHostingPageContent,
  getHomeSections,
  getSiteSettings,
} from "@/lib/orbit/content";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicPageMetadata("cloud", "/cloud", {
    title: "Cloud Hosting — Dedicated CPU & NVMe",
    description:
      "Managed cloud hosting with dedicated RAM, vCPU, and NVMe storage. Compare Cloud Starter, Business, and Pro plans with free SSL and 24/7 support on HostingBeyond.",
    image: "/images/hosting/cloud.jpg",
  });
}

export default async function CloudHostingPage() {
  const [sections, settings, page] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
    getCloudHostingPageContent(),
  ]);

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
      <CloudHostingPageView page={page} />
      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
