import type { Metadata } from "next";

import { BeyondAiPricingView } from "@/components/beyond-ai/beyond-ai-pricing-view";
import { SiteFooter } from "@/components/layout";
import { getHomeSections, getSiteSettings } from "@/lib/orbit/content";

export const metadata: Metadata = {
  title: "Beyond AI — Build with 100+ models, host free | HostingBeyond",
  description:
    "Beyond AI on HostingBeyond: monthly AI balance, top models, free hosting, and on-demand top-ups. Build sites and go live in minutes.",
};

export default async function BeyondAiPage() {
  const [sections, settings] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
  ]);

  return (
    <div className="min-h-dvh overflow-x-hidden">
      <BeyondAiPricingView logoPath={settings.logoPath} />
      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
