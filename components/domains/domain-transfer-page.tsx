"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Clock,
  Globe2,
  Mail,
  Minus,
  Plus,
  Server,
  Shield,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { DomainTransferCheckPanel } from "@/components/domains/domain-transfer-check-panel";
import { DomainTransferPriceTable } from "@/components/domains/domain-transfer-price-table";
import { DomainShowcaseMedia } from "@/components/domains/domain-showcase-media";
import type { DomainTldRow } from "@/lib/domains/content";
import type {
  CmsDomainTransferPageContent,
  CmsTransferFeature,
} from "@/lib/orbit/domain-transfer-page-content";
import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";
import { cn } from "@/lib/utils";

const FEATURE_ICONS: Record<CmsTransferFeature["icon"], typeof Shield> = {
  shield: Shield,
  clock: Clock,
  globe: Globe2,
  mail: Mail,
  server: Server,
  sparkles: Sparkles,
};

export function DomainTransferPageView({
  page,
  prices,
  initialDomain = "",
}: {
  page: CmsDomainTransferPageContent;
  prices: DomainTldRow[];
  initialDomain?: string;
}) {
  const reduce = useReducedMotion();
  const perks = page.perks.filter((p) => p.visible !== false);
  const steps = page.steps.filter((s) => s.visible !== false);
  const features = page.features.filter((f) => f.visible !== false);
  const faqs = page.faqs.filter((f) => f.visible !== false);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      <section className="relative overflow-x-clip bg-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#f3f0ff_0%,#ffffff_42%)]"
        />
        <div className="hb-shell relative grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-start lg:gap-12 lg:py-14">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[540px]"
          >
            {page.heroEyebrow ? (
              <p className="text-[12px] font-bold tracking-[0.22em] text-[#673de6] uppercase">
                {page.heroEyebrow}
              </p>
            ) : null}
            <h1
              className={cn(
                "font-heading text-[clamp(2.1rem,4vw,3rem)] leading-[1.12] font-bold tracking-[-0.02em] text-[#1a1a1a]",
                page.heroEyebrow ? "mt-4" : "mt-0",
              )}
            >
              {page.heroTitle}{" "}
              <span className="text-[#673de6]">{page.heroTitleAccent}</span>
            </h1>
            <p className="mt-4 text-[17px] leading-relaxed text-[#4a5568]">
              {page.heroDescription}
            </p>
            <ul className="mt-6 space-y-3">
              {page.heroBullets.map((line) => (
                <li
                  key={line}
                  className="flex gap-3 text-[16px] leading-snug text-[#374151]"
                >
                  <Check
                    className="mt-0.5 size-[18px] shrink-0 text-[#00b090]"
                    strokeWidth={3}
                    aria-hidden
                  />
                  {line}
                </li>
              ))}
            </ul>
            {page.heroGuarantee ? (
              <p className="mt-5 flex items-center gap-2 text-[14px] text-[#6b7280]">
                <Shield className="size-4 text-[#9ca3af]" aria-hidden />
                {page.heroGuarantee}
              </p>
            ) : null}
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="overflow-hidden rounded-[24px] border border-violet-100 shadow-lg">
              <div className="relative aspect-[16/10] min-h-[200px] w-full">
                <DomainShowcaseMedia
                  layout="transfer"
                  image={page.heroImage}
                  className="min-h-[200px]"
                />
              </div>
            </div>
            <DomainTransferCheckPanel
              searchPlaceholder={page.heroSearchPlaceholder}
              authPlaceholder={page.heroAuthPlaceholder}
              initialDomain={initialDomain}
            />
          </motion.div>
        </div>

        {perks.length > 0 ? (
          <div className="hb-shell pb-10">
            <ul className="grid gap-3 sm:grid-cols-3">
              {perks.map((perk) => (
                <li
                  key={perk.id}
                  className="rounded-2xl border border-violet-100 bg-white/90 px-5 py-4 text-center shadow-sm"
                >
                  <p className="text-[11px] font-extrabold tracking-wide text-slate-500 uppercase">
                    {perk.label}
                  </p>
                  <p className="font-heading mt-1 text-[1.35rem] font-extrabold text-[#2f1c6a]">
                    {perk.value}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="hb-band-purple py-16 sm:py-20">
        <div className="hb-shell">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-[clamp(1.75rem,3.2vw,2.5rem)] font-extrabold text-white">
              {page.stepsHeading}
            </h2>
            <p className="mt-3 text-[15px] text-white/80">
              {page.stepsDescription}
            </p>
          </div>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <li
                key={step.id}
                className="relative rounded-[22px] border border-white/15 bg-white/10 p-6 backdrop-blur-sm"
              >
                <span
                  className="inline-flex size-10 items-center justify-center rounded-full bg-white/15 text-[18px] font-extrabold text-white"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <h3 className="mt-4 text-[17px] font-extrabold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-white/80">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="hb-band-cream py-16 sm:py-20">
        <div className="hb-shell">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-[clamp(1.75rem,3.2vw,2.5rem)] font-extrabold text-[#1e1b4b]">
              {page.whyHeading}
            </h2>
            <p className="mt-3 text-[15px] text-[#475569]">
              {page.whyDescription}
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat) => {
              const Icon = FEATURE_ICONS[feat.icon] ?? Globe2;
              return (
                <article
                  key={feat.id}
                  className="rounded-[22px] border border-violet-100 bg-white p-5 shadow-sm"
                >
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-violet-100 text-[#673de6]">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-3 text-[16px] font-extrabold text-[#1e1b4b]">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#64748b]">
                    {feat.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="hb-shell">
          <div className="mx-auto max-w-2xl text-center">
            {page.pricingEyebrow ? (
              <p className="text-[12px] font-bold tracking-[0.2em] text-[#673de6] uppercase">
                {page.pricingEyebrow}
              </p>
            ) : null}
            <h2
              className={cn(
                "font-heading text-[clamp(1.75rem,3.2vw,2.4rem)] font-extrabold text-[#1e1b4b]",
                page.pricingEyebrow ? "mt-3" : "mt-0",
              )}
            >
              {page.pricingTitle}
            </h2>
            <p className="mt-3 text-[15px] text-[#64748b]">
              {page.pricingDescription}
            </p>
          </div>
          <div className="mt-10">
            <DomainTransferPriceTable
              prices={prices}
              footnote={page.pricingFootnote}
            />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-[#d9ebff] via-[#e8eeff] to-[#f6f3ff]"
        />
        <div className="hb-shell relative grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-heading text-[clamp(1.75rem,3vw,2.4rem)] font-bold text-[#1a1f3c]">
              {page.bundleHeading}
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#4a5568]">
              {page.bundleDescription}
            </p>
            <ul className="mt-6 space-y-3">
              {page.bundleBullets.map((line) => (
                <li
                  key={line}
                  className="flex gap-3 text-[15px] text-[#374151]"
                >
                  <Check
                    className="mt-0.5 size-5 shrink-0 text-[#2563eb]"
                    strokeWidth={2.5}
                  />
                  {line}
                </li>
              ))}
            </ul>
            <Link
              href={page.bundleCtaHref}
              className="mt-8 inline-flex h-12 items-center rounded-xl bg-[#673de6] px-7 text-[15px] font-extrabold text-white hover:bg-[#5c35d4]"
            >
              {page.bundleCtaLabel}
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-white/80 shadow-xl">
            <Image
              src={page.bundleImage}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 480px"
              unoptimized={isRuntimeMediaSrc(page.bundleImage)}
            />
          </div>
        </div>
      </section>

      <section className="hb-band-purple py-14 sm:py-16">
        <div className="hb-shell flex flex-col items-center gap-6 text-center">
          <h2 className="font-heading max-w-2xl text-[clamp(1.5rem,3vw,2.2rem)] font-extrabold text-white">
            {page.supportHeading}
          </h2>
          <p className="max-w-xl text-[15px] text-white/85">
            {page.supportDescription}
          </p>
          <Link
            href={page.supportCtaHref}
            className="inline-flex h-12 items-center rounded-xl bg-white px-7 text-[15px] font-extrabold text-[#2f1c6a]"
          >
            {page.supportCtaLabel}
          </Link>
        </div>
      </section>

      <section className="hb-band-cream py-16 sm:py-20">
        <div className="hb-shell max-w-3xl">
          <h2 className="font-heading text-center text-[clamp(1.75rem,3vw,2.4rem)] font-extrabold text-[#1e1b4b]">
            {page.faqHeading}
          </h2>
          <p className="mt-3 text-center text-[15px] text-[#64748b]">
            {page.faqDescription}
          </p>
          <div className="mt-8 space-y-2">
            {faqs.map((faq, index) => {
              const open = openFaq === index;
              return (
                <div
                  key={faq.id}
                  className="overflow-hidden rounded-2xl border border-violet-100 bg-white"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    onClick={() => setOpenFaq(open ? -1 : index)}
                    aria-expanded={open}
                  >
                    <span className="text-[15px] font-bold text-[#1e1b4b]">
                      {faq.question}
                    </span>
                    {open ? (
                      <Minus className="size-5 shrink-0 text-[#673de6]" />
                    ) : (
                      <Plus className="size-5 shrink-0 text-[#673de6]" />
                    )}
                  </button>
                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.div
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-4 text-[14px] leading-relaxed text-[#64748b]">
                          {faq.answer}
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

      <section className="hb-band-purple py-16 sm:py-20">
        <div className="hb-shell mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold text-white">
            {page.closingHeading}
          </h2>
          <p className="mt-4 text-[15px] text-white/85">
            {page.closingDescription}
          </p>
          <Link
            href={page.closingCtaHref}
            className="mt-8 inline-flex h-12 items-center rounded-xl bg-white px-8 text-[15px] font-extrabold text-[#2f1c6a]"
          >
            {page.closingCtaLabel}
          </Link>
        </div>
      </section>
    </>
  );
}
