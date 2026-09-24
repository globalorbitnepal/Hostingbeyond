import type { Metadata } from "next";

import { BeyondAiProductPage } from "@/components/beyond-ai/beyond-ai-product-page";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { buildMetadata } from "@/lib/metadata";
import {
  getBeyondAiPageContent,
  getHomeSections,
  getSiteSettings,
} from "@/lib/orbit/content";

export const metadata: Metadata = buildMetadata({
  title: "Beyond AI — AI Website Builder & Hosting",
  description:
    "Build websites, create content, optimize SEO and launch with powerful AI models — all in one workspace with Hosting Beyond.",
  path: "/beyond-ai",
});

export default async function BeyondAiPage() {
  const [sections, settings, pageContent] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
    getBeyondAiPageContent(),
  ]);

  return (
    <div className="min-h-dvh overflow-x-hidden">
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
      <BeyondAiProductPage content={pageContent} />
      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
