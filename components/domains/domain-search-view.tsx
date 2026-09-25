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

import { DomainBentoShowcaseSection } from "@/components/domains/domain-bento-showcase-section";
import { DomainFaqSection } from "@/components/domains/domain-faq-section";
import { DomainGuidePillarsSection } from "@/components/domains/domain-guide-pillars-section";
import { DomainPopularTldsSection } from "@/components/domains/domain-popular-tlds-section";
import { DomainPriceTable } from "@/components/domains/domain-price-table";
import {
  DomainSearchPanel,
  type SearchMode,
} from "@/components/domains/domain-search-panel";
import { routes } from "@/config/routes";
import {
  parseLines,
  priceByTld,
  visiblePricing,
  type DomainContent,
  type DomainPageCopy,
} from "@/lib/domains/content";
import { formatPrice } from "@/lib/domains/tlds";

const ICONS: Record<string, typeof ShieldCheck> = {
  shield: ShieldCheck,
  server: ServerCog,
  clock: Clock,
  headphones: Headphones,
  mail: Mail,
  badge: BadgeCheck,
  layers: Layers,
  wallet: Wallet,
  refresh: RefreshCw,
  globe: Globe2,
};

export function DomainSearchView({
  mode,
  initialQuery = "",
  content,
  page,
  crossLinkHref,
}: {
  mode: SearchMode;
  initialQuery?: string;
  content: DomainContent;
  page: DomainPageCopy;
  crossLinkHref: string;
}) {
  const { shared } = content;
  const prices = visiblePricing(content);
  const chips = shared.heroChips
    .split(",")
    .map((chip) => chip.trim())
    .filter(Boolean);
  const stats = page.stats.filter((item) => item.visible !== false);
  const faqs = page.faqs.filter((item) => item.visible !== false);
  const included = shared.included.filter((item) => item.visible !== false);
  const showcase = shared.showcaseCards.filter(
    (item) => item.visible !== false,
  );
  const pillars = shared.guidePillars.filter((item) => item.visible !== false);
  const popular = shared.popularPicks.filter((item) => item.visible !== false);
  const comTransfer = priceByTld(content, ".com")?.transfer;

  return (
    <>
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-10 sm:pb-14">
        <Image
          src={shared.heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          aria-hidden
          className="pointer-events-none object-cover object-[62%_center] opacity-70 mix-blend-screen"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(35,18,84,0.92)_0%,rgba(58,29,150,0.78)_42%,rgba(37,99,235,0.35)_100%)]"
        />

        <div className="hb-shell relative z-10">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center justify-center gap-2 text-[12px] font-semibold text-white/75 lg:justify-start">
              <li>
                <Link href={routes.home} className="hover:text-white">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href={routes.domainSearch} className="hover:text-white">
                  Domains
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-white">{page.title}</li>
            </ol>
          </nav>

          <div className="mx-auto max-w-4xl text-center lg:max-w-[52rem]">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/12 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.18em] text-white uppercase backdrop-blur-md">
              <Sparkles className="size-3.5" />
              {page.eyebrow}
            </p>

            <h1 className="font-heading mt-4 text-[clamp(2rem,4.8vw,3.25rem)] leading-[1.06] font-extrabold tracking-[-0.045em] text-white">
              {page.title}
              <span className="mt-2 block text-[clamp(1.35rem,3vw,2rem)] font-bold text-[#b8e4ff]">
                {page.titleAccent}
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed font-medium text-white/92 sm:text-[17px]">
              {page.description}
            </p>

            <div className="mt-8 text-left">
              <DomainSearchPanel
                mode={mode}
                initialQuery={initialQuery}
                layout="hero"
              />
            </div>

            {stats.length > 0 ? (
              <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
                {stats.map((stat) => (
                  <div key={stat.id} className="text-center">
                    <dd className="font-heading text-[22px] font-extrabold text-white sm:text-[26px]">
                      {stat.value}
                    </dd>
                    <dt className="mt-1 text-[11px] font-semibold text-white/70">
                      {stat.label}
                    </dt>
                  </div>
                ))}
              </dl>
            ) : null}

            {chips.length > 0 ? (
              <ul className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
                {chips.map((tld) => {
                  const price = priceByTld(content, tld);
                  return (
                    <li
                      key={tld}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-white/10 px-3 py-1.5 text-[12px] font-bold text-white backdrop-blur-md"
                    >
                      {tld}
                      <span className="text-white/75">
                        {price ? formatPrice(price.register) : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </div>
      </section>

      <DomainBentoShowcaseSection
        eyebrow={shared.whyBuyEyebrow}
        heading={shared.whyBuyHeading}
        description={shared.whyBuyDescription}
        cards={showcase}
      />

      <DomainPopularTldsSection
        heading={shared.popularHeading}
        linkLabel={shared.popularLinkLabel}
        linkHref={shared.popularLinkHref}
        picks={popular}
        prices={prices.map((row) => ({
          tld: row.tld,
          register: row.register,
          renew: row.renew,
        }))}
      />

      <section className="hb-home-section hb-band-cream">
        <div className="hb-shell relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-bold tracking-[0.28em] text-slate-500 uppercase">
              {shared.includedEyebrow}
            </p>
            <h2 className="font-heading mt-3 text-[clamp(1.55rem,3vw,2.35rem)] leading-[1.12] font-extrabold tracking-[-0.04em] text-[#2f1c6a]">
              {shared.includedHeading}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600 sm:text-[16px]">
              {shared.includedDescription}
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {included.map((item) => {
              const Icon = ICONS[item.icon] ?? Layers;
              return (
                <article
                  key={item.id}
                  className="rounded-[20px] border border-white/80 bg-white p-5 shadow-[0_16px_40px_-30px_rgba(47,28,106,0.35)]"
                >
                  <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-[#f3eeff] text-[#673de6]">
                    <Icon className="size-5" strokeWidth={1.9} />
                  </span>
                  <h3 className="mt-3 text-[14.5px] font-extrabold tracking-tight text-[#2f1c6a]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="pricing" className="hb-home-section bg-white py-16 sm:py-20">
        <div className="hb-shell relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-bold tracking-[0.28em] text-slate-500 uppercase">
              Transparent pricing
            </p>
            <h2 className="font-heading mt-3 text-[clamp(1.55rem,3vw,2.35rem)] leading-[1.12] font-extrabold tracking-[-0.04em] text-[#2f1c6a]">
              {page.pricingHeading}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600 sm:text-[16px]">
              {page.pricingCopy}
            </p>
          </div>

          <div className="mt-8">
            <DomainPriceTable
              prices={prices}
              footnote={shared.pricingFootnote}
            />
          </div>
        </div>
      </section>

      <DomainGuidePillarsSection heading={page.faqHeading} pillars={pillars} />

      {faqs.length > 0 ? (
        <DomainFaqSection
          eyebrow={page.faqAccordionEyebrow}
          heading={page.faqAccordionHeading}
          description={page.faqAccordionDescription}
          items={faqs.map((item) => ({
            question: item.question,
            answer: item.answer,
          }))}
        />
      ) : null}

      <section id="transfer" className="hb-band-purple py-12 sm:py-14">
        <div className="hb-shell relative z-10">
          <div className="mx-auto max-w-3xl rounded-[24px] border border-white/35 bg-white/8 p-6 backdrop-blur-md sm:p-8">
            <p className="text-[11px] font-bold tracking-[0.28em] text-white uppercase">
              {shared.transferEyebrow}
            </p>
            <h2 className="font-heading mt-3 text-[clamp(1.45rem,2.8vw,2.1rem)] leading-[1.12] font-extrabold tracking-[-0.04em] text-white">
              {shared.transferHeading}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/90">
              {shared.transferDescription}
              {comTransfer
                ? ` A .com transfer is ${formatPrice(comTransfer)}.`
                : ""}
            </p>

            <ol className="mt-6 space-y-3">
              {parseLines(shared.transferSteps).map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-[12px] font-extrabold text-[#2f1c6a]">
                    {index + 1}
                  </span>
                  <span className="text-[14px] leading-relaxed text-white/95">
                    {step}
                  </span>
                </li>
              ))}
            </ol>

            <Link
              href={routes.domainTransfer}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[13px] font-bold text-[#2f1c6a] shadow-lg"
            >
              {shared.transferCtaLabel}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="hb-band-purple py-12 sm:py-14">
        <div className="hb-shell">
          <div className="rounded-[24px] border border-white/40 bg-white/10 p-6 text-center backdrop-blur-md sm:p-8">
            <h2 className="font-heading text-[clamp(1.45rem,2.8vw,2.25rem)] leading-[1.12] font-extrabold tracking-[-0.04em] text-white">
              {shared.ctaHeading}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-white/90">
              {page.crossLinkHelper}
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={crossLinkHref}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-[13px] font-bold text-[#2f1c6a] shadow-lg sm:w-auto"
              >
                {page.crossLinkLabel}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={routes.businessEmail}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/50 bg-white/10 px-6 text-[13px] font-bold text-white sm:w-auto"
              >
                {shared.ctaEmailLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
