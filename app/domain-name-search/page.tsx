import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  Globe2,
  Headphones,
  Layers,
  Mail,
  RefreshCw,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

import { DomainFaqList, type DomainFaq } from "@/components/domains/domain-faq";
import { DomainPriceTable } from "@/components/domains/domain-price-table";
import { DomainSearchPanel } from "@/components/domains/domain-search-panel";
import { DomainVideoSection } from "@/components/domains/domain-video-section";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { getHomeSections, getSiteSettings } from "@/lib/orbit/content";
import { buildMetadata } from "@/lib/metadata";
import { TLD_PRICES, formatPrice } from "@/lib/domains/tlds";

const PATH = routes.domainSearch;

export const metadata: Metadata = buildMetadata({
  title: "Domain Name Search — Check Availability & Register from $1.29",
  description:
    "Search any domain name and check availability across .com, .io, .ai, .store and more. Bulk search up to 50 names, free WHOIS privacy, free DNS, and transparent renewal pricing.",
  path: PATH,
  image: "/images/domains/hero.jpg",
});

const HERO_CHIPS = [".com", ".net", ".org", ".io", ".dev", ".store"];

const TRUST = [
  {
    title: "Free WHOIS privacy",
    subtitle: "Your details stay private",
    icon: ShieldCheck,
  },
  {
    title: "Free DNS management",
    subtitle: "Unlimited records",
    icon: ServerCog,
  },
  {
    title: "Instant activation",
    subtitle: "Live in about 60 seconds",
    icon: Clock,
  },
  {
    title: "24/7 human support",
    subtitle: "Real people, any time zone",
    icon: Headphones,
  },
];

const INCLUDED = [
  {
    title: "Branded email on your name",
    description:
      "Add hello@yourbrand.com mailboxes with SPF, DKIM and DMARC configured for you.",
    icon: Mail,
  },
  {
    title: "Free SSL when you host with us",
    description:
      "Point the domain at HostingBeyond and HTTPS is issued and renewed automatically.",
    icon: BadgeCheck,
  },
  {
    title: "One panel for everything",
    description:
      "Domains, DNS, mail, hosting and Beyond AI sites live in the same dashboard.",
    icon: Layers,
  },
  {
    title: "Honest renewal pricing",
    description:
      "We publish first-year and renewal rates side by side — no surprise invoices later.",
    icon: Wallet,
  },
  {
    title: "Auto-renew and registry lock",
    description:
      "Protect the name you built your brand on against expiry and unauthorised moves.",
    icon: RefreshCw,
  },
  {
    title: "300+ extensions",
    description:
      "From classic .com to niche .studio, .agency and AI-ready .ai — all in one search.",
    icon: Globe2,
  },
];

const FAQS: DomainFaq[] = [
  {
    question: "How does the domain name search work?",
    answer:
      "Type any idea — with or without an extension — and HostingBeyond checks availability across ten popular extensions at once. Each result shows the first-year price, the renewal price and whether the name is free, premium or already registered, so you can decide in a single screen.",
  },
  {
    question: "Can I check many domain names at the same time?",
    answer:
      "Yes. Switch to Bulk search and paste up to 50 names, one per line. It is built for agencies and teams that need to clear a whole brand shortlist before a launch, and the results table shows availability and pricing for every line.",
  },
  {
    question: "What is the cheapest domain extension?",
    answer: `Right now .xyz starts at ${formatPrice(1.29)} for the first year, with .online and .site from ${formatPrice(1.49)} and .store from ${formatPrice(1.99)}. Classic .com registrations start at ${formatPrice(7.99)}. Renewal prices are always shown next to the promo price in the pricing table.`,
  },
  {
    question: "Is WHOIS privacy really free?",
    answer:
      "Yes, for every eligible extension. WHOIS privacy replaces your name, address, email and phone number in the public registry record at no extra cost, which reduces spam and protects your personal data.",
  },
  {
    question: "Do I need hosting to register a domain?",
    answer:
      "No. You can register and park a name, then add hosting, business email or a Beyond AI website whenever you are ready. Everything stays in one HostingBeyond account, so there is nothing to migrate later.",
  },
  {
    question: "Can I transfer a domain I already own?",
    answer:
      "You can. Unlock the domain at your current registrar, request the EPP/auth code, then start the transfer here. Transfers include one extra year of registration and your site and email keep running during the move when DNS is copied first.",
  },
  {
    question: "Does my domain name affect SEO?",
    answer:
      "The extension itself is not a ranking factor, but a short, memorable, brandable name earns more clicks, links and direct traffic — and those do influence rankings. Keep it easy to spell, avoid hyphens and numbers, and secure the matching social handles.",
  },
  {
    question: "What happens when my domain expires?",
    answer:
      "We email you before expiry and keep auto-renew available in the panel. After expiry there is a redemption window where you can restore the name, but the safest path is to leave auto-renew on so your site and mailboxes never stop.",
  },
];

