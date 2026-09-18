"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Cloud,
  Gauge,
  Globe,
  Layers,
  Play,
  Rocket,
  Sparkles,
  Users,
  Wand2,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import {
  defaultBeyondAiSection,
  type CmsBeyondAiContent,
  type CmsBeyondAiFeature,
  type CmsBeyondAiHighlight,
} from "@/lib/orbit/defaults";
import { BeyondAiSiteStack } from "./beyond-ai-site-stack";

const highlightIcons: Record<CmsBeyondAiHighlight["icon"], typeof Zap> = {
  zap: Zap,
  cloud: Cloud,
  globe: Globe,
  rocket: Rocket,
};

const featureIcons: Record<CmsBeyondAiFeature["icon"], typeof Wand2> = {
  wand: Wand2,
  layers: Layers,
  users: Users,
  gauge: Gauge,
};

function BeyondAiBadge({ text }: { text: string }) {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  const last = parts.pop() ?? "AI";
  const lead = parts.join(" ");

  return (
    <span className="hb-ai-nav hb-ai-nav--section inline-flex items-center justify-center gap-2 rounded-full border border-white/80 bg-white/80 text-slate-950 backdrop-blur-xl">
      <span className="hb-ai-nav__shine" aria-hidden />
      <Sparkles
        className="hb-ai-nav__spark size-4 shrink-0 text-[#7c3aed]"
        aria-hidden
      />
      <span>
        {lead ? `${lead} ` : null}
        <span className="hb-ai-nav__word">{last}</span>
      </span>
    </span>
  );
}

export function BeyondAiSection({ content }: { content?: CmsBeyondAiContent }) {
  const data = content ?? defaultBeyondAiSection();
  const titleLines = data.title.split("\n").filter(Boolean);
  const reduceMotion = useReducedMotion();

  return (
    <section className="hb-home-section hb-band-purple overflow-hidden">
      <div className="hb-shell relative z-10">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-6 xl:gap-8">
          <motion.div
            className="relative z-10 max-w-xl"
            initial={reduceMotion ? false : { opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <BeyondAiBadge text={data.badge} />
              {data.badgeSecondary ? (
                <span className="rounded-full border border-white/55 bg-white/15 px-3.5 py-1.5 text-[12px] font-bold text-white backdrop-blur-xl">
                  {data.badgeSecondary}
                </span>
              ) : null}
            </div>

            <h2 className="font-heading mt-4 text-[clamp(2rem,4.2vw,3.55rem)] leading-[1.05] font-extrabold tracking-[-0.045em] text-white">
              {(titleLines.length ? titleLines : [data.title]).map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <span className="block text-[#9ad4ff]">{data.titleAccent}</span>
            </h2>

            <p className="mt-4 max-w-md text-[15px] leading-relaxed font-medium text-white/90 sm:text-[16px]">
              {data.description}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {data.highlights.map((item) => {
                const Icon = highlightIcons[item.icon] ?? Zap;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-2 rounded-[22px] border border-white/55 bg-white/20 px-2.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-xl sm:flex-col sm:items-center sm:px-2 sm:py-3.5 sm:text-center"
                  >
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/30 text-white">
                      <Icon className="size-[16px]" />
                    </span>
                    <span>
                      <span className="block text-[11.5px] leading-tight font-extrabold text-white">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-[10.5px] leading-snug text-white/80">
                        {item.subtitle}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={data.primaryCtaHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#2a1570] px-6 text-[14px] font-bold text-white shadow-[0_12px_28px_rgba(15,10,40,0.28)]"
              >
                <Sparkles className="size-4" />
                {data.primaryCtaLabel}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={data.secondaryCtaHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/45 bg-white/10 px-5 text-[14px] font-bold text-white backdrop-blur-md"
              >
                <Play className="size-4 fill-current" />
                {data.secondaryCtaLabel}
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-semibold text-white">
              {[data.trust1, data.trust2, data.trust3]
                .filter(Boolean)
                .map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <Check className="size-3.5" />
                    {item}
                  </span>
                ))}
            </div>
          </motion.div>

          <motion.div
            className="relative lg:-mr-4 xl:-mr-8"
            initial={reduceMotion ? false : { opacity: 0, x: 36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <BeyondAiSiteStack />
          </motion.div>
        </div>

        <div className="mt-8 grid gap-2 rounded-[32px] border border-white/40 bg-white/82 p-3 shadow-[0_18px_50px_-28px_rgba(15,10,40,0.22)] backdrop-blur-2xl sm:mt-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-1 lg:px-5 lg:py-4">
          {data.features.map((item) => {
            const Icon = featureIcons[item.icon] ?? Wand2;
            return (
              <article
                key={item.id}
                className="flex gap-3 rounded-2xl px-3 py-3 sm:px-4"
              >
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-[#d4c8ff] bg-white text-[#673de6]">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-[14px] font-extrabold tracking-tight text-[#2f1c6a]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
