import type { Metadata } from "next";

import { DomainTransferView } from "@/components/domains/domain-transfer-view";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { routes } from "@/config/routes";
import {
  getDomainContent,
  getHomeSections,
  getSiteSettings,
} from "@/lib/orbit/content";
import { buildDomainPageMetadata } from "@/lib/domains/page-metadata";
import { buildDomainSchema } from "@/lib/domains/seo";

const PATH = routes.domainTransfer;

export async function generateMetadata(): Promise<Metadata> {
  const { transfer } = await getDomainContent();
  return buildDomainPageMetadata(transfer, PATH);
}

type PageProps = {
  searchParams: Promise<{ domain?: string | string[] }>;
};

export default async function DomainTransferPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const raw = Array.isArray(params.domain) ? params.domain[0] : params.domain;
  const initialDomain = (raw ?? "").slice(0, 80);

  const [sections, settings, content] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
    getDomainContent(),
  ]);

  const page = content.transfer;

  const schema = buildDomainSchema({
    name: page.title,
    description: page.seoDescription,
    path: PATH,
    breadcrumb: page.title,
    faqs: page.faqs
      .filter((item) => item.visible !== false)
      .map((item) => ({ question: item.question, answer: item.answer })),
    prices: content.shared.pricing,
  });

  return (
    <div className="hb-band-cream min-h-dvh overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="hb-band-purple relative">
        <SiteHeader
          navigation={sections.navigation}
          loginLabel={settings.loginLabel}
          loginHref={settings.loginHref}
          getStartedLabel={settings.getStartedLabel}
          getStartedHref={settings.getStartedHref}
          logoPath={settings.logoPath}
        />

        <DomainTransferView
          initialDomain={initialDomain}
          content={content}
          page={page}
          crossLinkHref={routes.domainSearch}
        />
      </div>

      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
