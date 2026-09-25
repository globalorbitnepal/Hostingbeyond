"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  Lock,
  Mail,
  Minus,
  Plus,
  Search,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { BusinessEmailHeroVisual } from "@/components/business-email/business-email-hero-visual";
import { MailWorkspace } from "@/components/business-email/mail-workspace";
import { routes } from "@/config/routes";
import type {
  CmsBusinessEmailPageContent,
  CmsBusinessEmailSupportTile,
} from "@/lib/orbit/business-email-page-content";
import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";
import { cn } from "@/lib/utils";

const SUPPORT_ICONS = {
  sparkles: Sparkles,
  zap: Zap,
  clock: Clock,
  lock: Lock,
} as const;

export function BusinessEmailPageView({
  content,
}: {
  content: CmsBusinessEmailPageContent;
}) {
  const reduce = useReducedMotion();
  const impressionTabs = content.impressionTabs.filter(
    (t) => t.visible !== false,
  );
  const plans = content.plans.filter((p) => p.visible !== false);
  const included = content.included;
  const faqs = content.faqs.filter((f) => f.visible !== false);
  const reviews = content.reviews.filter((r) => r.visible !== false);
  const aiFeatures = content.aiFeatures.filter((f) => f.visible !== false);
  const integrations = content.integrations.filter((i) => i.visible !== false);
  const supportTiles = content.supportTiles.filter((t) => t.visible !== false);

  const [tab, setTab] = useState(impressionTabs[0]?.id ?? "setup");
  const [openFaq, setOpenFaq] = useState(0);
  const [term, setTerm] = useState("48");
  const active =
    impressionTabs.find((item) => item.id === tab) ?? impressionTabs[0];

  return (
    <>
      <section className="hb-band-purple relative overflow-hidden text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(103,61,230,0.28),transparent_42%),radial-gradient(ellipse_at_90%_40%,rgba(37,99,235,0.18),transparent_40%)]"
        />
        <div className="hb-shell relative grid items-center gap-10 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8 lg:py-16">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[13px] font-bold tracking-wide text-[#c4b5fd]">
              {content.heroEyebrow}
            </p>
            <h1 className="font-heading mt-3 text-[clamp(2.4rem,5.4vw,4.4rem)] leading-[1.02] font-extrabold tracking-[-0.05em]">
              {content.heroTitle}
            </h1>
            <ul className="mt-6 space-y-2 text-[15px] text-white/80">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-emerald-400" />
                {content.heroBullet1}
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-emerald-400" />
                {content.heroBullet2}
              </li>
            </ul>
            <Link
              href={content.heroCtaHref}
              className="mt-7 inline-flex h-12 items-center rounded-md bg-[#673de6] px-6 text-[15px] font-bold text-white shadow-[0_12px_30px_rgba(103,61,230,0.45)]"
            >
              {content.heroCtaLabel}
            </Link>
            <p className="mt-4 flex items-center gap-2 text-[13px] text-white/55">
              <Shield className="size-4" />
              {content.heroGuarantee}
            </p>
          </motion.div>
          <motion.div
            initial={reduce ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
            className="relative"
          >
            <MailWorkspace />
          </motion.div>
        </div>
      </section>

      {active && impressionTabs.length > 0 ? (
        <section
          id="impression"
          className="relative overflow-x-clip overflow-y-visible bg-white py-16 sm:py-20"
        >
          <div className="hb-shell">
            <h2 className="font-heading text-center text-[clamp(2rem,4.5vw,3.4rem)] font-extrabold tracking-[-0.045em] text-[#1a1a1a]">
              {content.impressionHeading}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-[16px] leading-relaxed text-[#5c5c5c]">
              {content.impressionDescription}
            </p>

            <div className="mt-10 grid items-center gap-8 lg:grid-cols-[minmax(0,480px)_1fr] lg:gap-6 xl:gap-10">
              <div className="max-w-[520px] lg:pr-2">
                <div className="flex flex-wrap gap-2">
                  {impressionTabs.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTab(item.id)}
                      className={cn(
                        "rounded-full px-4 py-2 text-[13px] font-bold transition-colors",
                        tab === item.id
                          ? "bg-[#673de6] text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <h3 className="mt-7 text-[clamp(1.5rem,3vw,2.15rem)] font-extrabold text-[#1a1a1a]">
                      {active.title}
                    </h3>
                    <ul className="mt-5 space-y-3">
                      {active.points.map((line) => (
                        <li
                          key={line}
                          className="flex items-start gap-2 text-[15px] leading-relaxed text-[#2f2f2f]"
                        >
                          <Check
                            className="mt-0.5 size-4 shrink-0 text-[#00b090]"
                            strokeWidth={3}
                          />
                          {line}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={content.impressionCtaHref}
                      className="mt-7 inline-flex h-11 items-center rounded-[10px] bg-[#673de6] px-6 text-[14px] font-bold text-white hover:bg-[#5c35d4]"
                    >
                      {content.impressionCtaLabel}
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="relative w-full overflow-visible lg:justify-self-end lg:pl-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.image}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.45 }}
                    className="relative"
                  >
                    <BusinessEmailHeroVisual
                      src={active.image}
                      alt={active.imageAlt}
                      scalePercent={content.impressionVisualScalePercent}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section id="pricing" className="hb-band-purple py-16 sm:py-20">
        <div className="hb-shell">
          <h2 className="font-heading text-center text-[clamp(1.85rem,3.6vw,2.9rem)] font-extrabold tracking-[-0.04em] text-white">
            {content.pricingHeading}
          </h2>
          <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] font-semibold text-white/80">
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-4 text-emerald-400" />
              {content.pricingTrust1}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-4 text-emerald-400" />
              {content.pricingTrust2}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-4 text-emerald-400" />
              {content.pricingTrust3}
            </span>
          </div>
          <div className="mt-6 flex justify-center">
            <label className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[13px] font-semibold text-white backdrop-blur-sm">
              Period
              <select
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                className="bg-transparent font-bold text-white outline-none [&_option]:text-slate-900"
              >
                <option value="48">48 months</option>
                <option value="24">24 months</option>
                <option value="12">12 months</option>
              </select>
            </label>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.article
                key={plan.id}
                initial={reduce ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "relative flex flex-col rounded-[28px] border bg-white p-6",
                  plan.popular
                    ? "border-[#d9d1ff] shadow-[0_24px_60px_-28px_rgba(103,61,230,0.45)] ring-1 ring-[#ece7ff]"
                    : "border-slate-200",
                )}
              >
                <span className="absolute top-5 right-5 rounded-full bg-[#ecfdf3] px-2 py-0.5 text-[11px] font-extrabold text-emerald-700">
                  {plan.off}
                </span>
                {plan.popular ? (
                  <p className="mb-3 text-[11px] font-extrabold tracking-wide text-[#673de6] uppercase">
                    Most popular
                  </p>
                ) : (
                  <p className="mb-3 h-[17px]" />
                )}
                <h3 className="font-heading text-[1.7rem] font-extrabold text-slate-950">
                  {plan.name}
                </h3>
                <p className="mt-1 text-[13px] text-slate-500">
                  Best for: {plan.bestFor}
                </p>
                <p className="mt-5 text-[14px] text-slate-400 line-through">
                  {plan.original}
                </p>
                <p className="flex items-end gap-1">
                  <span className="text-[2.6rem] leading-none font-extrabold text-slate-950">
                    {term === "12"
                      ? plan.renew
                      : term === "24"
                        ? plan.price24
                        : plan.price}
                  </span>
                  <span className="pb-1 text-[14px] font-semibold text-slate-500">
                    /mo
                  </span>
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
                  Price per mailbox. For {term}-month term. Renews at{" "}
                  {plan.renew}
                  /mo for 48-month term.
                </p>
                <p className="mt-4 text-[13.5px] font-semibold text-slate-700">
                  {plan.mailboxes}
                </p>
                <p className="text-[13.5px] text-slate-600">{plan.storage}</p>
                <p className="text-[13px] text-slate-500">{plan.extras}</p>
                <Link
                  href={routes.signup}
                  className={cn(
                    "mt-5 inline-flex h-11 items-center justify-center rounded-md text-[14px] font-bold",
                    plan.popular
                      ? "bg-[#673de6] text-white"
                      : "border border-slate-200 text-slate-900",
                  )}
                >
                  Choose plan
                </Link>
                <p className="mt-5 text-[12px] font-bold tracking-wide text-slate-400 uppercase">
                  Benefits
                </p>
                <ul className="mt-2 space-y-2">
                  {plan.features.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 text-[13.5px] text-slate-600"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-[#673de6]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>

          <h3 className="font-heading mt-14 text-center text-[1.45rem] font-extrabold text-white">
            {content.includedHeading}
          </h3>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {included.map((item) => (
              <p
                key={item}
                className="flex items-start gap-2 rounded-2xl bg-white px-4 py-3 text-[14px] font-medium text-slate-700"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                {item}
              </p>
            ))}
          </div>
          <p className="mt-6 text-center text-[12.5px] text-white/65">
            {content.includedFootnote}
          </p>
        </div>
      </section>

      <section className="hb-band-cream py-16 sm:py-20">
        <div className="hb-shell">
          <p className="text-center text-[12px] font-bold tracking-[0.2em] text-slate-500 uppercase">
            {content.aiBandEyebrow}
          </p>
          <h2 className="font-heading mt-3 text-center text-[clamp(2rem,4vw,3.1rem)] font-extrabold text-[#2f1c6a]">
            {content.aiBandHeading}
          </h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {aiFeatures.map((feat, index) => (
              <AiFeatureCard
                key={feat.id}
                feat={feat}
                index={index}
                reduce={reduce}
              />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href={content.aiBandCtaHref}
              className="inline-flex h-11 items-center rounded-md bg-[#673de6] px-6 text-[14px] font-bold text-white"
            >
              {content.aiBandCtaLabel}
            </Link>
          </div>
        </div>
      </section>

      <section className="hb-band-purple py-16 sm:py-20">
        <div className="hb-shell">
          <h2 className="font-heading mx-auto max-w-3xl text-center text-[clamp(1.8rem,3.4vw,2.7rem)] font-extrabold tracking-[-0.04em] text-white">
            {content.integrationsHeading}
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {integrations.map((card) => (
              <article
                key={card.id}
                className="rounded-[28px] border border-white/10 bg-white p-6 shadow-[0_28px_70px_-36px_rgba(0,0,0,0.45)]"
              >
                <p className="text-[12px] font-bold tracking-wide text-[#673de6] uppercase">
                  {card.eyebrow}
                </p>
                <h3 className="mt-2 text-[1.35rem] font-extrabold text-[#0f172a]">
                  {card.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                  {card.description}
                </p>
                <Link
                  href={card.linkHref}
                  className="mt-5 inline-flex items-center gap-1 text-[14px] font-extrabold text-[#673de6] hover:text-[#5b2fd4]"
                >
                  {card.linkLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hb-band-cream py-16 sm:py-20">
        <div className="hb-shell grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold tracking-[-0.04em] text-slate-950">
              {content.migrateHeading}
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-slate-600">
              {content.migrateDescription}
            </p>
            <Link
              href={content.migrateCtaHref}
              className="mt-6 inline-flex h-11 items-center rounded-md bg-[#673de6] px-5 text-[14px] font-bold text-white"
            >
              {content.migrateCtaLabel}
            </Link>
          </div>
          <div className="overflow-hidden rounded-[28px] shadow-[0_28px_70px_-40px_rgba(47,28,106,0.35)]">
            <Image
              src={content.migrateImage}
              alt={content.migrateImageAlt}
              width={1600}
              height={900}
              className="h-[340px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="hb-band-purple py-16 text-white sm:py-20">
        <div className="hb-shell grid items-center gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[28px]">
            <Image
              src={content.marketingImage}
              alt={content.marketingImageAlt}
              width={1600}
              height={692}
              className="h-[340px] w-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-heading text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold tracking-[-0.04em] text-white">
              {content.marketingHeading}
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-white/85">
              {content.marketingDescription}
            </p>
            <Link
              href={content.marketingCtaHref}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-white px-5 text-[14px] font-bold text-[#2f1c6a]"
            >
              {content.marketingCtaLabel}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="hb-band-cream relative overflow-hidden py-16 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(103,61,230,0.08),transparent_55%)]"
        />
        <div className="hb-shell relative">
          <h2 className="font-heading text-center text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold text-[#2f1c6a]">
            {content.reviewsHeading}
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {reviews.map((item) => (
              <article
                key={item.id}
                className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_20px_50px_-36px_rgba(47,28,106,0.35)]"
              >
                <p className="text-[15px] leading-relaxed text-slate-700">
                  “{item.quote}”
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="relative size-11 overflow-hidden rounded-full ring-2 ring-[#e9e4ff]">
                    <Image
                      src={item.photo}
                      alt=""
                      fill
                      unoptimized={isRuntimeMediaSrc(item.photo)}
                      className="object-cover object-top"
                    />
                  </span>
                  <p className="text-[14px] font-bold text-[#2f1c6a]">
                    {item.name}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hb-band-purple py-16 sm:py-20">
        <div className="hb-shell grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {supportTiles.map((tile) => (
            <SupportTile key={tile.id} tile={tile} />
          ))}
        </div>
      </section>

      <section className="hb-band-cream py-16 sm:py-20">
        <div className="hb-shell mx-auto max-w-3xl">
          <h2 className="font-heading text-center text-[clamp(1.7rem,3vw,2.5rem)] font-extrabold text-slate-950">
            {content.faqHeading}
          </h2>
          <p className="mt-2 text-center text-[15px] text-slate-500">
            {content.faqDescription}
          </p>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "FAQPage",
                    mainEntity: faqs.map((item) => ({
                      "@type": "Question",
                      name: item.question,
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: item.answer,
                      },
                    })),
                  },
                  {
                    "@type": "Product",
                    name: "HostingBeyond Mail",
                    offers: [
                      {
                        "@type": "Offer",
                        name: "Starter",
                        price: "0.37",
                        priceCurrency: "USD",
                      },
                      {
                        "@type": "Offer",
                        name: "Standard",
                        price: "0.97",
                        priceCurrency: "USD",
                      },
                      {
                        "@type": "Offer",
                        name: "Premium",
                        price: "1.97",
                        priceCurrency: "USD",
                      },
                    ],
                  },
                ],
              }),
            }}
          />
          <div className="mt-8 space-y-2">
            {faqs.map((item, index) => {
              const open = openFaq === index;
              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-[16px] bg-white"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-[15px] font-bold text-slate-950"
                    onClick={() => setOpenFaq(open ? -1 : index)}
                  >
                    {item.question}
                    {open ? (
                      <Minus className="size-4 shrink-0" />
                    ) : (
                      <Plus className="size-4 shrink-0" />
                    )}
                  </button>
                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 text-[14px] leading-relaxed text-slate-600">
                          {item.answer}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="hb-band-purple py-16 text-center text-white">
        <div className="hb-shell">
          <h2 className="font-heading text-[clamp(1.8rem,3.4vw,2.7rem)] font-extrabold">
            {content.closingHeading}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[16px] text-white/85">
            {content.closingDescription}
          </p>
          <Link
            href={content.closingCtaHref}
            className="mt-7 inline-flex h-12 items-center rounded-md bg-white px-6 text-[15px] font-extrabold text-slate-950"
          >
            {content.closingCtaLabel}
          </Link>
        </div>
      </section>
    </>
  );
}

function AiFeatureCard({
  feat,
  index,
  reduce,
}: {
  feat: CmsBusinessEmailPageContent["aiFeatures"][number];
  index: number;
  reduce: boolean | null;
}) {
  const src =
    feat.image?.trim() ||
    `/images/business-email/frames/ai-card-${index === 0 ? "tone" : index === 1 ? "reply" : "search"}.svg`;

  return (
    <article className="relative min-h-[340px] overflow-hidden rounded-[28px] p-6 text-white shadow-[0_28px_70px_-36px_rgba(47,28,106,0.55)]">
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 33vw"
        unoptimized={isRuntimeMediaSrc(src)}
        className="object-cover"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0f1f]/95 via-[#2f1c6a]/78 to-[#673de6]/35"
      />
      <div className="relative z-10 flex h-full flex-col">
        {index === 0 ? (
          <div className="flex min-h-[160px] flex-wrap content-center gap-2">
            {["Friendly", "Professional", "Concise"].map((tone, i) => (
              <motion.span
                key={tone}
                animate={reduce ? undefined : { y: [0, i === 1 ? -8 : 6, 0] }}
                transition={{ duration: 3 + i, repeat: Infinity }}
                className={cn(
                  "rounded-full px-4 py-2 text-[14px] font-bold",
                  tone === "Professional"
                    ? "bg-white text-[#673de6]"
                    : "bg-black/25 text-white backdrop-blur-sm",
                )}
              >
                {tone === "Professional" ? `✓ ${tone}` : tone}
              </motion.span>
            ))}
          </div>
        ) : null}
        {index === 1 ? (
          <div className="relative min-h-[160px]">
            <div className="space-y-2 opacity-50">
              <p className="h-8 rounded-full bg-white/20" />
              <p className="h-8 rounded-full bg-white/20" />
              <p className="h-8 rounded-full bg-white/20" />
            </div>
            <motion.p
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-4 py-2 text-[14px] font-bold text-slate-900"
              animate={reduce ? undefined : { scale: [1, 1.04, 1] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            >
              ✦ Accept Thursday
            </motion.p>
          </div>
        ) : null}
        {index === 2 ? (
          <div className="flex min-h-[160px] items-center justify-center">
            <motion.div
              className="flex w-full items-center gap-2 rounded-full bg-black/30 px-4 py-3 backdrop-blur-sm"
              animate={reduce ? undefined : { x: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity }}
            >
              <Search className="size-4 text-white" />
              <span className="text-[13px] text-white/90">
                invoice from last week
              </span>
            </motion.div>
          </div>
        ) : null}
        <h3 className="mt-4 text-[1.2rem] font-extrabold text-white">
          {feat.title}
        </h3>
        <p className="mt-2 text-[14px] leading-relaxed text-white/90">
          {feat.description}
        </p>
      </div>
    </article>
  );
}

function SupportTile({ tile }: { tile: CmsBusinessEmailSupportTile }) {
  const Icon = SUPPORT_ICONS[tile.icon] ?? Sparkles;
  const src =
    tile.image?.trim() || "/images/business-email/frames/support-tile.svg";

  return (
    <article className="relative min-h-[240px] overflow-hidden rounded-[24px] border border-white/15 p-6 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.5)]">
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 25vw"
        unoptimized={isRuntimeMediaSrc(src)}
        className="object-cover"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0f1f]/95 via-[#2f1c6a]/80 to-[#673de6]/45"
      />
      <div className="relative z-10">
        <span className="inline-flex size-10 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur">
          <Icon className="size-5" />
        </span>
        <h3 className="mt-4 text-[16px] font-extrabold text-white">
          {tile.title}
        </h3>
        <p className="mt-2 text-[14px] leading-relaxed text-white/90">
          {tile.body}
        </p>
      </div>
    </article>
  );
}
