"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bot,
  Check,
  Clock,
  Globe2,
  Minus,
  Plus,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { HostingPlansCream } from "@/components/hosting/hosting-plans-cream";
import type { CmsHostingPlansContent } from "@/lib/orbit/defaults";
import type {
  CmsMigrationFeature,
  CmsWebsiteMigrationPageContent,
} from "@/lib/orbit/website-migration-page-content";
import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";
import { cn } from "@/lib/utils";

const FEATURE_ICONS: Record<CmsMigrationFeature["icon"], typeof Zap> = {
  zap: Zap,
  shield: Shield,
  clock: Clock,
  users: Users,
  bot: Bot,
  globe: Globe2,
};

export function WebsiteMigrationPageView({
  page,
  hostingPlans,
}: {
  page: CmsWebsiteMigrationPageContent;
  hostingPlans: CmsHostingPlansContent;
}) {
  const reduce = useReducedMotion();
  const features = page.features.filter((f) => f.visible !== false);
  const steps = page.steps.filter((s) => s.visible !== false);
  const faqs = page.faqs.filter((f) => f.visible !== false);
  const [openFaq, setOpenFaq] = useState(0);

  const plansContent: CmsHostingPlansContent = useMemo(
    () => ({
      ...hostingPlans,
      saveBadge: page.saveBadge || hostingPlans.saveBadge,
      annualToggleLabel: page.annualToggleLabel,
      monthlyToggleLabel: page.monthlyToggleLabel,
      defaultBilling: page.defaultBilling,
    }),
    [hostingPlans, page],
  );

  return (
    <>
      <section className="hb-band-cream relative overflow-hidden">
        <div className="hb-shell grid gap-12 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[12px] font-bold tracking-[0.22em] text-[#673de6] uppercase">
              {page.heroEyebrow}
            </p>
            <h1 className="font-heading mt-4 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.08] font-extrabold tracking-[-0.04em] text-[#1e1b4b]">
              {page.heroTitle}{" "}
              <span className="text-[#673de6]">{page.heroTitleAccent}</span>
            </h1>
            <ul className="mt-6 space-y-3">
              {page.heroBullets.map((line) => (
                <li
                  key={line}
                  className="flex gap-3 text-[15px] leading-relaxed text-[#334155]"
                >
                  <span
                    className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
                    aria-hidden
                  >
                    <Check className="size-3.5 stroke-[3]" />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={page.heroPrimaryHref}
                className="inline-flex h-12 items-center rounded-xl bg-[#673de6] px-7 text-[15px] font-extrabold text-white shadow-lg shadow-violet-500/25 hover:bg-[#5b2fd6]"
              >
                {page.heroPrimaryLabel}
              </Link>
              {page.heroGuarantee ? (
                <p className="flex items-center gap-2 text-[13px] font-semibold text-[#64748b]">
                  <Shield className="size-4 text-[#673de6]" />
                  {page.heroGuarantee}
                </p>
              ) : null}
            </div>
          </motion.div>
          <motion.div
            initial={reduce ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative min-h-[280px] overflow-hidden rounded-[28px] border border-violet-200/80 bg-[#f5f3ff] shadow-xl shadow-violet-200/40"
          >
            <Image
              src={
                page.heroImage || "/images/migration/frames/hero-migration.svg"
              }
              alt=""
              fill
              priority
              className="object-cover object-center"
              unoptimized={isRuntimeMediaSrc(page.heroImage)}
            />
          </motion.div>
        </div>
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
              const Icon = FEATURE_ICONS[feat.icon] ?? Zap;
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

      <HostingPlansCream
        plansContent={plansContent}
        eyebrow={page.pricingEyebrow}
        title={page.pricingTitle}
        titleAccent={page.pricingTitleAccent}
        description={page.pricingDescription}
        footnote={page.pricingNote}
      />

      <section className="hb-band-cream border-t border-violet-100 py-16 sm:py-20">
        <div className="hb-shell grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-heading text-[clamp(1.75rem,3vw,2.4rem)] font-extrabold text-[#1e1b4b]">
              {page.aiHeading}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#475569]">
              {page.aiDescription}
            </p>
            <ul className="mt-6 space-y-3">
              {page.aiBullets.map((line) => (
                <li
                  key={line}
                  className="flex gap-2 text-[14px] text-[#334155]"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-[#673de6]" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative min-h-[260px] overflow-hidden rounded-[24px] border border-violet-100 bg-[#f5f3ff]">
            <Image
              src={
                page.aiImage || "/images/migration/frames/hero-migration.svg"
              }
              alt=""
              fill
              className="object-cover"
              unoptimized={isRuntimeMediaSrc(page.aiImage)}
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
            className={cn(
              "mt-8 inline-flex h-12 items-center rounded-xl bg-white px-8 text-[15px] font-extrabold text-[#2f1c6a]",
            )}
          >
            {page.closingCtaLabel}
          </Link>
        </div>
      </section>
    </>
  );
}