function buildSchema() {
  const url = new URL(PATH, siteConfig.url).toString();
  const cheapest = [...TLD_PRICES].sort((a, b) => a.register - b.register)[0];

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Domain Name Search",
      url,
      description:
        "Search domain name availability across 300+ extensions, compare first-year and renewal pricing, and register with free WHOIS privacy.",
      isPartOf: {
        "@type": "WebSite",
        name: siteConfig.name,
        url: siteConfig.url,
        potentialAction: {
          "@type": "SearchAction",
          target: `${url}?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
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
          name: "Domain Name Search",
          item: url,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Domain name registration",
      brand: { "@type": "Brand", name: siteConfig.name },
      description:
        "Register a domain name with free WHOIS privacy, free DNS management and transparent renewal pricing.",
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "USD",
        lowPrice: cheapest?.register ?? 1.29,
        highPrice: 69.99,
        offerCount: TLD_PRICES.length,
        availability: "https://schema.org/InStock",
        url,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ];
}

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

  return (
    <div className="hb-band-cream min-h-dvh overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSchema()) }}
      />

      <div className="hb-hero-hostinger relative">
        <SiteHeader
          navigation={sections.navigation}
          loginLabel={settings.loginLabel}
          loginHref={settings.loginHref}
          getStartedLabel={settings.getStartedLabel}
          getStartedHref={settings.getStartedHref}
          logoPath={settings.logoPath}
        />

        <section id="search" className="relative pt-8 pb-14 sm:pt-12 sm:pb-16">
          <Image
            src="/images/domains/hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            aria-hidden
            className="pointer-events-none object-cover opacity-45 mix-blend-screen"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgba(47,28,106,0.92)_0%,rgba(80,37,209,0.55)_48%,rgba(37,99,235,0.25)_100%)]"
          />

          <div className="hb-shell relative z-10">
            <nav aria-label="Breadcrumb" className="mb-5">
              <ol className="flex items-center gap-2 text-[12px] font-semibold text-white/75">
                <li>
                  <Link href={routes.home} className="hover:text-white">
                    Home
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li className="text-white">Domain name search</li>
              </ol>
            </nav>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)] lg:items-center lg:gap-10">
              <div className="max-w-xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/15 px-3.5 py-1.5 text-[11.5px] font-bold tracking-wide text-white uppercase backdrop-blur-xl">
                  <Sparkles className="size-3.5" />
                  Registration & lookup
                </p>

                <h1 className="font-heading mt-4 text-[clamp(2rem,4.4vw,3.5rem)] leading-[1.05] font-extrabold tracking-[-0.045em] text-white">
                  Domain name search
                  <span className="mt-1 block text-[#9ad4ff]">
                    that finds the perfect name
                  </span>
                </h1>

                <p className="mt-4 max-w-lg text-[15px] leading-relaxed font-medium text-white/90 sm:text-[16.5px]">
                  Check availability across 300+ extensions in one search, or
                  clear a whole shortlist with bulk lookup. Free WHOIS privacy,
                  free DNS and honest renewal pricing on every domain.
                </p>

                <ul className="mt-5 flex flex-wrap items-center gap-1.5">
                  {HERO_CHIPS.map((tld) => {
                    const price = TLD_PRICES.find((item) => item.tld === tld);
                    return (
                      <li
                        key={tld}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/12 px-3 py-1.5 text-[12px] font-bold text-white backdrop-blur-md"
                      >
                        {tld}
                        <span className="text-white/75">
                          {price ? formatPrice(price.register) : ""}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <dl className="mt-6 grid max-w-md grid-cols-3 gap-3">
                  {[
                    { value: "2.7M+", label: "Domains managed" },
                    { value: "300+", label: "Extensions" },
                    { value: "60s", label: "Average setup" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <dt className="text-[11px] font-semibold text-white/70">
                        {stat.label}
                      </dt>
                      <dd className="font-heading text-[20px] font-extrabold text-white sm:text-[24px]">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <DomainSearchPanel initialQuery={initialQuery} />
            </div>
          </div>
        </section>
      </div>

      <section className="hb-band-cream border-b border-white/60 py-8 sm:py-10">
        <div className="hb-shell">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="flex items-start gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#673de6] shadow-[0_10px_24px_-16px_rgba(47,28,106,0.6)]">
                    <Icon className="size-5" strokeWidth={1.9} />
                  </span>
                  <span>
                    <span className="block text-[13.5px] font-extrabold tracking-tight text-[#2f1c6a]">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] text-slate-600">
                      {item.subtitle}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section id="pricing" className="hb-home-section hb-band-cream">
        <div className="hb-shell relative z-10">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold tracking-[0.28em] text-slate-500 uppercase">
              Transparent pricing
            </p>
            <h2 className="font-heading mt-3 text-[clamp(1.7rem,3.4vw,2.9rem)] leading-[1.1] font-extrabold tracking-[-0.045em] text-[#2f1c6a]">
              Domain prices with the renewal in plain sight
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600 sm:text-[16.5px]">
              Filter by what you are building. Every row shows the first-year
              promo, the standard renewal and the transfer-in price, so you can
              plan the real cost of your brand.
            </p>
          </div>

          <div className="mt-8">
            <DomainPriceTable />
          </div>
        </div>
      </section>

      <DomainVideoSection />

      <section className="hb-home-section hb-band-cream">
        <div className="hb-shell relative z-10">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-12">
            <div>
              <p className="text-[11px] font-bold tracking-[0.28em] text-slate-500 uppercase">
                Included with every domain
              </p>
              <h2 className="font-heading mt-3 text-[clamp(1.7rem,3.4vw,2.9rem)] leading-[1.1] font-extrabold tracking-[-0.045em] text-[#2f1c6a]">
                A name is the start — this is the rest
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-[16.5px]">
                Other registrars charge extra for privacy, DNS and SSL. We
                bundle them, then keep your site, mailboxes and AI pages on the
                same account.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {INCLUDED.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article
                      key={item.title}
                      className="rounded-[22px] border border-white/70 bg-white p-4 shadow-[0_16px_40px_-28px_rgba(47,28,106,0.4)]"
                    >
                      <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-[#f3eeff] text-[#673de6]">
                        <Icon className="size-5" strokeWidth={1.9} />
                      </span>
                      <h3 className="mt-3 text-[14.5px] font-extrabold tracking-tight text-[#2f1c6a]">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">
                        {item.description}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-white/70 shadow-[0_28px_70px_-34px_rgba(47,28,106,0.5)] lg:aspect-[3/4]">
              <Image
                src="/images/domains/brand-kit.jpg"
                alt="Website, business email and security included with a HostingBeyond domain"
                fill
                sizes="(max-width: 1024px) 100vw, 38vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="transfer" className="hb-home-section hb-band-purple">
        <div className="hb-shell relative z-10">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] border border-white/45 shadow-[0_30px_70px_-34px_rgba(15,10,40,0.7)]">
              <Image
                src="/images/domains/transfer.jpg"
                alt="Domain transfer moving DNS records between registrars"
                fill
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover"
              />
            </div>

            <div>
              <p className="text-[11px] font-bold tracking-[0.28em] text-white uppercase">
                Transfer in
              </p>
              <h2 className="font-heading mt-3 text-[clamp(1.7rem,3.4vw,2.9rem)] leading-[1.1] font-extrabold tracking-[-0.045em] text-white">
                Already own the name? Bring it over
              </h2>
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/90 sm:text-[16.5px]">
                Transfers add a full extra year of registration and keep your
                site and email online while DNS is copied first.
              </p>

              <ol className="mt-6 space-y-3">
                {[
                  "Unlock the domain at your current registrar and request the EPP code.",
                  "Start the transfer here and paste the code — we copy your DNS records.",
                  "Approve the email from the registry; the name lands in your panel.",
                ].map((step, index) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-[12.5px] font-extrabold text-[#2f1c6a]">
                      {index + 1}
                    </span>
                    <span className="text-[14px] leading-relaxed text-white">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>

              <Link
                href={routes.getStarted}
                className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[14px] font-bold text-[#2f1c6a] shadow-[0_14px_30px_-16px_rgba(0,0,0,0.6)]"
              >
                Start a transfer
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="hb-home-section hb-band-cream">
        <div className="hb-shell relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-bold tracking-[0.28em] text-slate-500 uppercase">
              Domain search FAQs
            </p>
            <h2 className="font-heading mt-3 text-[clamp(1.7rem,3.4vw,2.9rem)] leading-[1.1] font-extrabold tracking-[-0.045em] text-[#2f1c6a]">
              Everything people ask before buying
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600 sm:text-[16.5px]">
              Straight answers on pricing, privacy, transfers and renewals.
            </p>
          </div>

          <div className="mt-8">
            <DomainFaqList items={FAQS} />
          </div>
        </div>
      </section>

      <section className="hb-band-purple py-14 sm:py-16">
        <div className="hb-shell">
          <div className="rounded-[28px] border border-white/45 bg-white/12 p-6 text-center backdrop-blur-xl sm:p-10">
            <h2 className="font-heading text-[clamp(1.6rem,3.2vw,2.6rem)] leading-[1.12] font-extrabold tracking-[-0.045em] text-white">
              Your name is probably still free
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-white/90">
              Check it now, lock it for a year, and add hosting or email
              whenever you are ready.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="#search"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-[14px] font-bold text-[#2f1c6a] shadow-[0_14px_30px_-16px_rgba(0,0,0,0.6)] sm:w-auto"
              >
                Search a domain
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={routes.businessEmail}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/55 bg-white/10 px-6 text-[14px] font-bold text-white sm:w-auto"
              >
                Add business email
              </Link>
            </div>
          </div>
        </div>
      </section>

      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
