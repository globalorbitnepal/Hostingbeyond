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

import { DomainFaqList } from "@/components/domains/domain-faq";
import { DomainPriceTable } from "@/components/domains/domain-price-table";
import {
  DomainSearchPanel,
  type SearchMode,
} from "@/components/domains/domain-search-panel";
import { DomainVideoSection } from "@/components/domains/domain-video-section";
import { routes } from "@/config/routes";
import {
  parseChips,
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
  const trust = shared.trust.filter((item) => item.visible !== false);
  const included = shared.included.filter((item) => item.visible !== false);
  const scenes = shared.scenes
    .filter((item) => item.visible !== false)
    .map((item) => ({
      id: item.id,
      image: item.image,
      label: item.label,
      caption: item.caption,
      prompt: item.prompt,
      chips: parseChips(item.chips),
    }));
  const comTransfer = priceByTld(content, ".com")?.transfer;

  return (
    <>
      <section className="relative overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-16">
        <Image
          src={shared.heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          aria-hidden
          className="pointer-events-none object-cover object-[62%_center] opacity-75 mix-blend-screen"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgba(35,18,84,0.94)_0%,rgba(58,29,150,0.62)_46%,rgba(37,99,235,0.16)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 left-[-8%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(147,197,253,0.4),transparent_66%)] blur-3xl"
        />

        <div className="hb-shell relative z-10">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-white/75">
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

          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-10">
            <div className="max-w-xl lg:sticky lg:top-24">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/15 px-3.5 py-1.5 text-[11.5px] font-bold tracking-wide text-white uppercase backdrop-blur-xl">
                <Sparkles className="size-3.5" />
                {page.eyebrow}
              </p>

              <h1 className="font-heading mt-4 text-[clamp(2rem,4.4vw,3.5rem)] leading-[1.05] font-extrabold tracking-[-0.045em] text-white">
                {page.title}
                <span className="mt-1 block text-[#9ad4ff]">
                  {page.titleAccent}
                </span>
              </h1>

              <p className="mt-4 max-w-lg text-[15px] leading-relaxed font-medium text-white/90 sm:text-[16.5px]">
                {page.description}
              </p>

              {chips.length > 0 ? (
                <ul className="mt-5 flex flex-wrap items-center gap-1.5">
                  {chips.map((tld) => {
                    const price = priceByTld(content, tld);
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
              ) : null}

              {stats.length > 0 ? (
                <dl className="mt-6 grid max-w-md grid-cols-3 gap-3">
                  {stats.map((stat) => (
                    <div key={stat.id}>
                      <dt className="text-[11px] font-semibold text-white/70">
                        {stat.label}
                      </dt>
                      <dd className="font-heading text-[20px] font-extrabold text-white sm:text-[24px]">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>

            <DomainSearchPanel mode={mode} initialQuery={initialQuery} />
          </div>
        </div>
      </section>

      {trust.length > 0 ? (
        <section className="hb-band-cream border-b border-white/60 py-8 sm:py-10">
          <div className="hb-shell">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {trust.map((item) => {
                const Icon = ICONS[item.icon] ?? ShieldCheck;
                return (
                  <li key={item.id} className="flex items-start gap-3">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#673de6] shadow-[0_10px_24px_-16px_rgba(47,28,106,0.6)]">
                      <Icon className="size-5" strokeWidth={1.9} />
                    </span>
                    <span>
                      <span className="block text-[13.5px] font-extrabold tracking-tight text-[#2f1c6a]">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-[12.5px] text-slate-600">
                        {item.description}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ) : null}

      <section id="pricing" className="hb-home-section hb-band-cream">
        <div className="hb-shell relative z-10">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold tracking-[0.28em] text-slate-500 uppercase">
              Transparent pricing
            </p>
            <h2 className="font-heading mt-3 text-[clamp(1.7rem,3.4vw,2.9rem)] leading-[1.1] font-extrabold tracking-[-0.045em] text-[#2f1c6a]">
              {page.pricingHeading}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600 sm:text-[16.5px]">
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

      {scenes.length > 0 ? (
        <DomainVideoSection
          eyebrow={shared.videoEyebrow}
          heading={shared.videoHeading}
          description={shared.videoDescription}
          ctaLabel={shared.videoCtaLabel}
          scenes={scenes}
        />
      ) : null}

      <section className="hb-home-section hb-band-cream">
        <div className="hb-shell relative z-10">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-12">
            <div>
              <p className="text-[11px] font-bold tracking-[0.28em] text-slate-500 uppercase">
                {shared.includedEyebrow}
              </p>
              <h2 className="font-heading mt-3 text-[clamp(1.7rem,3.4vw,2.9rem)] leading-[1.1] font-extrabold tracking-[-0.045em] text-[#2f1c6a]">
                {shared.includedHeading}
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-[16.5px]">
                {shared.includedDescription}
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {included.map((item) => {
                  const Icon = ICONS[item.icon] ?? Layers;
                  return (
                    <article
                      key={item.id}
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
                src={shared.brandImage}
                alt={shared.brandImageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 38vw"
                loading="lazy"
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
                src={shared.transferImage}
                alt={shared.transferImageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 48vw"
                loading="lazy"
                className="object-cover"
              />
            </div>

            <div>
              <p className="text-[11px] font-bold tracking-[0.28em] text-white uppercase">
                {shared.transferEyebrow}
              </p>
              <h2 className="font-heading mt-3 text-[clamp(1.7rem,3.4vw,2.9rem)] leading-[1.1] font-extrabold tracking-[-0.045em] text-white">
                {shared.transferHeading}
              </h2>
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/90 sm:text-[16.5px]">
                {shared.transferDescription}
                {comTransfer
                  ? ` A .com transfer is ${formatPrice(comTransfer)}.`
                  : ""}
              </p>

              <ol className="mt-6 space-y-3">
                {parseLines(shared.transferSteps).map((step, index) => (
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
                href={`${routes.getStarted}?transfer=1`}
                className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[14px] font-bold text-[#2f1c6a] shadow-[0_14px_30px_-16px_rgba(0,0,0,0.6)]"
              >
                {shared.transferCtaLabel}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {faqs.length > 0 ? (
        <section id="faq" className="hb-home-section hb-band-cream">
          <div className="hb-shell relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[11px] font-bold tracking-[0.28em] text-slate-500 uppercase">
                {page.faqEyebrow}
              </p>
              <h2 className="font-heading mt-3 text-[clamp(1.7rem,3.4vw,2.9rem)] leading-[1.1] font-extrabold tracking-[-0.045em] text-[#2f1c6a]">
                {page.faqHeading}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600 sm:text-[16.5px]">
                {page.faqDescription}
              </p>
            </div>

            <div className="mt-8">
              <DomainFaqList
                items={faqs.map((item) => ({
                  question: item.question,
                  answer: item.answer,
                }))}
              />
            </div>
          </div>
        </section>
      ) : null}

      <section className="hb-band-purple py-14 sm:py-16">
        <div className="hb-shell">
          <div className="rounded-[28px] border border-white/45 bg-white/12 p-6 text-center backdrop-blur-xl sm:p-10">
            <h2 className="font-heading text-[clamp(1.6rem,3.2vw,2.6rem)] leading-[1.12] font-extrabold tracking-[-0.045em] text-white">
              {shared.ctaHeading}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-white/90">
              {page.crossLinkHelper}
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={crossLinkHref}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-[14px] font-bold text-[#2f1c6a] shadow-[0_14px_30px_-16px_rgba(0,0,0,0.6)] sm:w-auto"
              >
                {page.crossLinkLabel}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={routes.businessEmail}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/55 bg-white/10 px-6 text-[14px] font-bold text-white sm:w-auto"
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
