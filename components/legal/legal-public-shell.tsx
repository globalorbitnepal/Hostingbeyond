import { SiteFooter, SiteHeader } from "@/components/layout";
import { getLocalizedPublicChrome } from "@/lib/i18n/public-chrome";

export async function LegalPublicShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sections, settings } = await getLocalizedPublicChrome();

  return (
    <div className="hb-band-cream min-h-dvh overflow-x-hidden text-[#1a1035]">
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
      <main id="main-content">{children}</main>
      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
