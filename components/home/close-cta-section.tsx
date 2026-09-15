"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { hbSpring } from "@/lib/motion";
import {
  defaultCloseCtaSection,
  type CmsCloseCtaContent,
} from "@/lib/orbit/defaults";

export function CloseCtaSection({ content }: { content?: CmsCloseCtaContent }) {
  const reduce = useReducedMotion();
  const data = content ?? defaultCloseCtaSection();
  if (!data.visible) return null;

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#3b82f6_0%,#2563eb_18%,#673de6_58%,#2f1c6a_100%)] py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(255,255,255,0.22),transparent_48%)]"
      />
      <motion.div
        className="hb-shell relative z-10 mx-auto max-w-3xl text-center text-white"
        initial={reduce ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={hbSpring}
      >
        <h2 className="font-heading text-[clamp(2rem,4.2vw,3.35rem)] leading-[1.08] font-extrabold tracking-[-0.05em]">
          {data.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-white/80">
          {data.description}
        </p>
        <Link
          href={data.ctaHref}
          className="mt-8 inline-flex h-12 items-center rounded-full bg-white px-8 text-[15px] font-extrabold text-[#0c1a36] shadow-[0_16px_32px_rgba(0,0,0,0.18)] transition hover:bg-[#eef4ff]"
        >
          {data.ctaLabel}
        </Link>
        {data.trust ? (
          <p className="mt-3 text-[13px] font-semibold text-white/70">
            {data.trust}
          </p>
        ) : null}
      </motion.div>
    </section>
  );
}
