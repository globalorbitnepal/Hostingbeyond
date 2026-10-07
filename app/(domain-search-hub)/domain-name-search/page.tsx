import type { Metadata } from "next";

import { DomainSearchView } from "@/components/domains/domain-search-view";
import { routes } from "@/config/routes";
import { getDomainContent } from "@/lib/orbit/content";
import { buildDomainPageMetadata } from "@/lib/domains/page-metadata";
import { buildDomainSchema } from "@/lib/domains/seo";
import { visiblePricing } from "@/lib/domains/content";
import {
  applyLiveExtensionStats,
  getRetailRegisterMap,
  loadDomainSearchPageMetrics,
  mergeRetailIntoPricingRows,
} from "@/lib/domains/domain-search-page-data";

function withSupportedExtensionCopy(
  text: string,
  count: number | null,
): string {
  if (!text) return text;
  if (count != null && count > 0) {
    return text
      .replace(/300\+/g, `${count}+`)
      .replace(/300\s*\+/g, `${count}+`);
  }
  return text.replace(/300\+\s*extensions/gi, "supported extensions");
}

const PATH = routes.domainSearch;

export async function generateMetadata(): Promise<Metadata> {
  const { single } = await getDomainContent();
  return buildDomainPageMetadata(single, PATH);
}

export default async function DomainNameSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const [content, params] = await Promise.all([
    getDomainContent(),
    searchParams,
  ]);

  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const initialQuery = (rawQuery ?? "").slice(0, 80);
  const page = content.single;
  const metrics = await loadDomainSearchPageMetrics();
  const supportedTldCount = metrics.searchableCount || null;
  const pageForView = {
    ...page,
    description: withSupportedExtensionCopy(
      page.description,
      supportedTldCount,
    ),
    stats: applyLiveExtensionStats(page.stats, {
      searchableCount: metrics.searchableCount,
      tier1PoolSize: metrics.tier1PoolSize,
    }),
  };

  const chipTlds = content.shared.heroChips
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const retailMap = await getRetailRegisterMap(chipTlds);
  const chipRetailByTld: Record<string, number> = {};
  for (const [tld, price] of retailMap) {
    chipRetailByTld[tld] = price;
  }
  const displayPricing = await mergeRetailIntoPricingRows(
    visiblePricing(content),
  );

  const schema = buildDomainSchema({
    name: page.title,
    description: page.seoDescription,
    path: PATH,
    breadcrumb: page.title,
    faqs: page.faqs
      .filter((item) => item.visible !== false)
      .map((item) => ({ question: item.question, answer: item.answer })),
    prices: displayPricing,
    withSearchAction: true,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <DomainSearchView
        mode="single"
        initialQuery={initialQuery}
        content={content}
        page={pageForView}
        crossLinkHref={routes.bulkDomainSearch}
        chipRetailByTld={chipRetailByTld}
        displayPricing={displayPricing}
        hubBackdrop
      />
    </>
  );
}
