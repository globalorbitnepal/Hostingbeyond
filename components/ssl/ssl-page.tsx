"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  Globe2,
  Lock,
  Minus,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import type {
  CmsSslFeature,
  CmsSslPageContent,
} from "@/lib/orbit/ssl-page-content";
import { cn } from "@/lib/utils";

const FEATURE_ICONS: Record<CmsSslFeature["icon"], typeof Shield> = {
  shield: Shield,
  lock: Lock,
  zap: Zap,
  search: Search,
  globe: Globe2,
  refresh: RefreshCw,
};

type Term = 1 | 2 | 3;

const TERMS: { value: Term; label: string; hint: string }[] = [
  { value: 1, label: "1 year", hint: "Renews annually" },
  { value: 2, label: "2 years", hint: "Best for stores" },
  { value: 3, label: "3 years", hint: "Lowest per year" },
];

function planPrice(
  plan: { price1: string; price2: string; price3: string },
  term: Term,
) {
  if (term === 3) return plan.price3;
  if (term === 2) return plan.price2;
  return plan.price1;
}

function formatMoney(raw: string) {
  const amount = Number.parseFloat(raw.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(amount)) return raw;
  if (amount === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function SslPageView({ content }: { content: CmsSslPageContent }) {
  const reduce = useReducedMotion();
  const [term, setTerm] = useState<Term>(1);
  const [activeType, setActiveType] = useState(
    content.certTypes.find((t) => t.visible !== false)?.id ?? "dv",
  );
  const [openFaq, setOpenFaq] = useState<string | null>(
    content.faqs.find((f) => f.visible !== false)?.id ?? null,
  );

  const stats = content.stats.filter((s) => s.visible !== false);
  const features = content.features.filter((f) => f.visible !== false);
  const groups = content.includedGroups.filter((g) => g.visible !== false);
  const plans = content.plans.filter((p) => p.visible !== false);
  const steps = content.steps.filter((s) => s.visible !== false);
  const certTypes = content.certTypes.filter((t) => t.visible !== false);
  const reviews = content.reviews.filter((r) => r.visible !== false);
  const faqs = content.faqs.filter((f) => f.visible !== false);
  const activeCert =
    certTypes.find((t) => t.id === activeType) ?? certTypes[0] ?? null;

  const fade = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: {
            duration: 0.45,
            delay,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        };

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hb-band-purple relative overflow-hidden text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_-10%,rgba(255,255,255,0.22),transparent_46%),radial-gradient(ellipse_at_88%_38%,rgba(56,189,248,0.24),transparent_44%)]"
        />
        <div className="hb-shell relative grid items-center gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-20">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-extrabold tracking-[0.18em] uppercase">
              <ShieldCheck className="size-3.5 text-emerald-300" aria-hidden />
              {content.heroBadge}
            </p>
            <h1 className="font-heading mt-5 text-[clamp(2.15rem,4.8vw,3.85rem)] leading-[1.03] font-extrabold tracking-[-0.045em]">
              {content.heroTitle}{" "}
              <span className="bg-gradient-to-r from-[#a5f3fc] via-[#ddd6fe] to-[#fbcfe8] bg-clip-text text-transparent">
                {content.heroTitleAccent}
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-white/80 sm:text-[16.5px]">
              {content.heroDescription}
            </p>
            <ul className="mt-6 space-y-2.5">
              {content.heroBullets.map((line) => (
                <li
                  key={line}
                  className="flex gap-2.5 text-[14.5px] leading-snug text-white/85"
                >
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-emerald-300"
                    strokeWidth={3}
                    aria-hidden
                  />
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={content.heroPrimaryHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-[15px] font-extrabold text-[#3b1d8f] shadow-[0_14px_34px_-16px_rgba(0,0,0,0.6)] transition hover:bg-violet-50"
              >
                {content.heroPrimaryLabel}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href={content.heroSecondaryHref}
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/35 px-6 text-[15px] font-bold text-white transition hover:bg-white/10"
              >
                {content.heroSecondaryLabel}
              </Link>
            </div>
            <p className="mt-4 text-[12.5px] font-medium text-white/60">
              {content.heroGuarantee}
            </p>
          </motion.div>

          {/* Certificate card — pure CSS, no images */}
          <motion.div
            initial={reduce ? false : { opacity: 0, x: 26 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative mx-auto w-full max-w-[420px]"
          >
            <div
              aria-hidden
              className="absolute -inset-6 rounded-[36px] bg-[radial-gradient(circle_at_50%_30%,rgba(165,243,252,0.28),transparent_62%)] blur-2xl"
            />
            <div className="relative rounded-[24px] border border-white/25 bg-white/12 p-1.5 shadow-[0_28px_70px_-30px_rgba(0,0,0,0.7)] backdrop-blur-md">
              <div className="rounded-[18px] bg-[linear-gradient(155deg,#f8fafc_0%,#eef2ff_100%)] p-5 text-[#1e1b4b]">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10.5px] font-extrabold tracking-wide text-emerald-800 uppercase">
                    <BadgeCheck className="size-3.5" aria-hidden />
                    {content.heroVisualTitle}
                  </span>
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#673de6]/10 text-[#673de6]">
                    <Lock className="size-4" aria-hidden />
                  </span>
                </div>

                <p className="mt-5 flex items-center gap-1.5 font-mono text-[15px] font-bold tracking-tight text-[#1e1b4b]">
                  <Lock className="size-3.5 text-emerald-600" aria-hidden />
                  {content.heroVisualDomain}
                </p>
                <p className="mt-1 text-[11.5px] font-semibold text-slate-500">
                  {content.heroVisualIssuer}
                </p>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-full rounded-full bg-[linear-gradient(90deg,#10b981,#22d3ee,#673de6)]" />
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-2">
                    <dt className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">
                      {content.heroVisualExpiryLabel}
                    </dt>
                    <dd className="mt-0.5 text-[13px] font-extrabold text-[#1e1b4b]">
                      {content.heroVisualExpiryValue}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-2">
                    <dt className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">
                      {content.heroVisualScoreLabel}
                    </dt>
                    <dd className="mt-0.5 text-[13px] font-extrabold text-emerald-700">
                      {content.heroVisualScoreValue}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["TLS 1.3", "HSTS", "256-bit", "Auto-renew"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-[#673de6]/10 px-2 py-1 text-[10px] font-bold text-[#4c1d95]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      {stats.length > 0 ? (
        <section className="relative bg-white">
          <div className="hb-shell -mt-px">
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-b-[26px] border-x border-b border-slate-200/80 bg-slate-200/70 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.id} className="bg-white px-4 py-6 text-center">
                  <p className="font-heading text-[clamp(1.4rem,3vw,1.9rem)] font-extrabold tracking-tight text-[#2f1c6a]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[12px] leading-snug font-semibold text-slate-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            {content.statsHeading ? (
              <p className="sr-only">{content.statsHeading}</p>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ── Why HTTPS ────────────────────────────────────────────── */}
      <section className="hb-band-cream py-16 sm:py-20">
        <div className="hb-shell">
          <motion.div {...fade(0)} className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-extrabold tracking-[0.26em] text-[#5b21b6]/80 uppercase sm:text-[12px]">
              {content.whyEyebrow}
            </p>
            <h2 className="font-heading mt-3 text-[clamp(1.85rem,3.6vw,2.85rem)] leading-[1.1] font-extrabold tracking-[-0.04em] text-[#2f1c6a]">
              {content.whyHeading}{" "}
              <span className="bg-gradient-to-r from-[#673de6] to-[#7c3aed] bg-clip-text text-transparent">
                {content.whyHeadingAccent}
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed font-medium text-slate-600 sm:text-[16px]">
              {content.whyDescription}
            </p>
          </motion.div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat, index) => {
              const Icon = FEATURE_ICONS[feat.icon] ?? Shield;
              return (
                <motion.article
                  key={feat.id}
                  {...fade(0.05 + index * 0.04)}
                  className="group rounded-[22px] border border-white/90 bg-white/85 p-5 shadow-[0_14px_40px_-26px_rgba(47,28,106,0.45)] backdrop-blur-sm transition hover:border-[#673de6]/35"
                >
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#673de6] to-[#7c3aed] text-white shadow-[0_10px_24px_-12px_rgba(103,61,230,0.85)]">
                    <Icon className="size-5" strokeWidth={2.2} aria-hidden />
                  </span>
                  <h3 className="mt-4 text-[16.5px] font-extrabold text-[#1e1b4b]">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
                    {feat.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Included ─────────────────────────────────────────────── */}
      {groups.length > 0 ? (
        <section className="relative overflow-hidden bg-white py-16 sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_50%_0%,rgba(103,61,230,0.14),transparent_70%)]"
          />
          <div className="hb-shell relative">
            <motion.div {...fade(0)} className="mx-auto max-w-3xl text-center">
              <p className="text-[11px] font-extrabold tracking-[0.26em] text-[#5b21b6]/80 uppercase sm:text-[12px]">
                {content.includedEyebrow}
              </p>
              <h2 className="font-heading mt-3 text-[clamp(1.8rem,3.5vw,2.7rem)] leading-[1.12] font-extrabold tracking-[-0.04em] text-[#1e1b4b]">
                {content.includedHeading}{" "}
                <span className="text-[#673de6]">
                  {content.includedHeadingAccent}
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600">
                {content.includedDescription}
              </p>
            </motion.div>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {groups.map((group, index) => (
                <motion.article
                  key={group.id}
                  {...fade(0.05 + index * 0.05)}
                  className="relative flex flex-col rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8f7ff_100%)] p-6 shadow-[0_18px_50px_-32px_rgba(47,28,106,0.5)]"
                >
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#673de6]/10 text-[#673de6]">
                    <ShieldCheck className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-[17px] font-extrabold text-[#1e1b4b]">
                    {group.title}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">
                    {group.description}
                  </p>
                  <ul className="mt-4 space-y-2.5 border-t border-slate-200/80 pt-4">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 text-[13.5px] leading-snug font-medium text-slate-700"
                      >
                        <Check
                          className="mt-0.5 size-4 shrink-0 text-[#673de6]"
                          strokeWidth={3}
                          aria-hidden
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.article>
              ))}
            </div>
            {content.includedFootnote ? (
              <p className="mx-auto mt-8 max-w-2xl text-center text-[12.5px] leading-relaxed text-slate-500">
                {content.includedFootnote}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ── Pricing ──────────────────────────────────────────────── */}
      <section
        id="ssl-plans"
        className="relative scroll-mt-24 overflow-hidden bg-[linear-gradient(160deg,#241a52_0%,#3b1d8f_42%,#1e3a8a_100%)] py-16 sm:py-20"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(255,255,255,0.14),transparent_58%)]"
        />
        <div className="hb-shell relative">
          <motion.div {...fade(0)} className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-1.5 text-[11px] font-extrabold tracking-[0.18em] text-white uppercase">
              <Sparkles className="size-3.5 text-violet-200" aria-hidden />
              {content.pricingEyebrow}
            </p>
            <h2 className="font-heading mt-5 text-[clamp(1.9rem,4vw,3rem)] leading-[1.08] font-extrabold tracking-[-0.04em] text-white">
              {content.pricingHeading}{" "}
              <span className="text-[#ddd6fe]">
                {content.pricingHeadingAccent}
              </span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed font-semibold text-white/90">
              {content.pricingDescription}
            </p>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {[
                content.pricingTrust1,
                content.pricingTrust2,
                content.pricingTrust3,
              ]
                .filter(Boolean)
                .map((line) => (
                  <li
                    key={line}
                    className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[12px] font-bold text-white"
                  >
                    <Check
                      className="size-3.5 shrink-0 text-emerald-300"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                    {line}
                  </li>
                ))}
            </ul>

            <div className="mt-7 flex flex-col items-center gap-2.5">
              <div
                role="group"
                aria-label="Certificate term"
                className="inline-flex w-full max-w-lg items-stretch overflow-hidden rounded-2xl border border-white/25 bg-white/10 p-1"
              >
                {TERMS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTerm(opt.value)}
                    aria-pressed={term === opt.value}
                    className={cn(
                      "min-h-11 flex-1 rounded-xl px-2 text-[12px] font-extrabold transition-colors duration-200 sm:text-[13px]",
                      term === opt.value
                        ? "bg-white text-[#2f1c6a] shadow-sm"
                        : "text-white/85 hover:bg-white/10",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <span className="text-[12px] font-semibold text-white/60">
                {TERMS.find((t) => t.value === term)?.hint}
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-4 py-1.5 text-[12px] font-extrabold text-emerald-100 ring-1 ring-emerald-400/35">
                {content.pricingSaveBadge}
              </span>
            </div>
          </motion.div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan, index) => {
              const popular = Boolean(plan.popular);
              const price = planPrice(plan, term);
              return (
                <motion.article
                  key={plan.id}
                  {...fade(0.05 + index * 0.05)}
                  className={cn(
                    "relative flex flex-col rounded-[22px] border p-5",
                    popular
                      ? "border-violet-300/60 bg-gradient-to-b from-[#5b21b6] to-[#4338ca] text-white shadow-[0_20px_56px_-24px_rgba(0,0,0,0.55)] ring-1 ring-violet-300/40"
                      : "border-white/40 bg-white text-[#0f172a] shadow-[0_16px_46px_-28px_rgba(0,0,0,0.45)]",
                  )}
                >
                  {popular ? (
                    <p className="mb-2 w-fit rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-extrabold tracking-[0.12em] text-violet-100 uppercase">
                      Most popular
                    </p>
                  ) : (
                    <p className="mb-2 h-[18px]" aria-hidden />
                  )}
                  <span
                    className={cn(
                      "w-fit rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wide uppercase",
                      popular
                        ? "bg-emerald-400/20 text-emerald-50 ring-1 ring-emerald-300/30"
                        : "bg-emerald-50 text-emerald-800",
                    )}
                  >
                    {plan.off}
                  </span>

                  <h3
                    className={cn(
                      "font-heading mt-3 text-[1.4rem] leading-tight font-extrabold tracking-[-0.02em]",
                      popular ? "text-white" : "text-[#1e1b4b]",
                    )}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={cn(
                      "mt-1 text-[13px] leading-snug font-semibold",
                      popular ? "text-violet-100/90" : "text-slate-600",
                    )}
                  >
                    Best for {plan.bestFor}
                  </p>

                  <div className="mt-5 flex items-end gap-1.5">
                    <span
                      className={cn(
                        "text-[clamp(1.9rem,3.4vw,2.35rem)] leading-none font-extrabold tracking-[-0.03em]",
                        popular ? "text-white" : "text-[#1e1b4b]",
                      )}
                    >
                      {formatMoney(price)}
                    </span>
                    {Number.parseFloat(price) > 0 ? (
                      <span
                        className={cn(
                          "pb-1 text-[13px] font-extrabold",
                          popular ? "text-violet-100" : "text-slate-600",
                        )}
                      >
                        /{term === 1 ? "yr" : `${term} yrs`}
                      </span>
                    ) : null}
                  </div>
                  <p
                    className={cn(
                      "mt-2 text-[12px] leading-snug font-semibold",
                      popular ? "text-violet-100/85" : "text-slate-600",
                    )}
                  >
                    {plan.badge} · Renews at {formatMoney(plan.renew)}/yr
                  </p>

                  <ul className="mt-4 flex-1 space-y-2">
                    {plan.features.map((line) => (
                      <li
                        key={line}
                        className={cn(
                          "flex gap-2 text-[12.5px] leading-snug font-semibold",
                          popular ? "text-white/90" : "text-slate-700",
                        )}
                      >
                        <Check
                          className={cn(
                            "mt-0.5 size-3.5 shrink-0",
                            popular ? "text-violet-200" : "text-[#673de6]",
                          )}
                          strokeWidth={2.5}
                          aria-hidden
                        />
                        {line}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.ctaHref}
                    className={cn(
                      "mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-[13.5px] font-extrabold transition-colors duration-200",
                      popular
                        ? "bg-white text-[#4c1d95] hover:bg-violet-50"
                        : "bg-gradient-to-r from-[#673de6] to-[#7c3aed] text-white hover:brightness-105",
                    )}
                  >
                    {plan.ctaLabel}
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </motion.article>
              );
            })}
          </div>

          {content.pricingNote ? (
            <p className="mx-auto mt-8 max-w-3xl text-center text-[12.5px] leading-relaxed font-medium text-white/70">
              {content.pricingNote}
            </p>
          ) : null}
        </div>
      </section>

      {/* ── Steps ────────────────────────────────────────────────── */}
      {steps.length > 0 ? (
        <section className="hb-band-cream py-16 sm:py-20">
          <div className="hb-shell">
            <motion.div {...fade(0)} className="mx-auto max-w-3xl text-center">
              <p className="text-[11px] font-extrabold tracking-[0.26em] text-[#5b21b6]/80 uppercase sm:text-[12px]">
                {content.stepsEyebrow}
              </p>
              <h2 className="font-heading mt-3 text-[clamp(1.8rem,3.5vw,2.7rem)] leading-[1.12] font-extrabold tracking-[-0.04em] text-[#2f1c6a]">
                {content.stepsHeading}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600">
                {content.stepsDescription}
              </p>
            </motion.div>

            <ol className="relative mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-6 top-7 hidden h-px bg-gradient-to-r from-transparent via-[#673de6]/35 to-transparent xl:block"
              />
              {steps.map((step, index) => (
                <motion.li
                  key={step.id}
                  {...fade(0.05 + index * 0.05)}
                  className="relative rounded-[22px] border border-white/90 bg-white/85 p-5 shadow-[0_16px_44px_-30px_rgba(47,28,106,0.55)] backdrop-blur-sm"
                >
                  <span className="inline-flex size-11 items-center justify-center rounded-full bg-[#1e1b4b] text-[15px] font-extrabold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3.5 text-[16px] font-extrabold text-[#1e1b4b]">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">
                    {step.description}
                  </p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* ── Certificate types ────────────────────────────────────── */}
      {activeCert && certTypes.length > 0 ? (
        <section className="relative overflow-hidden bg-white py-16 sm:py-20">
          <div className="hb-shell">
            <motion.div {...fade(0)} className="mx-auto max-w-3xl text-center">
              <p className="text-[11px] font-extrabold tracking-[0.26em] text-[#5b21b6]/80 uppercase sm:text-[12px]">
                {content.typesEyebrow}
              </p>
              <h2 className="font-heading mt-3 text-[clamp(1.8rem,3.5vw,2.7rem)] leading-[1.12] font-extrabold tracking-[-0.04em] text-[#1e1b4b]">
                {content.typesHeading}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600">
                {content.typesDescription}
              </p>
            </motion.div>

            <div className="mx-auto mt-8 flex w-full max-w-2xl flex-wrap justify-center gap-2">
              {certTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setActiveType(type.id)}
                  aria-pressed={activeType === type.id}
                  className={cn(
                    "rounded-full border px-4 py-2 text-[13px] font-extrabold transition",
                    activeType === type.id
                      ? "border-[#673de6] bg-[#673de6] text-white shadow-[0_10px_24px_-12px_rgba(103,61,230,0.8)]"
                      : "border-slate-200 bg-white text-slate-600 hover:border-[#673de6]/40",
                  )}
                >
                  {type.label} — {type.title}
                </button>
              ))}
            </div>

            <motion.div
              key={activeCert.id}
              {...fade(0)}
              className="mx-auto mt-8 grid max-w-5xl gap-6 rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8f7ff_100%)] p-6 shadow-[0_22px_60px_-40px_rgba(47,28,106,0.6)] lg:grid-cols-[1.15fr_0.85fr] lg:p-8"
            >
              <div>
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#673de6] to-[#7c3aed] text-white">
                  <ShieldCheck className="size-5" aria-hidden />
                </span>
                <h3 className="font-heading mt-4 text-[1.5rem] font-extrabold tracking-[-0.02em] text-[#1e1b4b]">
                  {activeCert.title}
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-slate-600">
                  {activeCert.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {activeCert.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-2 text-[13.5px] font-medium text-slate-700"
                    >
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-emerald-600"
                        strokeWidth={3}
                        aria-hidden
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <dl className="space-y-3 rounded-2xl border border-slate-200/90 bg-white p-5">
                {[
                  ["Validation", activeCert.validation],
                  ["Typical issuance", activeCert.issueTime],
                  ["Best for", activeCert.bestFor],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="border-b border-dashed border-slate-200 pb-3 last:border-0 last:pb-0"
                  >
                    <dt className="text-[10.5px] font-extrabold tracking-wide text-slate-400 uppercase">
                      {label}
                    </dt>
                    <dd className="mt-1 text-[13.5px] font-bold text-[#1e1b4b]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </div>
        </section>
      ) : null}

      {/* ── Problem / fix comparison ─────────────────────────────── */}
      {content.securityProblems.length > 0 ||
      content.securityFixes.length > 0 ? (
        <section className="relative overflow-hidden bg-[linear-gradient(180deg,#eef2ff_0%,#f5f3ff_100%)] py-16 sm:py-20">
          <div className="hb-shell">
            <motion.div {...fade(0)} className="mx-auto max-w-3xl text-center">
              <p className="text-[11px] font-extrabold tracking-[0.26em] text-[#5b21b6]/80 uppercase sm:text-[12px]">
                {content.securityEyebrow}
              </p>
              <h2 className="font-heading mt-3 text-[clamp(1.8rem,3.5vw,2.7rem)] leading-[1.12] font-extrabold tracking-[-0.04em] text-[#1e1b4b]">
                {content.securityHeading}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600">
                {content.securityDescription}
              </p>
            </motion.div>

            <div className="mt-10 grid gap-4 lg:grid-cols-2">
              <motion.div
                {...fade(0.05)}
                className="rounded-[24px] border border-rose-200/80 bg-white p-6 shadow-[0_18px_50px_-36px_rgba(190,24,93,0.6)]"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-9 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                    <X className="size-5" strokeWidth={2.5} aria-hidden />
                  </span>
                  <h3 className="text-[15.5px] font-extrabold text-[#881337]">
                    Without HTTPS
                  </h3>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {content.securityProblems.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2.5 text-[13.5px] leading-snug font-medium text-slate-700"
                    >
                      <Minus
                        className="mt-0.5 size-4 shrink-0 text-rose-500"
                        strokeWidth={3}
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                {...fade(0.1)}
                className="rounded-[24px] border border-[#673de6]/25 bg-white p-6 shadow-[0_18px_50px_-36px_rgba(103,61,230,0.7)]"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-9 items-center justify-center rounded-lg bg-violet-100 text-[#673de6]">
                    <Plus className="size-5" strokeWidth={2.5} aria-hidden />
                  </span>
                  <h3 className="text-[15.5px] font-extrabold text-[#4c1d95]">
                    With HostingBeyond SSL
                  </h3>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {content.securityFixes.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2.5 text-[13.5px] leading-snug font-medium text-slate-700"
                    >
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-emerald-600"
                        strokeWidth={3}
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ── Reviews ──────────────────────────────────────────────── */}
      {reviews.length > 0 ? (
        <section className="bg-white py-16 sm:py-20">
          <div className="hb-shell">
            <motion.div {...fade(0)} className="mx-auto max-w-3xl text-center">
              <h2 className="font-heading text-[clamp(1.75rem,3.4vw,2.6rem)] leading-[1.12] font-extrabold tracking-[-0.04em] text-[#1e1b4b]">
                {content.reviewsHeading}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600">
                {content.reviewsDescription}
              </p>
            </motion.div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {reviews.map((review, index) => (
                <motion.figure
                  key={review.id}
                  {...fade(0.05 + index * 0.05)}
                  className="flex h-full flex-col rounded-[22px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_16px_44px_-34px_rgba(15,23,42,0.5)]"
                >
                  <div className="flex gap-0.5 text-amber-400">
                    {[0, 1, 2, 3, 4].map((star) => (
                      <span key={star} aria-hidden className="text-[13px]">
                        ★
                      </span>
                    ))}
                  </div>
                  <blockquote className="mt-3 flex-1 text-[14px] leading-relaxed font-medium text-slate-700">
                    “{review.quote}”
                  </blockquote>
                  <figcaption className="mt-4 border-t border-slate-200 pt-3">
                    <p className="text-[13.5px] font-extrabold text-[#1e1b4b]">
                      {review.name}
                    </p>
                    <p className="text-[12px] font-semibold text-slate-500">
                      {review.role}
                    </p>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      {faqs.length > 0 ? (
        <section className="hb-band-cream py-16 sm:py-20">
          <div className="hb-shell grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
            <motion.div
              {...fade(0)}
              className="lg:sticky lg:top-24 lg:self-start"
            >
              <h2 className="font-heading text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.14] font-extrabold tracking-[-0.04em] text-[#1e1b4b]">
                {content.faqHeading}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                {content.faqDescription}
              </p>
              <Link
                href={content.heroSecondaryHref}
                className="mt-5 inline-flex items-center gap-2 text-[14px] font-extrabold text-[#673de6] hover:underline"
              >
                Ask our security team
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </motion.div>

            <div className="space-y-2.5">
              {faqs.map((faq, index) => {
                const open = openFaq === faq.id;
                return (
                  <motion.div
                    key={faq.id}
                    {...fade(0.04 + index * 0.03)}
                    className={cn(
                      "overflow-hidden rounded-2xl border bg-white transition",
                      open
                        ? "border-[#673de6]/40 shadow-[0_16px_40px_-30px_rgba(103,61,230,0.7)]"
                        : "border-slate-200",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : faq.id)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
                    >
                      <span className="text-[14.5px] font-extrabold text-[#1e1b4b]">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-4 shrink-0 text-[#673de6] transition-transform duration-200",
                          open ? "rotate-180" : "",
                        )}
                        aria-hidden
                      />
                    </button>
                    {open ? (
                      <p className="px-4 pb-4 text-[13.5px] leading-relaxed text-slate-600">
                        {faq.answer}
                      </p>
                    ) : null}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── Closing ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#2f1c6a_0%,#673de6_58%,#3b82f6_100%)] py-16 text-white sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_-20%,rgba(255,255,255,0.22),transparent_52%)]"
        />
        <div className="hb-shell relative">
          <div className="mx-auto max-w-3xl text-center">
            <motion.h2
              {...fade(0)}
              className="font-heading text-[clamp(1.85rem,3.8vw,2.9rem)] leading-[1.1] font-extrabold tracking-[-0.04em]"
            >
              {content.closingHeading}
            </motion.h2>
            <motion.p
              {...fade(0.06)}
              className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-white/85 sm:text-[16px]"
            >
              {content.closingDescription}
            </motion.p>
            <motion.div
              {...fade(0.12)}
              className="mt-7 flex flex-wrap items-center justify-center gap-3"
            >
              <Link
                href={content.closingCtaHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-[15px] font-extrabold text-[#3b1d8f] shadow-[0_16px_38px_-18px_rgba(0,0,0,0.6)] transition hover:bg-violet-50"
              >
                {content.closingCtaLabel}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href={content.heroSecondaryHref}
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/40 px-7 text-[15px] font-bold text-white transition hover:bg-white/10"
              >
                {content.heroSecondaryLabel}
              </Link>
            </motion.div>
            <p className="mt-4 text-[12.5px] font-medium text-white/65">
              {content.closingFootnote}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
