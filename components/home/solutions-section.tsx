"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import type { CmsSolutionsContent } from "@/lib/orbit/defaults";
import { SolutionCarousel } from "./solution-carousel";

export function SolutionsSection({ content }: { content: CmsSolutionsContent }) {
  const reduceMotion = useReducedMotion();
  const products = (content.products ?? [])
    .filter((product) => product.visible !== false)
    .sort((a, b) => a.order - b.order);

  if (!content.visible || products.length === 0) return null;

  return (
    <section
      aria-labelledby="hb-solutions-heading"
      className="relative overflow-hidden bg-[#b5d3f2] pb-16 pt-4 sm:pb-20 sm:pt-6"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#b5d3f2_0%,#d4e6f7_38%,#e7f1fb_72%,#f4f8fd_100%)]" />
        <div className="absolute top-[8%] left-[-10%] h-[50%] w-[45%] rounded-full bg-[radial-gradient(ellipse,rgba(147,197,253,0.35),transparent_68%)] blur-3xl" />
        <div className="absolute right-[-12%] bottom-[12%] h-[46%] w-[42%] rounded-full bg-[radial-gradient(ellipse,rgba(167,139,250,0.14),transparent_70%)] blur-3xl" />
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-[1180px] px-5 text-center sm:px-8"
      >
        <p className="text-[11px] font-semibold tracking-[0.28em] text-slate-500 uppercase">
          {content.eyebrow}
        </p>
        <h2
          id="hb-solutions-heading"
          className="font-heading mt-3 text-[2rem] leading-[1.08] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[2.75rem]"
        >
          {content.title}
          {content.titleAccent ? (
            <span className="mt-1 block bg-gradient-to-r from-[var(--hb-blue)] to-[var(--hb-purple)] bg-clip-text text-transparent">
              {content.titleAccent}
            </span>
          ) : null}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-slate-600">
          {content.description}
        </p>
        {content.ctaLabel.trim() && content.ctaHref.trim() ? (
          <Link
            href={content.ctaHref}
            className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-200 hover:text-slate-950"
          >
            {content.ctaLabel}
            <ArrowRight className="size-4" />
          </Link>
        ) : null}
      </motion.div>

      <div className="relative mt-10 sm:mt-12">
        <SolutionCarousel products={products} />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#07122a]"
      />
    </section>
  );
}
