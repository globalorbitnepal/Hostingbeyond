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
    <span className="hb-ai-nav hb-ai-nav--section inline-flex items-center justify-center gap-2 rounded-full border border-white/80 bg-white/55 text-slate-950 backdrop-blur-xl">
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
    <section className="hb-home-section hb-home-section--mist">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-[-12%] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(147,197,253,0.35),transparent_68%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-8%] bottom-[-20%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.16),transparent_70%)] blur-2xl"
      />

      <div className="hb-shell relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-8 xl:gap-12">
          <motion.div
            className="max-w-xl"
            initial={reduceMotion ? false : { opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <BeyondAiBadge text={data.badge} />
              {data.badgeSecondary ? (
                <span className="rounded-full border border-white/80 bg-white/70 px-3.5 py-1.5 text-[12px] font-bold text-[#673de6] shadow-[0_8px_22px_rgba(79,70,229,0.08)] backdrop-blur-xl">
                  {data.badgeSecondary}
                </span>
              ) : null}
            </div>

            <h2 className="font-heading mt-3 text-[clamp(1.85rem,4vw,3.4rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-[#2f1c6a]">
              {(titleLines.length ? titleLines : [data.title]).map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <span className="block bg-gradient-to-r from-[#2563eb] via-[#673de6] to-[#7c3aed] bg-clip-text text-transparent">
                {data.titleAccent}
              </span>
            </h2>

            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-600 sm:text-[16.5px]">
              {data.description}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-2">
              {data.highlights.map((item) => {
                const Icon = highlightIcons[item.icon] ?? Zap;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-2.5 rounded-2xl border border-white/80 bg-white/70 px-2 py-2 shadow-[0_10px_24px_rgba(15,10,40,0.08)] backdrop-blur-xl sm:flex-col sm:items-center sm:px-2 sm:py-3 sm:text-center"
                  >
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#673de6]">
                      <Icon className="size-[18px]" />
                    </span>
                    <span>
                      <span className="block text-[12px] font-extrabold text-[#2f1c6a]">
                        {item.title}
                      </span>
                      <span className="block text-[11px] text-slate-500">
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
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#673de6] px-6 text-[14px] font-bold text-white shadow-[0_12px_28px_rgba(37,99,235,0.32)]"
              >
                <Sparkles className="size-4" />
                {data.primaryCtaLabel}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={data.secondaryCtaHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#c4b5fd] bg-white px-5 text-[14px] font-bold text-[#2f1c6a] shadow-[0_10px_24px_rgba(15,10,40,0.08)]"
              >
                <Play className="size-4 fill-current" />
                {data.secondaryCtaLabel}
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-semibold text-slate-500">
              {[data.trust1, data.trust2, data.trust3]
                .filter(Boolean)
                .map((item) => (
                  <span key={item} className="inline-flex items-center gap-1">
                    <Check className="size-3.5 text-[#673de6]" />
                    {item}
                  </span>
                ))}
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={reduceMotion ? false : { opacity: 0, x: 36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <BeyondAiSiteStack />
          </motion.div>
        </div>

        <div className="mt-8 grid gap-3 rounded-[28px] border border-white/80 bg-white/70 p-3 shadow-[0_18px_50px_-28px_rgba(15,10,40,0.18)] backdrop-blur-2xl sm:mt-10 sm:grid-cols-2 lg:grid-cols-4 lg:p-4">
          {data.features.map((item) => {
            const Icon = featureIcons[item.icon] ?? Wand2;
            return (
              <article
                key={item.id}
                className="flex gap-3 rounded-2xl px-3 py-3 sm:px-4"
              >
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#673de6]">
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
