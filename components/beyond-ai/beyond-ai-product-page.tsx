"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { BeyondAiFaqs } from "@/components/beyond-ai/beyond-ai-faqs";
import { BeyondAiPremiumVideo } from "@/components/beyond-ai/beyond-ai-premium-video";
import { BeyondAiPricingMockup } from "@/components/beyond-ai/beyond-ai-pricing-mockup";
import type { CmsBeyondAiPageContent } from "@/lib/orbit/beyond-ai-page-content";
import { cn } from "@/lib/utils";

function HeroDemo({ reduce }: { reduce: boolean }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setPhase((p) => (p + 1) % 3), 4200);
    return () => clearInterval(t);
  }, [reduce]);

  const steps = [
    "Structure created",
    "Pages generated",
    "Responsive layout",
    "SEO optimized",
    "Ready to preview",
  ];

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/20 bg-[#0c0618]/80 p-5 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(103,61,230,0.35),transparent_55%)]"
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
          <span className="text-[13px] font-extrabold text-white">
            Beyond AI
          </span>
          <span className="rounded-full bg-[#673de6]/30 px-2 py-0.5 text-[10px] font-bold text-[#c7d7ff]">
            Workspace
          </span>
        </div>
        <p className="mt-4 text-[12px] font-bold text-white/50 uppercase">
          What do you want to build?
        </p>
        <p className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-[13px] leading-relaxed text-white/90">
          Create a premium hotel website with booking, gallery, rooms and SEO
          optimized pages.
        </p>
        <p className="mt-3 text-[11px] font-semibold text-white/45">
          Model: Claude
        </p>
        <div className="mt-4 flex gap-2">
          <span className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-[#673de6] to-[#7c3aed] text-[13px] font-extrabold text-white">
            Generate
          </span>
        </div>
        {phase >= 1 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 space-y-2 border-t border-white/10 pt-4"
          >
            <p className="text-[12px] font-bold text-[#a78bfa]">
              {phase === 1 ? "Generating website…" : "Generation complete"}
            </p>
            {steps.map((s, i) => (
              <p
                key={s}
                className={cn(
                  "flex items-center gap-2 text-[12px]",
                  phase === 2 || i < 3 ? "text-white/85" : "text-white/40",
                )}
              >
                <Check className="size-3.5 text-emerald-400" aria-hidden />
                {s}
              </p>
            ))}
            {phase === 2 ? (
              <button
                type="button"
                className="mt-2 inline-flex h-9 items-center rounded-full bg-white px-4 text-[12px] font-extrabold text-[#2f1c6a]"
              >
                Preview website
              </button>
            ) : null}
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

export function BeyondAiProductPage({
  content,
}: {
  content: CmsBeyondAiPageContent;
}) {
  const reduce = useReducedMotion();

  return (
    <div className="overflow-x-hidden bg-[#f4f7ff]">
      <section className="hb-band-purple relative overflow-hidden pt-10 pb-14 sm:pt-14 sm:pb-20">
        <div className="hb-shell relative z-10 grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="max-w-xl">
            <p className="text-[12px] font-extrabold tracking-[0.22em] text-white/60 uppercase">
              {content.heroEyebrow}
            </p>
            <h1 className="font-heading mt-3 text-[clamp(2rem,4.8vw,3.5rem)] leading-[1.05] font-extrabold tracking-[-0.045em] text-white">
              {content.heroTitle}
              <br />
              <span className="text-[#c7d7ff]">{content.heroTitleAccent}</span>
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed font-medium text-white/88 sm:text-[17px]">
              {content.heroDescription}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={content.heroPrimaryHref}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[14px] font-extrabold text-[#2f1c6a] shadow-lg"
              >
                {content.heroPrimaryLabel}
                <ArrowRight className="size-4" />
              </Link>
              <a
                href={content.heroSecondaryHref}
                className="inline-flex h-12 items-center rounded-full border border-white/35 px-6 text-[14px] font-extrabold text-white hover:bg-white/10"
              >
                {content.heroSecondaryLabel}
              </a>
            </div>
          </div>
          <HeroDemo reduce={Boolean(reduce)} />
        </div>
      </section>

      <BeyondAiPricingMockup content={content} />
      <BeyondAiPremiumVideo content={content} />
      <BeyondAiFaqs content={content} />
    </div>
  );
}
