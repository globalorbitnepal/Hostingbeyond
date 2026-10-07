import type { Metadata } from "next";
import { DomainCartPageView } from "@/components/domains/domain-cart-page-view";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { routes } from "@/config/routes";
import { buildMetadata } from "@/lib/metadata";
import { getHomeSections, getSiteSettings } from "@/lib/orbit/content";

export const metadata: Metadata = buildMetadata({
  title: "Domain cart — HostingBeyond",
  description:
    "Review domain names in your cart, see first-year and renewal pricing, and continue to secure checkout.",
  path: routes.domainCart,
});

export default async function DomainCartPage() {
  const [sections, settings] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
  ]);

  return (
    <>
      <div className="hb-band-purple border-b border-white/10">
        <SiteHeader
          navigation={sections.navigation}
          loginLabel={settings.loginLabel}
          loginHref={settings.loginHref}
          getStartedLabel={settings.getStartedLabel}
          getStartedHref={settings.getStartedHref}
          logoPath={settings.logoPath}
        />
      </div>
      <DomainCartPageView />
      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </>
  );
}
