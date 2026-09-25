import type { Metadata } from "next";

import { DomainSearchView } from "@/components/domains/domain-search-view";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { routes } from "@/config/routes";
import {
  getDomainContent,
  getHomeSections,
  getSiteSettings,
} from "@/lib/orbit/content";
import { buildDomainPageMetadata } from "@/lib/domains/page-metadata";
import { buildDomainSchema } from "@/lib/domains/seo";

const PATH = routes.bulkDomainSearch;

export async function generateMetadata(): Promise<Metadata> {
  const { bulk } = await getDomainContent();
  return buildDomainPageMetadata(bulk, PATH);
}

export default async function BulkDomainSearchPage() {
  const [sections, settings, content] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
    getDomainContent(),
  ]);

  const page = content.bulk;

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

        <DomainSearchView
          mode="bulk"
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
