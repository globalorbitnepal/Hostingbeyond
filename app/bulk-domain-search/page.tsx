import type { Metadata } from "next";

import type { DomainFaq } from "@/components/domains/domain-faq";
import { DomainSearchView } from "@/components/domains/domain-search-view";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { routes } from "@/config/routes";
import { getHomeSections, getSiteSettings } from "@/lib/orbit/content";
import { buildMetadata } from "@/lib/metadata";
import { buildDomainSchema } from "@/lib/domains/seo";
import { PRICE_BY_TLD, formatPrice } from "@/lib/domains/tlds";

const PATH = routes.bulkDomainSearch;
const COM = PRICE_BY_TLD.get(".com");
const DESCRIPTION =
  "Check up to 50 domain names at once with our bulk domain search. Paste your shortlist and see availability, first-year pricing and renewal rates for every name in one table.";

export const metadata: Metadata = buildMetadata({
  title: "Bulk Domain Search — Check 50 Domain Names at Once",
  description: DESCRIPTION,
  path: PATH,
  image: "/images/domains/hero.jpg",
});

const FAQS: DomainFaq[] = [
  {
    question: "How many domains can I check at once?",
    answer:
      "Up to 50 names per run. Paste one domain per line — commas and spaces work too — and every line comes back with its availability, first-year price and renewal rate in a single table.",
  },
  {
    question: "Who is bulk domain search for?",
    answer:
      "Agencies, brand teams and developers who need to clear a shortlist before a launch. Instead of checking names one at a time, you validate a whole naming round in one pass and share the result with your client.",
  },
  {
    question: "Can I mix different extensions in one list?",
    answer:
      "Yes. Each line is treated on its own, so you can compare yourbrand.com, yourbrand.io and yourbrand.store together, or check fifty completely different names in the same run.",
  },
  {
    question: "What if a line has no extension?",
    answer:
      "Lines without an extension default to .com so the list still returns a usable answer. Add the extension you actually want to compare — for example brand.ai — and the result reflects that registry's pricing.",
  },
  {
    question: "Do bulk results show renewal prices too?",
    answer: `Yes. Every row shows the promotional first-year price and the standard renewal, the same way single search does. A .com is ${formatPrice(COM?.register ?? 0.01)} for year one and ${formatPrice(COM?.renew ?? 19.99)}/yr after that.`,
  },
  {
    question: "Can I register several names together?",
    answer:
      "You can add each available name to the cart from the results list and check out in one order. WHOIS privacy, DNS and renewal reminders come with every registration.",
  },
  {
    question: "Is there a limit on how often I can search?",
    answer:
      "Normal use is unrestricted. Very large automated runs are rate limited to protect registry lookups — if you need programmatic access for thousands of names, contact us about API access.",
  },
];

export default async function BulkDomainSearchPage() {
  const [sections, settings] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
  ]);

  const schema = buildDomainSchema({
    name: "Bulk Domain Search",
    description: DESCRIPTION,
    path: PATH,
    breadcrumb: "Bulk domain search",
    faqs: FAQS,
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
          eyebrow="Bulk lookup for teams"
          title="Bulk domain search"
          titleAccent="for 50 names at a time"
          description="Paste your whole shortlist and get availability, first-year pricing and renewal rates for every line — built for agencies clearing a naming round."
          pricingHeading="One price list for every name on your list"
          pricingCopy="Filter by what the client is building. Each row shows the first-year promo, the standard renewal and the transfer-in price, so a multi-domain quote takes minutes."
          faqHeading="Questions teams ask about bulk checks"
          faqs={FAQS}
          stats={[
            { value: "50", label: "Names per run" },
            { value: "300+", label: "Extensions" },
            { value: "1 table", label: "Shareable result" },
          ]}
          crossLink={{
            href: routes.domainSearch,
            label: "Search a single domain",
            helper:
              "Clear the whole shortlist now, then register the winners in one order. Checking just one idea? Use the single domain search.",
          }}
        />
      </div>

      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
