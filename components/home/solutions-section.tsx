"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import type { CmsSolutionsContent } from "@/lib/orbit/defaults";
import { SolutionCarousel } from "./solution-carousel";

export function SolutionsSection({
  content,
}: {
  content: CmsSolutionsContent;
}) {
  const reduceMotion = useReducedMotion();
  const products = (content.products ?? [])
    .filter((product) => product.visible !== false)
    .sort((a, b) => a.order - b.order);

  if (!content.visible || products.length === 0) return null;

  return (
    <section
      aria-labelledby="hb-solutions-heading"
      className="hb-home-section hb-home-section--on-mist pt-10 pb-8 sm:pt-12 sm:pb-9 lg:pt-14 lg:pb-10"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{
          duration: reduceMotion ? 0 : 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="hb-shell relative"
      >
        <div className="flex flex-col items-center text-center lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:text-left">
          <div className="w-full min-w-0 lg:flex-1">
            <p className="text-[11px] font-bold tracking-[0.28em] text-slate-500 uppercase sm:text-[12px]">
              {content.eyebrow}
            </p>
            <h2
              id="hb-solutions-heading"
              className="font-heading mt-3 text-[clamp(1.7rem,3.6vw,3.55rem)] leading-[1.12] font-extrabold tracking-[-0.045em] text-balance lg:whitespace-nowrap"
            >
              <span className="text-[#2f1c6a]">{content.title}</span>
              {content.titleAccent ? (
                <>
                  {" "}
                  <span className="bg-gradient-to-r from-[#2563eb] via-[#673de6] to-[#7c3aed] bg-clip-text text-transparent">
                    {content.titleAccent}
                  </span>
                </>
              ) : null}
            </h2>
          </div>
          <div className="mt-4 flex w-full max-w-[40rem] flex-col items-center lg:mt-0 lg:max-w-[28rem] lg:items-end lg:text-right">
            <p className="text-[15px] leading-relaxed text-slate-600 sm:text-[16.5px] lg:text-[17px]">
              {content.description}
            </p>
            {content.ctaLabel.trim() && content.ctaHref.trim() ? (
              <Link
                href={content.ctaHref}
                className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full border border-white/80 bg-white/70 px-5 text-[15px] font-semibold text-[#2f1c6a] shadow-[0_10px_28px_rgba(15,10,40,0.08)] backdrop-blur-xl transition hover:bg-white"
              >
                {content.ctaLabel}
                <ArrowRight className="size-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </motion.div>

      <div className="relative mt-10 sm:mt-12">
        <SolutionCarousel products={products} />
      </div>
    </section>
  );
}
