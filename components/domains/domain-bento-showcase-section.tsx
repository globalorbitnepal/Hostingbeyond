"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { DomainBentoShowcaseMotion } from "@/components/domains/domain-bento-showcase-motion";
import type { DomainShowcaseCard } from "@/lib/domains/content";

function reveal(delay: number, reduce: boolean | null) {
  if (reduce) {
    return { initial: false as const, animate: { opacity: 1, y: 0 } };
  }
  return {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
  };
}

/** Motion panels — height matches content, no dead space below illustrations. */
const PANEL_TOP_H = "h-[min(92vw,360px)] sm:h-[380px]";
const PANEL_BOTTOM_H = "h-[min(85vw,300px)] sm:h-[320px]";

export function DomainBentoShowcaseSection({
  eyebrow,
  heading,
  description,
  cards,
}: {
  eyebrow: string;
  heading: string;
  description: string;
  cards: DomainShowcaseCard[];
}) {
  const reduce = useReducedMotion();
  const visible = cards.filter((c) => c.visible !== false);
  if (visible.length === 0) return null;

  const byLayout = (layout: DomainShowcaseCard["layout"]) =>
    visible.find((c) => c.layout === layout);

  const registrar = byLayout("registrar");
  const privacy = byLayout("privacy");
  const support = byLayout("support");
  const setup = byLayout("setup");

  return (
    <section
      className="relative overflow-x-hidden bg-gradient-to-b from-[#07051a] via-[#12082e] to-[#0a0f1f] py-14 sm:py-18 lg:py-20"
      aria-labelledby="why-hostingbeyond-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 10%, rgba(103,61,230,0.35), transparent 42%), radial-gradient(circle at 85% 30%, rgba(37,99,235,0.22), transparent 40%), radial-gradient(circle at 50% 100%, rgba(124,58,237,0.2), transparent 50%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.85) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.85) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="hb-shell relative z-10 max-w-[1280px]">
        <motion.header
          className="mx-auto max-w-3xl px-1 text-center sm:px-0"
          {...reveal(0, reduce)}
        >
          <p className="text-[11px] font-bold tracking-[0.32em] text-[#a5b4fc] uppercase">
            {eyebrow}
          </p>
          <h2
            id="why-hostingbeyond-heading"
            className="font-heading mt-3 text-[clamp(1.75rem,3.4vw,2.65rem)] leading-[1.08] font-extrabold tracking-[-0.04em] text-white"
          >
            {heading}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-white/70 sm:text-[16px]">
            {description}
          </p>
        </motion.header>

        <div className="mt-10 grid gap-5 lg:mt-12 lg:grid-cols-2 lg:items-start lg:gap-5">
          <motion.div
            className={`relative ${PANEL_TOP_H} min-w-0 overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] shadow-[0_40px_100px_-50px_rgba(103,61,230,0.55)]`}
            {...reveal(0.08, reduce)}
          >
            <DomainBentoShowcaseMotion layout="registrar" />
          </motion.div>

          <motion.div
            className="flex min-w-0 flex-col gap-4"
            {...reveal(0.14, reduce)}
          >
            <div
              className={`relative ${PANEL_TOP_H} overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] shadow-[0_40px_100px_-50px_rgba(37,99,235,0.45)]`}
            >
              <DomainBentoShowcaseMotion layout="privacy" />
            </div>
            {privacy ? (
              <div className="px-0.5 sm:px-1">
                <h3 className="text-[17px] font-extrabold tracking-tight text-white sm:text-[18px]">
                  {privacy.title}
                </h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-white/75">
                  {privacy.description}
                </p>
                {privacy.linkLabel ? (
                  <Link
                    href={privacy.linkHref || "#domain-guide"}
                    className="mt-2.5 inline-flex items-center gap-1.5 text-[13px] font-extrabold text-[#a5b4fc] transition hover:text-white"
                  >
                    {privacy.linkLabel}
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                ) : null}
              </div>
            ) : null}
          </motion.div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3 lg:gap-5">
          {registrar ? (
            <motion.article
              className="flex flex-col rounded-[22px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md sm:p-6"
              {...reveal(0.18, reduce)}
            >
              <h3 className="text-[17px] font-extrabold tracking-tight text-white">
                {registrar.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-white/70">
                {registrar.description}
              </p>
              {registrar.linkLabel ? (
                <Link
                  href={registrar.linkHref || "#pricing"}
                  className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-extrabold text-[#c4b5fd] hover:text-white"
                >
                  {registrar.linkLabel}
                  <ArrowRight className="size-4" />
                </Link>
              ) : null}
            </motion.article>
          ) : (
            <span className="hidden lg:block" aria-hidden />
          )}

          {support ? (
            <motion.div
              className={`relative ${PANEL_BOTTOM_H} min-w-0 overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04] shadow-[0_32px_80px_-48px_rgba(103,61,230,0.5)]`}
              {...reveal(0.22, reduce)}
            >
              <DomainBentoShowcaseMotion
                layout="support"
                badge={support.badge}
              />
            </motion.div>
          ) : null}

          {setup ? (
            <motion.div
              className={`relative ${PANEL_BOTTOM_H} min-w-0 overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04] shadow-[0_32px_80px_-48px_rgba(37,99,235,0.4)]`}
              {...reveal(0.26, reduce)}
            >
              <DomainBentoShowcaseMotion layout="setup" />
            </motion.div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
