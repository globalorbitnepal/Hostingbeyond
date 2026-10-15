"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { DomainGuidePillarMotion } from "@/components/domains/domain-guide-pillar-motion";
import type { DomainGuidePillar } from "@/lib/domains/content";

function reveal(delay: number, reduce: boolean | null) {
  if (reduce) {
    return { initial: false as const, animate: { opacity: 1, y: 0 } };
  }
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-30px" },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  };
}

export function DomainGuidePillarsSection({
  heading,
  pillars,
}: {
  heading: string;
  pillars: DomainGuidePillar[];
}) {
  const reduce = useReducedMotion();
  const visible = pillars.filter((p) => p.visible !== false);
  if (visible.length === 0) return null;

  return (
    <section
      id="domain-guide"
      className="relative overflow-x-hidden bg-gradient-to-b from-[#0a0f1f] via-[#0c1229] to-[#07051a] py-14 sm:py-18 lg:py-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 50%, rgba(103,61,230,0.25), transparent 45%), radial-gradient(circle at 90% 20%, rgba(59,130,246,0.18), transparent 40%)",
        }}
      />

      <div className="hb-shell relative z-10">
        <motion.h2
          className="font-heading mx-auto max-w-3xl px-2 text-center text-[clamp(1.65rem,3.2vw,2.45rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-white"
          {...reveal(0, reduce)}
        >
          {heading}
        </motion.h2>

        <ul className="mt-10 grid items-stretch gap-4 sm:mt-12 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((pillar, index) => (
            <motion.li
              key={pillar.id}
              className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04] shadow-[0_28px_70px_-40px_rgba(0,0,0,0.85)] backdrop-blur-md transition duration-300 hover:border-white/20 hover:shadow-[0_36px_80px_-36px_rgba(103,61,230,0.35)] motion-reduce:transform-none"
              {...reveal(0.08 + index * 0.07, reduce)}
            >
              <div className="relative h-[168px] shrink-0 overflow-hidden border-b border-white/10 sm:h-[176px]">
                <DomainGuidePillarMotion pillar={pillar.pillar} />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c1229] via-[#0c1229]/40 to-transparent"
                />
              </div>
              <div className="flex flex-col p-5 sm:p-5">
                <h3 className="text-[16px] font-extrabold tracking-tight text-white sm:text-[17px]">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/75 sm:text-[14px]">
                  {pillar.description}
                </p>
                {pillar.linkLabel ? (
                  <Link
                    href={pillar.linkHref || "#"}
                    className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-[#a5b4fc] transition group-hover:text-white"
                  >
                    {pillar.linkLabel}
                    <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                ) : null}
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
