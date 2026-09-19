import type { Metadata } from "next";

import type { DomainFaq } from "@/components/domains/domain-faq";
import { DomainSearchView } from "@/components/domains/domain-search-view";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { routes } from "@/config/routes";
import { getHomeSections, getSiteSettings } from "@/lib/orbit/content";
import { buildMetadata } from "@/lib/metadata";
import { buildDomainSchema } from "@/lib/domains/seo";
import { PRICE_BY_TLD, formatPrice } from "@/lib/domains/tlds";

const PATH = routes.domainSearch;
const COM = PRICE_BY_TLD.get(".com");
const DESCRIPTION =
  "Search any domain name and check availability instantly across .com, .io, .ai, .store and 300+ extensions. First-year and renewal prices shown side by side, free WHOIS privacy and free DNS on every domain.";

export const metadata: Metadata = buildMetadata({
  title: `Domain Name Search — Check Availability & Register from ${formatPrice(COM?.register ?? 0.01)}`,
  description: DESCRIPTION,
  path: PATH,
  image: "/images/domains/hero.jpg",
});

const FAQS: DomainFaq[] = [
  {
    question: "How does the domain name search work?",
    answer:
      "Type any idea — with or without an extension — and HostingBeyond checks availability across ten popular extensions at once. Each result shows the first-year price, the renewal price and whether the name is free, premium or already registered, so you can decide on one screen.",
  },
  {
    question: "How much does a domain name cost?",
    answer: `Prices depend on the extension. A .com is ${formatPrice(COM?.register ?? 0.01)} for the first year and renews at ${formatPrice(COM?.renew ?? 19.99)}/yr. Extensions like .online, .shop, .store and .site start under $1 for year one, while .io, .ai and .tech sit higher. Every renewal rate is published in the pricing table above the fold.`,
  },
  {
    question: "Why is the renewal price higher than the first year?",
    answer:
      "First-year rates are promotional, so registries and registrars can offer a low entry price. We show the standard renewal next to it for every extension, because the honest number is the one you pay from year two onward.",
  },
  {
    question: "Is WHOIS privacy really free?",
    answer:
      "Yes, on every eligible extension. WHOIS privacy replaces your name, address, email and phone number in the public registry record at no extra cost, which cuts spam and protects your personal data.",
  },
  {
    question: "Do I need hosting to register a domain?",
    answer:
      "No. You can register a name and park it, then add hosting, business email or a Beyond AI website whenever you are ready. Everything stays in one HostingBeyond account, so there is nothing to migrate later.",
  },
  {
    question: "What happens if the name I want is taken?",
    answer:
      "The results list shows the same name on other extensions that are still free, and marks premium names separately. If the exact match matters, you can transfer it in once you own it, or start a broader shortlist with our bulk domain search.",
  },
  {
    question: "Does my domain name affect SEO?",
    answer:
      "The extension itself is not a ranking factor. A short, memorable, brandable name earns more clicks, links and direct traffic, and those do influence rankings. Keep it easy to spell, skip hyphens and numbers, and secure the matching social handles.",
  },
  {
    question: "What happens when my domain expires?",
    answer:
      "We email reminders before expiry and keep auto-renew available in the panel. After expiry there is a redemption window where the name can still be restored, but leaving auto-renew on is the safest way to keep your site and mailboxes online.",
  },
];

export default async function DomainNameSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const [sections, settings, params] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
    searchParams,
  ]);

  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const initialQuery = (rawQuery ?? "").slice(0, 80);

  const schema = buildDomainSchema({
    name: "Domain Name Search",
    description: DESCRIPTION,
    path: PATH,
    breadcrumb: "Domain name search",
    faqs: FAQS,
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
          eyebrow="Registration & lookup"
          title="Domain name search"
          titleAccent="that finds the perfect name"
          description="Check availability across 300+ extensions in one search. Free WHOIS privacy, free DNS and renewal pricing published before you buy."
          pricingHeading="Domain prices with the renewal in plain sight"
          pricingCopy="Filter by what you are building. Every row shows the first-year promo, the standard renewal and the transfer-in price, so you can plan the real cost of your brand."
          faqHeading="Everything people ask before buying"
          faqs={FAQS}
          stats={[
            { value: "2.7M+", label: "Domains managed" },
            { value: "300+", label: "Extensions" },
            { value: "60s", label: "Average setup" },
          ]}
          crossLink={{
            href: routes.bulkDomainSearch,
            label: "Try bulk domain search",
            helper:
              "Check it now, lock it for a year, and add hosting or email whenever you are ready. Need a whole shortlist? Run 50 names at once.",
          }}
        />
      </div>

      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
