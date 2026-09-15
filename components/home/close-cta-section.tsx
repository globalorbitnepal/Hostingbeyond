"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { routes } from "@/config/routes";

export function CloseCtaSection() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#673de6_0%,#2f1c6a_100%)] py-16 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(255,255,255,0.18),transparent_48%)]"
      />
      <motion.div
        className="hb-shell relative z-10 mx-auto max-w-3xl text-center text-white"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
      >
        <h2 className="font-heading text-[clamp(1.85rem,4vw,3.1rem)] leading-[1.1] font-extrabold tracking-[-0.045em]">
          Imagined it. Now make it real.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-white/80">
          Build, host, mail, and grow from one HostingBeyond account — with
          Beyond AI on every plan.
        </p>
        <Link
          href={routes.getStarted}
          className="mt-7 inline-flex h-12 items-center rounded-full bg-white px-7 text-[15px] font-extrabold text-[#2f1c6a] shadow-[0_16px_32px_rgba(0,0,0,0.18)]"
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
