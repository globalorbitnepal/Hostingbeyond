import type { Metadata } from "next";

import { SiteFooter, SiteHeader } from "@/components/layout";
import { SslPageView } from "@/components/ssl/ssl-page";
import {
  buildPublicPageMetadata,
  getSslPageContent,
} from "@/lib/orbit/content";
import {
  getLocalizedPublicChrome,
  localizeForPreferences,
} from "@/lib/i18n/public-chrome";

export const dynamic = "force-dynamic";

const PAGE_PATH = "/web-hosting/ssl";

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicPageMetadata("ssl", PAGE_PATH, {
    title: "SSL Certificates — Free HTTPS & Premium SSL | HostingBeyond",
    description:
      "Secure every domain with free automated SSL or premium DV, wildcard, and multi-domain certificates. Automatic installation, forced HTTPS, renewal monitoring, and 24/7 support.",
    image: "/images/hosting/cloud.jpg",
  });
}

export default async function SslCertificatePage() {
  const [{ sections, settings, preferences }, rawPage] = await Promise.all([
    getLocalizedPublicChrome(),
    getSslPageContent(),
  ]);
  const page = localizeForPreferences(preferences, rawPage);

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
      <main id="main-content">
        <SslPageView content={page} />
      </main>
      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
