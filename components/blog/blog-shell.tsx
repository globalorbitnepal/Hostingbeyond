import { SiteFooter, SiteHeader } from "@/components/layout";
import { getLocalizedPublicChrome } from "@/lib/i18n/public-chrome";

export async function BlogSiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sections, settings } = await getLocalizedPublicChrome();

  return (
    <div className="hb-band-cream min-h-dvh overflow-x-hidden">
      <div className="hb-band-purple">
        <SiteHeader
          navigation={sections.navigation}
          loginLabel={settings.loginLabel}
          loginHref={settings.loginHref}
          getStartedLabel={settings.getStartedLabel}
          getStartedHref={settings.getStartedHref}
        />
      </div>
      <main className="hb-shell py-8 sm:py-12 lg:py-14">{children}</main>
      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
