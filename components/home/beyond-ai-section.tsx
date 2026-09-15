"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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

import { useTyped } from "@/hooks/use-typed";
import {
  defaultBeyondAiSection,
  type CmsBeyondAiContent,
  type CmsBeyondAiFeature,
  type CmsBeyondAiHighlight,
} from "@/lib/orbit/defaults";
import { GlassBand } from "./glass-video-frame";
import { cn } from "@/lib/utils";

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

const PROMPT = "Create a luxury hotel website with a pool hero";
const HEADLINE = "Azure Pool Retreat";

function DashboardPreview({ content }: { content: CmsBeyondAiContent }) {
  const [cycle, setCycle] = useState(0);
  return (
    <AiCreateFilm
      key={cycle}
      content={content}
      onComplete={() => setCycle((value) => value + 1)}
    />
  );
}

function AiCreateFilm({
  content,
  onComplete,
}: {
  content: CmsBeyondAiContent;
  onComplete: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState(reduceMotion ? 5 : 0);
  const prompt = useTyped(PROMPT, !reduceMotion, reduceMotion, false);
  const headline = useTyped(
    HEADLINE,
    !reduceMotion && phase >= 3,
    reduceMotion,
    false,
  );

  useEffect(() => {
    if (reduceMotion) {
      setPhase(5);
      return;
    }
    const timers = [
      window.setTimeout(() => setPhase(1), 1500),
      window.setTimeout(() => setPhase(2), 2600),
      window.setTimeout(() => setPhase(3), 4200),
      window.setTimeout(() => setPhase(4), 6200),
      window.setTimeout(() => setPhase(5), 7800),
      window.setTimeout(onComplete, 10800),
    ];
    return () => timers.forEach((id) => window.clearTimeout(id));
    // Restart only when this film mounts (parent bumps `key`).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion]);

  return (
    <div className="relative aspect-[16/10] min-h-[260px] w-full overflow-hidden rounded-[32px] border border-white/50 bg-white/12 shadow-[0_32px_70px_-28px_rgba(15,10,40,0.45)] ring-1 ring-white/25 backdrop-blur-2xl sm:min-h-[320px] lg:min-h-[380px]">
      <div className="absolute inset-3 overflow-hidden rounded-[22px] border border-white/40 bg-[#eef1f8] shadow-[0_18px_40px_-24px_rgba(15,10,40,0.45)] sm:inset-4">
        <div className="relative flex h-8 items-center gap-1.5 border-b border-black/5 bg-white/90 px-3">
          <span className="size-2 rounded-full bg-[#ff5f57]" />
          <span className="size-2 rounded-full bg-[#febc2e]" />
          <span className="size-2 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-[10px] font-bold tracking-wide text-slate-500 uppercase">
            {phase < 5 ? "Generating layout" : "Website live"}
          </span>
          <span className="ml-auto h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
            <motion.span
              className="block h-full rounded-full bg-gradient-to-r from-[#2563eb] to-[#673de6]"
              initial={{ width: "8%" }}
              animate={{
                width:
                  phase >= 5
                    ? "100%"
                    : phase >= 4
                      ? "82%"
                      : phase >= 3
                        ? "58%"
                        : phase >= 2
                          ? "36%"
                          : "14%",
              }}
              transition={{ duration: 0.45 }}
            />
          </span>
        </div>

        <div className="relative h-[calc(100%-2rem)] overflow-hidden bg-white">
          {phase >= 1 && phase < 2 ? (
            <div className="absolute inset-4 space-y-3">
              <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
              <div className="h-[42%] animate-pulse rounded-2xl bg-slate-200" />
              <div className="grid grid-cols-3 gap-2">
                <div className="h-16 animate-pulse rounded-xl bg-slate-200" />
                <div className="h-16 animate-pulse rounded-xl bg-slate-200" />
                <div className="h-16 animate-pulse rounded-xl bg-slate-200" />
              </div>
            </div>
          ) : null}

          {phase >= 2 ? (
            <motion.div
              className="absolute inset-0"
              initial={reduceMotion ? false : { opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
            >
              <Image
                src="/images/home/beyond-ai/hotel.png"
                alt="Luxury hotel hero on the generated website"
                fill
                sizes="(max-width: 1024px) 100vw, 52vw"
                unoptimized
                className={cn(
                  "object-cover object-center",
                  !reduceMotion && "hb-video",
                )}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12082a]/70 via-[#12082a]/10 to-black/20" />
            </motion.div>
          ) : null}

          {phase >= 3 ? (
            <motion.div
              className="absolute inset-x-4 top-3 z-10 flex items-center justify-between text-[10px] font-semibold text-white sm:text-[11px]"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span>Stay · Suites · Dining</span>
              <span className="rounded-full bg-white/20 px-2.5 py-1 backdrop-blur-md">
                Book
              </span>
            </motion.div>
          ) : null}

          {phase >= 3 ? (
            <div className="absolute inset-x-4 top-[22%] z-10 sm:top-[26%]">
              <p className="font-heading text-[clamp(1.15rem,2.6vw,1.85rem)] leading-tight font-extrabold tracking-tight text-white drop-shadow">
                {headline}
                {phase === 3 && !reduceMotion ? (
                  <span className="hb-caret ml-0.5 inline-block h-[0.9em] w-[2px] bg-white align-[-2px]" />
                ) : null}
              </p>
              {phase >= 4 ? (
                <motion.p
                  className="mt-1.5 max-w-[28ch] text-[11px] text-white/85 sm:text-[12px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Infinity pool. Ocean light. One prompt.
                </motion.p>
              ) : null}
            </div>
          ) : null}

          {phase >= 4 ? (
            <div className="absolute inset-x-3 bottom-3 z-10 grid grid-cols-3 gap-1.5 sm:inset-x-4 sm:gap-2">
              {["Ocean suite", "Spa dusk", "Private dining"].map(
                (label, cardIndex) => (
                  <motion.p
                    key={label}
                    className="rounded-xl border border-white/40 bg-white/18 px-2 py-2 text-center text-[9px] font-bold text-white backdrop-blur-md sm:text-[10px]"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: cardIndex * 0.12 }}
                  >
                    {label}
                  </motion.p>
                ),
              )}
            </div>
          ) : null}

          {phase >= 5 ? (
            <motion.div
              className="absolute top-3 right-3 z-20 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/92 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Check className="size-3" strokeWidth={2.4} />
              </span>
              <span>
                {content.toastTitle}
                <span className="block text-[10px] font-medium text-slate-400">
                  {content.toastSubtitle}
                </span>
              </span>
            </motion.div>
          ) : null}
        </div>
      </div>

      <div className="absolute inset-x-3 bottom-3 z-30 sm:inset-x-4 sm:bottom-4">
        <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/92 px-3 py-2 shadow-[0_16px_40px_rgba(47,28,106,0.2)] backdrop-blur-xl sm:px-4 sm:py-2.5">
          <Sparkles className="size-4 shrink-0 text-[#673de6]" />
          <p className="min-w-0 flex-1 truncate text-[12px] font-semibold text-[#2f1c6a] sm:text-[14px]">
            {reduceMotion ? PROMPT : prompt}
            <span className="hb-caret ml-0.5 inline-block h-[1em] w-[2px] bg-[#673de6] align-[-2px]" />
          </p>
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-r from-[#2563eb] to-[#673de6] text-sm font-bold text-white sm:size-8">
            →
          </span>
        </div>
      </div>
    </div>
  );
}

export function BeyondAiSection({ content }: { content?: CmsBeyondAiContent }) {
  const data = content ?? defaultBeyondAiSection();
  const titleLines = data.title.split("\n").filter(Boolean);
  const reduceMotion = useReducedMotion();

  return (
    <GlassBand>
      <div className="hb-shell relative z-10">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-8 xl:gap-12">
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

            <h2 className="font-heading mt-3 text-[clamp(1.85rem,4vw,3.4rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-white">
              {(titleLines.length ? titleLines : [data.title]).map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <span className="block bg-gradient-to-r from-[#bfdbfe] via-white to-[#ddd6fe] bg-clip-text text-transparent">
                {data.titleAccent}
              </span>
            </h2>

            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/75 sm:text-[16.5px]">
              {data.description}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-2">
              {data.highlights.map((item) => {
                const Icon = highlightIcons[item.icon] ?? Zap;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-2.5 rounded-2xl border border-white/25 bg-white/12 px-2 py-2 shadow-[0_10px_24px_rgba(15,10,40,0.12)] backdrop-blur-xl sm:flex-col sm:items-center sm:px-2 sm:py-3 sm:text-center"
                  >
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/20 text-white shadow-[0_8px_20px_rgba(15,10,40,0.12)]">
                      <Icon className="size-[18px]" />
                    </span>
                    <span>
                      <span className="block text-[12px] font-extrabold text-white">
                        {item.title}
                      </span>
                      <span className="block text-[11px] text-white/65">
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
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/15 px-5 text-[14px] font-bold text-white shadow-[0_10px_24px_rgba(15,10,40,0.12)] backdrop-blur-xl"
              >
                <Play className="size-4 fill-current" />
                {data.secondaryCtaLabel}
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-semibold text-white/70">
              {[data.trust1, data.trust2, data.trust3]
                .filter(Boolean)
                .map((item) => (
                  <span key={item} className="inline-flex items-center gap-1">
                    <Check className="size-3.5 text-[#93c5fd]" />
                    {item}
                  </span>
                ))}
            </div>
          </motion.div>

          <motion.div
            className="relative pb-8 sm:pb-4 lg:pb-0"
            initial={reduceMotion ? false : { opacity: 0, x: 36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <DashboardPreview content={data} />
          </motion.div>
        </div>

        <div className="mt-6 grid gap-3 rounded-[28px] border border-white/25 bg-white/12 p-3 shadow-[0_18px_50px_-28px_rgba(15,10,40,0.35)] backdrop-blur-2xl sm:mt-8 sm:grid-cols-2 lg:grid-cols-4 lg:p-4">
          {data.features.map((item) => {
            const Icon = featureIcons[item.icon] ?? Wand2;
            return (
              <article
                key={item.id}
                className="flex gap-3 rounded-2xl px-3 py-3 sm:px-4"
              >
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-[14px] font-extrabold tracking-tight text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-white/65">
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </GlassBand>
  );
}
