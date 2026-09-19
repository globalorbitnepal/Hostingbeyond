import type { Metadata } from "next";

import { DomainSearchView } from "@/components/domains/domain-search-view";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { routes } from "@/config/routes";
import {
  getDomainContent,
  getHomeSections,
  getSiteSettings,
} from "@/lib/orbit/content";
import { buildMetadata } from "@/lib/metadata";
import { buildDomainSchema } from "@/lib/domains/seo";

const PATH = routes.domainSearch;

export async function generateMetadata(): Promise<Metadata> {
  const { single } = await getDomainContent();
  return buildMetadata({
    title: single.seoTitle,
    description: single.seoDescription,
    path: PATH,
    image: "/images/domains/hero.jpg",
  });
}

export default async function DomainNameSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const [sections, settings, content, params] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
    getDomainContent(),
    searchParams,
  ]);

  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const initialQuery = (rawQuery ?? "").slice(0, 80);
  const page = content.single;

  const schema = buildDomainSchema({
    name: page.title,
    description: page.seoDescription,
    path: PATH,
    breadcrumb: page.title,
    faqs: page.faqs
      .filter((item) => item.visible !== false)
      .map((item) => ({ question: item.question, answer: item.answer })),
    prices: content.shared.pricing,
    withSearchAction: true,
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
          mode="single"
          initialQuery={initialQuery}
          content={content}
          page={page}
          crossLinkHref={routes.bulkDomainSearch}
        />
      </div>

      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
