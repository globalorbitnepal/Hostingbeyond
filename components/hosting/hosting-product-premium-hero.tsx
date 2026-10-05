"use client";

import Link from "next/link";
import { ArrowRight, Bot, Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export type HostingProductPremiumHeroProps = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  promo?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  cardEyebrow: string;
  highlights: string[];
  cardLine?: string;
  cardSubline?: string;
  showAiCredit?: boolean;
};

const fadeUp = (reduce: boolean, delay = 0) =>
  reduce
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
      };

export function HostingProductPremiumHero({
  eyebrow,
  title,
  titleAccent,
  description,
  promo,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  cardEyebrow,
  highlights,
  cardLine,
  cardSubline,
  showAiCredit = true,
}: HostingProductPremiumHeroProps) {
  const reduce = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden text-white"
      aria-labelledby="hosting-product-hero-title"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-[#2f1c6a] via-[#35206f] to-[#1e3a8a]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_8%_-10%,rgba(255,255,255,0.16),transparent_55%),radial-gradient(ellipse_60%_50%_at_92%_20%,rgba(59,130,246,0.28),transparent_50%),radial-gradient(ellipse_45%_40%_at_70%_100%,rgba(124,58,237,0.35),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[8%] size-[min(28rem,50vw)] rounded-full bg-[#7c3aed]/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-[12%] size-48 rounded-full bg-[#2563eb]/15 blur-3xl"
      />

      <div className="hb-shell relative grid gap-10 py-12 sm:py-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-center lg:gap-12 lg:py-[4.5rem]">
        <motion.div {...fadeUp(!!reduce, 0)} className="relative z-[1]">
          <p className="text-[11px] font-extrabold tracking-[0.26em] text-[#ddd6fe] uppercase sm:text-[12px]">
            {eyebrow}
          </p>
          <h1
            id="hosting-product-hero-title"
            className="font-heading mt-4 text-[clamp(2.35rem,5.4vw,3.85rem)] leading-[1.04] font-extrabold tracking-[-0.045em] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.22)]"
          >
            {title}{" "}
            <span className="bg-gradient-to-r from-[#e9d5ff] via-[#c4b5fd] to-[#93c5fd] bg-clip-text text-transparent">
              {titleAccent}
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-[1.65] font-semibold text-white/92 sm:text-[17px]">
            {description}
          </p>
          {promo ? (
            <motion.p
              {...fadeUp(!!reduce, 0.08)}
              className="mt-5 inline-flex rounded-full bg-emerald-400/15 px-4 py-1.5 text-[13px] font-bold text-emerald-100 ring-1 ring-emerald-400/35"
            >
              {promo}
            </motion.p>
          ) : null}
          <motion.div
            {...fadeUp(!!reduce, 0.12)}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          >
            <Link
              href={primaryHref}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-[15px] font-extrabold text-[#2f1c6a] shadow-[0_14px_36px_-12px_rgba(0,0,0,0.45)] transition hover:brightness-[1.03]"
            >
              {primaryLabel}
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-white/55 bg-white/8 px-7 text-[15px] font-bold text-white backdrop-blur-sm transition hover:bg-white/14"
            >
              {secondaryLabel}
              <ArrowRight className="size-4" />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          {...fadeUp(!!reduce, 0.1)}
          className={cn(
            "relative z-[1] rounded-[28px] border border-white/20",
            "bg-[rgba(255,255,255,0.08)] p-6 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-7",
          )}
        >
          <p className="text-[11px] font-extrabold tracking-[0.2em] text-white/65 uppercase">
            {cardEyebrow}
          </p>
          <ul className="mt-5 space-y-3.5">
            {highlights.map((line, i) => (
              <motion.li
                key={line}
                {...fadeUp(!!reduce, 0.14 + i * 0.05)}
                className="flex items-center gap-2.5 text-[15px] font-semibold text-white"
              >
                <span
                  className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/90 shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                  aria-hidden
                >
                  <Check className="size-3.5 text-white" strokeWidth={3} />
                </span>
                {line}
              </motion.li>
            ))}
          </ul>
          {cardLine ? (
            <p className="mt-6 text-[14px] font-bold text-white/95">
              {cardLine}
            </p>
          ) : null}
          {showAiCredit ? (
            <div className="mt-5 flex items-center gap-2 text-[13px] font-semibold text-white/80">
              <Bot className="size-4 shrink-0 text-[#c4b5fd]" />
              Beyond AI credit on annual plans
            </div>
          ) : null}
          {cardSubline ? (
            <p className="mt-3 text-[13px] font-medium text-white/75">
              {cardSubline}
            </p>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
