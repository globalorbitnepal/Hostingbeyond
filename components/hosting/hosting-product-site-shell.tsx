import { SiteFooter, SiteHeader } from "@/components/layout";
import type { CmsHomeSections } from "@/lib/orbit/defaults";
import type { CmsSiteSettings } from "@/lib/orbit/defaults";

export function HostingProductSiteShell({
  sections,
  settings,
  children,
}: {
  sections: CmsHomeSections;
  settings: CmsSiteSettings;
  children: React.ReactNode;
}) {
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
      {children}
      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
