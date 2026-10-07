import { DomainSearchHubBackdrop } from "@/components/domains/domain-search-hub-backdrop";
import { SiteFooter, SiteHeader } from "@/components/layout";
import {
  getDomainContent,
  getHomeSections,
  getSiteSettings,
} from "@/lib/orbit/content";

export default async function DomainSearchHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sections, settings, content] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
    getDomainContent(),
  ]);

  return (
    <div className="hb-band-cream min-h-dvh overflow-x-clip">
      <div className="hb-band-purple relative">
        <DomainSearchHubBackdrop heroImage={content.shared.heroImage} />
        <SiteHeader
          navigation={sections.navigation}
          loginLabel={settings.loginLabel}
          loginHref={settings.loginHref}
          getStartedLabel={settings.getStartedLabel}
          getStartedHref={settings.getStartedHref}
          logoPath={settings.logoPath}
        />
        {children}
      </div>

      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
