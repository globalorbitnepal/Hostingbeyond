import { SiteFooter, SiteHeader } from "@/components/layout";
import type { CmsHomeSections } from "@/lib/orbit/defaults";
import type { CmsSiteSettings } from "@/lib/orbit/defaults";

export function HostingProductSiteShell({
  sections,
  settings,
  children,
  overlayHero = false,
}: {
  sections: CmsHomeSections;
  settings: CmsSiteSettings;
  children: React.ReactNode;
  /** Float the existing navbar over a full-bleed hero (web hosting). */
  overlayHero?: boolean;
}) {
  const header = (
    <SiteHeader
      navigation={sections.navigation}
      loginLabel={settings.loginLabel}
      loginHref={settings.loginHref}
      getStartedLabel={settings.getStartedLabel}
      getStartedHref={settings.getStartedHref}
      logoPath={settings.logoPath}
    />
  );

  return (
    <div className="hb-band-cream min-h-dvh overflow-x-hidden">
      {overlayHero ? (
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-50">
            <div className="pointer-events-auto">{header}</div>
          </div>
          {children}
        </div>
      ) : (
        <>
          <div className="hb-band-purple">{header}</div>
          {children}
        </>
      )}
      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
