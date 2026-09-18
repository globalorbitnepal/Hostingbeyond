import type { Metadata } from "next";

import { BusinessEmailPageView } from "@/components/business-email/business-email-page";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { getHomeSections, getSiteSettings } from "@/lib/orbit/content";

export const metadata: Metadata = {
  title: "Professional business email for your brand | HostingBeyond Mail",
  description:
    "Create a professional business email on your domain from $0.37/mo. AI writing, secure mail hosting, and easy migration on HostingBeyond.",
};

export default async function BusinessEmailPage() {
  const [sections, settings] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
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
      <BusinessEmailPageView />
      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
