import { siteConfig } from "@/config/site";
import type { DomainFaq } from "@/components/domains/domain-faq";
import type { DomainTldRow } from "@/lib/domains/content";

/**
 * Structured data for the domain search pages. Each page passes its own name,
 * path and FAQ set so Google sees two distinct, self-describing documents.
 */
export function buildDomainSchema({
  name,
  description,
  path,
  breadcrumb,
  faqs,
  prices,
  withSearchAction = false,
}: {
  name: string;
  description: string;
  path: string;
  breadcrumb: string;
  faqs: DomainFaq[];
  prices: DomainTldRow[];
  withSearchAction?: boolean;
}) {
  const url = new URL(path, siteConfig.url).toString();
  const sorted = [...prices].sort((a, b) => a.register - b.register);
  const cheapest = sorted[0];
  const highest = sorted[sorted.length - 1];

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name,
      description,
      url,
      inLanguage: "en-US",
      isPartOf: {
        "@type": "WebSite",
        name: siteConfig.name,
        url: siteConfig.url,
        ...(withSearchAction
          ? {
              potentialAction: {
                "@type": "SearchAction",
                target: `${url}?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }
          : {}),
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: new URL("/images/domains/hero.jpg", siteConfig.url).toString(),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteConfig.url,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Domains",
          item: new URL("/domain-name-search", siteConfig.url).toString(),
        },
        { "@type": "ListItem", position: 3, name: breadcrumb, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Domain name registration",
      brand: { "@type": "Brand", name: siteConfig.name },
      description:
        "Register a domain name with free WHOIS privacy, free DNS management and renewal pricing shown upfront.",
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "USD",
        lowPrice: cheapest?.register ?? 0.01,
        highPrice: highest?.register ?? 89.99,
        offerCount: prices.length,
        availability: "https://schema.org/InStock",
        url,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ];
}
