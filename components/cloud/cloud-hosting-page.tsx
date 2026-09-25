"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Cloud,
  Cpu,
  Database,
  Globe2,
  Minus,
  Plus,
  Scale,
  Shield,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { HostingPlansCream } from "@/components/hosting/hosting-plans-cream";
import type { CmsHostingPlansContent } from "@/lib/orbit/defaults";
import type {
  CmsCloudHostingPageContent,
  CmsCloudPageFeature,
} from "@/lib/orbit/cloud-hosting-page-content";
import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";
import { cn } from "@/lib/utils";

const FEATURE_ICONS: Record<CmsCloudPageFeature["icon"], typeof Cpu> = {
  cpu: Cpu,
  shield: Shield,
  zap: Zap,
  scale: Scale,
  globe: Globe2,
  database: Database,
};

export function CloudHostingPageView({
  page,
}: {
  page: CmsCloudHostingPageContent;
}) {
  const reduce = useReducedMotion();
  const features = page.features.filter((f) => f.visible !== false);
  const faqs = page.faqs.filter((f) => f.visible !== false);
  const [openFaq, setOpenFaq] = useState(0);

  const plansContent: CmsHostingPlansContent = useMemo(
    () => ({
      visible: true,
      eyebrow: "",
      title: "",
      titleAccent: "",
      description: "",
      supportLabel: "24/7 Expert Support",
      supportHint: "Cloud specialists on chat",
      activationLabel: "Instant provisioning",
      activationHint: "Live in minutes",
      uptimeLabel: "99.9% uptime",
      uptimeHint: "Monitored infrastructure",
      scaleLabel: "One-click upgrades",
      scaleHint: "Grow without downtime",
      saveBadge: page.saveBadge,
      annualToggleLabel: page.annualToggleLabel,
      monthlyToggleLabel: page.monthlyToggleLabel,
      defaultBilling: page.defaultBilling,
      plans: page.plans,
      guarantees: [],
    }),
    [page],
  );

  const visiblePlans = page.plans.filter((p) => p.visible !== false);

  return (
    <>
      <section className="hb-band-purple relative overflow-hidden text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_10%_20%,rgba(147,197,253,0.2),transparent_50%),radial-gradient(ellipse_at_85%_0%,rgba(103,61,230,0.35),transparent_45%)]"
        />
        <div className="hb-shell relative grid gap-10 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[12px] font-bold tracking-[0.22em] text-[#c4b5fd] uppercase">
              {page.heroEyebrow}
            </p>
            <h1 className="font-heading mt-4 text-[clamp(2.1rem,4.8vw,3.6rem)] leading-[1.06] font-extrabold tracking-[-0.045em]">
              {page.heroTitle}{" "}
              <span className="text-[#c7d7ff]">{page.heroTitleAccent}</span>
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/85">
              {page.heroDescription}
            </p>
            {page.heroPromo ? (
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[13px] font-bold text-white ring-1 ring-white/20">
                <Cloud className="size-4 text-[#c4b5fd]" />
                {page.heroPromo}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={page.heroPrimaryHref}
                className="inline-flex h-12 items-center rounded-xl bg-white px-6 text-[15px] font-extrabold text-[#2f1c6a]"
              >
                {page.heroPrimaryLabel}
              </Link>
              <Link
                href={page.heroSecondaryHref}
                className="inline-flex h-12 items-center rounded-xl border border-white/35 px-6 text-[15px] font-bold hover:bg-white/10"
              >
                {page.heroSecondaryLabel}
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={reduce ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative min-h-[280px] overflow-hidden rounded-[28px] border border-white/20 shadow-2xl"
          >
            <Image
              src={page.heroImage || "/images/cloud/frames/hero-cloud.svg"}
              alt=""
              fill
              priority
              className="object-cover"
              unoptimized={isRuntimeMediaSrc(page.heroImage)}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[#2f1c6a]/80 via-transparent to-transparent"
            />
            <div className="absolute right-6 bottom-6 left-6 rounded-2xl border border-white/20 bg-black/30 p-4 backdrop-blur-md">
              <p className="text-[12px] font-bold text-white/70 uppercase">
                Isolated resources
              </p>
              <p className="mt-1 text-[14px] font-semibold text-white">
                Up to 8 GB RAM · 4 vCPU on Cloud Pro
              </p>
            </div>
          </motion.div>
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
              const Icon = FEATURE_ICONS[feat.icon] ?? Cpu;
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
        <div className="hb-shell grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-heading text-[clamp(1.75rem,3vw,2.4rem)] font-extrabold text-[#2f1c6a]">
              {page.performanceHeading}
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-slate-600">
              {page.performanceDescription}
            </p>
            <ul className="mt-6 space-y-3">
              {page.performanceStats.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-2 text-[14px] text-slate-700"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-[#673de6]" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[28px] border border-[#e9e4ff] bg-gradient-to-br from-[#f5f3ff] via-white to-[#eef4ff] p-8 shadow-inner">
            <p className="text-[13px] font-bold text-[#673de6] uppercase">
              Cloud performance
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              Reserved resources mean consistent response times when orders,
              sign-ups, or API calls spike — without provisioning a full VPS.
            </p>
          </div>
        </div>
      </section>

      <section className="hb-band-purple py-14 sm:py-16">
        <div className="hb-shell mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-[clamp(1.5rem,2.8vw,2.2rem)] font-extrabold text-white">
            {page.vsSharedHeading}
          </h2>
          <p className="mt-3 text-[15px] text-white/80">
            {page.vsSharedDescription}
          </p>
          <ul className="mt-8 grid gap-3 text-left sm:grid-cols-2">
            {page.vsSharedBullets.map((line) => (
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
                    name: "HostingBeyond Cloud Hosting",
                    description: page.heroDescription,
                    offers: visiblePlans.map((plan) => ({
                      "@type": "Offer",
                      name: plan.name,
                      price:
                        plan.priceAnnually.replace(/[^0-9.]/g, "") || "9.99",
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
            className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-[15px] font-extrabold text-[#2f1c6a]"
          >
            {page.closingCtaLabel}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
