import type { Metadata } from "next";

import { WebHostingPageView } from "@/components/hosting/web-hosting-page";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { routes } from "@/config/routes";
import { defaultHostingPlansSection } from "@/lib/orbit/defaults";
import {
  buildPublicPageMetadata,
  getHomeSections,
  getPythonHostingPageContent,
  getSiteSettings,
} from "@/lib/orbit/content";

export const dynamic = "force-dynamic";

const PYTHON_PATH = `${routes.hosting}/python`;

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicPageMetadata("python-hosting", PYTHON_PATH, {
    title: "Python Hosting — Django, Flask & FastAPI on NVMe",
    description:
      "Managed Python hosting for Flask, Django, and FastAPI on Linux NVMe. Free SSL, SSH on Pro+ plans, PHP/Python/Node stack, and 24/7 developer support.",
    image: "/images/home/solutions/wordpress-screen.png",
  });
}

export default async function PythonHostingPage() {
  const [sections, settings, page] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
    getPythonHostingPageContent(),
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
