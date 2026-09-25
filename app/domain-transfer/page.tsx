import type { Metadata } from "next";

import { DomainTransferPageView } from "@/components/domains/domain-transfer-page";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { routes } from "@/config/routes";
import { visiblePricing } from "@/lib/domains/content";
import { buildDomainSchema } from "@/lib/domains/seo";
import {
  buildPublicPageMetadata,
  getDomainContent,
  getDomainTransferPageContent,
  getHomeSections,
  getSiteSettings,
} from "@/lib/orbit/content";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ domain?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicPageMetadata("domain-transfer", routes.domainTransfer, {
    title: "Transfer Your Domain — Move to HostingBeyond",
    description:
      "Transfer your domain to HostingBeyond with clear pricing, DNS management, WHOIS privacy on eligible TLDs, and 24/7 support. Check eligibility and start your move in minutes.",
    image: "/images/domains/transfer.jpg",
  });
}

export default async function DomainTransferPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialDomain = params.domain?.trim() ?? "";

  const [sections, settings, page, domainContent] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
    getDomainTransferPageContent(),
    getDomainContent(),
  ]);

  const prices = visiblePricing(domainContent);
  const faqs = page.faqs
    .filter((f) => f.visible !== false)
    .map((f) => ({ question: f.question, answer: f.answer }));

  const schema = buildDomainSchema({
    name: "Transfer your domain to HostingBeyond",
    description: page.heroDescription,
    path: routes.domainTransfer,
    breadcrumb: "Domain transfer",
    faqs,
    prices,
  });

  return (
    <div className="hb-band-cream min-h-dvh overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
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
      <DomainTransferPageView
        page={page}
        prices={prices}
        initialDomain={initialDomain}
      />
      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
