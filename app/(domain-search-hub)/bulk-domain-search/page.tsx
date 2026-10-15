import type { Metadata } from "next";

import { DomainSearchView } from "@/components/domains/domain-search-view";
import { routes } from "@/config/routes";
import { getDomainContent } from "@/lib/orbit/content";
import { visiblePricing } from "@/lib/domains/content";
import { mergeRetailIntoPricingRows } from "@/lib/domains/domain-search-page-data";
import { buildDomainPageMetadata } from "@/lib/domains/page-metadata";
import { buildDomainSchema } from "@/lib/domains/seo";

const PATH = routes.bulkDomainSearch;

export async function generateMetadata(): Promise<Metadata> {
  const { bulk } = await getDomainContent();
  return buildDomainPageMetadata(bulk, PATH);
}

export default async function BulkDomainSearchPage() {
  const content = await getDomainContent();
  const page = content.bulk;
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
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <DomainSearchView
        mode="bulk"
        content={content}
        page={page}
        crossLinkHref={routes.domainSearch}
        displayPricing={displayPricing}
        hubBackdrop
      />
    </>
  );
}
