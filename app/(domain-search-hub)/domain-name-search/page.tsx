import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DomainSearchView } from "@/components/domains/domain-search-view";
import { routes } from "@/config/routes";
import { businessEmailBookingHref } from "@/lib/business-email/purchase-intent";
import { getDomainContent } from "@/lib/orbit/content";
import { buildDomainPageMetadata } from "@/lib/domains/page-metadata";
import { buildDomainSchema } from "@/lib/domains/seo";
import { visiblePricing } from "@/lib/domains/content";
import {
  applyLiveExtensionStats,
  getRetailRegisterMap,
  loadDomainSearchPageMetrics,
  getPopularPickPricing,
  mergeRetailIntoPricingRows,
} from "@/lib/domains/domain-search-page-data";
import { getRequestPreferences } from "@/lib/i18n/server-locale";
import { localizeCopyTree } from "@/lib/i18n/localize-copy-tree";

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
  searchParams: Promise<{
    q?: string | string[];
    email?: string | string[];
    term?: string | string[];
  }>;
}) {
  const [content, params, preferences] = await Promise.all([
    getDomainContent(),
    searchParams,
    getRequestPreferences(),
  ]);

  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const initialQuery = (rawQuery ?? "").slice(0, 80);
  const emailPlanId = Array.isArray(params.email)
    ? params.email[0]
    : params.email;
  const emailTerm = Array.isArray(params.term) ? params.term[0] : params.term;
  if (emailPlanId?.trim()) {
    redirect(businessEmailBookingHref(emailPlanId, emailTerm ?? "monthly"));
  }
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
  const popularTlds = content.shared.popularPicks
    .filter((p) => p.visible !== false)
    .map((p) => p.tld);
  const popularPricing = await getPopularPickPricing(
    popularTlds,
    displayPricing,
  );

  const localizedContent = localizeCopyTree(preferences.language, content);
  const localizedPage = localizeCopyTree(preferences.language, pageForView);

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
        content={localizedContent}
        page={localizedPage}
        crossLinkHref={routes.bulkDomainSearch}
        chipRetailByTld={chipRetailByTld}
        displayPricing={displayPricing}
        popularPricing={popularPricing}
        hubBackdrop
      />
    </>
  );
}
