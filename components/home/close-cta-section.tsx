"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { routes } from "@/config/routes";
import { hbSpring } from "@/lib/motion";

export function CloseCtaSection() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#7b5cff_0%,#673de6_40%,#2f1c6a_100%)] py-20 sm:py-24">
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
          Imagined it. Now make it real.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-white/80">
          Build, host, mail, and grow from one HostingBeyond account — with
          Beyond AI on every plan.
        </p>
        <Link
          href={routes.getStarted}
          className="mt-8 inline-flex h-12 items-center rounded-full bg-white px-8 text-[15px] font-extrabold text-[#2f1c6a] shadow-[0_16px_32px_rgba(0,0,0,0.18)] transition hover:bg-[#f4f5ff]"
        >
          Get started
        </Link>
        <p className="mt-3 text-[13px] font-semibold text-white/70">
          30-day money-back guarantee
        </p>
      </motion.div>
    </section>
  );
}
