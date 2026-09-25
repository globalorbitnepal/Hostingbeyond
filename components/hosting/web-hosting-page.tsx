"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Check,
  Globe2,
  Mail,
  Minus,
  Plus,
  Server,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { HostingPlansCream } from "@/components/hosting/hosting-plans-cream";
import type { CmsHostingPlansContent } from "@/lib/orbit/defaults";
import type {
  CmsHostingPageContent,
  CmsHostingPageFeature,
} from "@/lib/orbit/hosting-page-content";
import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";
import { cn } from "@/lib/utils";

const FEATURE_ICONS: Record<CmsHostingPageFeature["icon"], typeof Zap> = {
  zap: Zap,
  shield: Shield,
  globe: Globe2,
  server: Server,
  mail: Mail,
  sparkles: Sparkles,
};

export function WebHostingPageView({
  page,
  hostingPlans,
}: {
  page: CmsHostingPageContent;
  hostingPlans: CmsHostingPlansContent;
}) {
  const reduce = useReducedMotion();
  const features = page.features.filter((f) => f.visible !== false);
  const faqs = page.faqs.filter((f) => f.visible !== false);
  const [openFaq, setOpenFaq] = useState(0);

  const plans = hostingPlans.plans.filter((p) => p.visible !== false);

  return (
    <>
      <section className="hb-band-purple relative overflow-hidden text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(255,255,255,0.14),transparent_45%),radial-gradient(ellipse_at_90%_80%,rgba(37,99,235,0.22),transparent_50%)]"
        />
        <div className="hb-shell relative grid gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[12px] font-bold tracking-[0.22em] text-[#c4b5fd] uppercase">
              {page.heroEyebrow}
            </p>
            <h1 className="font-heading mt-4 text-[clamp(2.2rem,5vw,3.75rem)] leading-[1.05] font-extrabold tracking-[-0.045em]">
              {page.heroTitle}{" "}
              <span className="text-[#c7d7ff]">{page.heroTitleAccent}</span>
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/85">
              {page.heroDescription}
            </p>
            {page.heroPromo ? (
              <p className="mt-4 inline-flex rounded-full bg-emerald-400/15 px-3 py-1 text-[13px] font-bold text-emerald-200 ring-1 ring-emerald-400/30">
                {page.heroPromo}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={page.heroPrimaryHref}
                className="inline-flex h-12 items-center rounded-xl bg-white px-6 text-[15px] font-extrabold text-[#2f1c6a] shadow-lg"
              >
                {page.heroPrimaryLabel}
              </Link>
              <Link
                href={page.heroSecondaryHref}
                className="inline-flex h-12 items-center rounded-xl border border-white/35 px-6 text-[15px] font-bold text-white hover:bg-white/10"
              >
                {page.heroSecondaryLabel}
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={reduce ? false : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-md"
          >
            <p className="text-[11px] font-bold tracking-wide text-white/60 uppercase">
              Included on every plan
            </p>
            <ul className="mt-4 space-y-3 text-[14px] text-white/90">
              {[
                "Free SSL certificate",
                "NVMe SSD storage",
                "Managed WordPress",
                "24/7 expert support",
              ].map((line) => (
                <li key={line} className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-400" />
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center gap-2 text-[13px] text-white/75">
              <Bot className="size-4 text-[#c4b5fd]" />
              Beyond AI credit on annual plans
            </div>
          </motion.div>
        </div>
      </section>

      <HostingPlansCream
        plansContent={hostingPlans}
        eyebrow={page.pricingEyebrow}
        title={page.pricingTitle}
        titleAccent={page.pricingTitleAccent}
        description={page.pricingDescription}
        footnote={page.pricingNote}
      />

      <section className="hb-band-purple py-16 sm:py-20">
        <div className="hb-shell">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-bold tracking-[0.28em] text-white/70 uppercase">
              {page.featuresEyebrow}
            </p>
            <h2 className="font-heading mt-3 text-[clamp(1.75rem,3.2vw,2.6rem)] font-extrabold text-white">
              {page.featuresHeading}
            </h2>
            <p className="mt-3 text-[15px] text-white/80">
              {page.featuresDescription}
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat) => {
              const Icon = FEATURE_ICONS[feat.icon] ?? Zap;
              return (
                <article
                  key={feat.id}
                  className="rounded-[22px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm"
                >
                  <Icon className="size-6 text-[#c4b5fd]" />
                  <h3 className="mt-3 text-[16px] font-extrabold text-white">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/80">
                    {feat.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="hb-band-cream py-16 sm:py-20">
        <div className="hb-shell grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-[clamp(1.75rem,3.2vw,2.5rem)] font-extrabold text-[#2f1c6a]">
              {page.wordpressHeading}
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-slate-600">
              {page.wordpressDescription}
            </p>
            <ul className="mt-5 space-y-2">
              {page.wordpressBullets.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-2 text-[14px] text-slate-700"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-[#673de6]" />
                  {line}
                </li>
              ))}
            </ul>
            <Link
              href={page.wordpressCtaHref}
              className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-[#673de6] px-5 text-[14px] font-bold text-white"
            >
              {page.wordpressCtaLabel}
              <ArrowRight className="size-4" />
            </Link>
          </div>
          {page.wordpressImage?.trim() ? (
            <div className="relative min-h-[280px] overflow-hidden rounded-[28px] shadow-lg">
              <Image
                src={page.wordpressImage}
                alt=""
                fill
                className="object-cover"
                unoptimized={isRuntimeMediaSrc(page.wordpressImage)}
              />
            </div>
          ) : (
            <div className="rounded-[28px] border border-[#e9e4ff] bg-gradient-to-br from-[#f5f3ff] to-[#eef4ff] p-8 shadow-inner">
              <p className="text-[13px] font-bold text-[#673de6] uppercase">
                WordPress toolkit
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                Staging-friendly updates, hardened PHP, and one-click installs —
                without cluttering your dashboard with upsells.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="hb-band-purple py-14 sm:py-16">
        <div className="hb-shell mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-[clamp(1.5rem,2.8vw,2.2rem)] font-extrabold text-white">
            {page.compareHeading}
          </h2>
          <p className="mt-3 text-[15px] text-white/80">
            {page.compareDescription}
          </p>
          <ul className="mt-8 grid gap-3 text-left sm:grid-cols-2">
            {page.compareBullets.map((line) => (
              <li
                key={line}
                className="flex items-start gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-[14px] text-white/90"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="faq" className="hb-band-cream py-16 sm:py-20">
        <div className="hb-shell mx-auto max-w-3xl">
          <h2 className="font-heading text-center text-[clamp(1.6rem,3vw,2.35rem)] font-extrabold text-[#2f1c6a]">
            {page.faqHeading}
          </h2>
          <p className="mt-2 text-center text-[15px] text-slate-600">
            {page.faqDescription}
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
                    name: "HostingBeyond Web Hosting",
                    description: page.heroDescription,
                    offers: plans.map((plan) => ({
                      "@type": "Offer",
                      name: plan.name,
                      price:
                        plan.priceAnnually.replace(/[^0-9.]/g, "") || "2.40",
                      priceCurrency: "USD",
                    })),
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
                  className={cn(
                    "overflow-hidden rounded-[18px] border bg-white",
                    open ? "border-[#c7b8ff]" : "border-slate-200",
                  )}
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-[15px] font-bold text-[#2f1c6a]"
                    onClick={() => setOpenFaq(open ? -1 : index)}
                    aria-expanded={open}
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

      <section className="hb-band-purple py-16 text-center text-white sm:py-20">
        <div className="hb-shell">
          <h2 className="font-heading text-[clamp(1.75rem,3.2vw,2.5rem)] font-extrabold">
            {page.closingHeading}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[16px] text-white/85">
            {page.closingDescription}
          </p>
          <Link
            href={page.closingCtaHref}
            className="mt-7 inline-flex h-12 items-center rounded-xl bg-white px-6 text-[15px] font-extrabold text-[#2f1c6a]"
          >
            {page.closingCtaLabel}
          </Link>
        </div>
      </section>
    </>
  );
}
