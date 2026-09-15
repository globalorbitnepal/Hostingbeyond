"use client";

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

import { cn } from "@/lib/utils";
import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";
import {
  defaultBeyondAiSection,
  type CmsBeyondAiContent,
  type CmsBeyondAiFeature,
  type CmsBeyondAiHighlight,
  type CmsBeyondAiSite,
} from "@/lib/orbit/defaults";
import {
  GlassBand,
  GlassPromptBar,
  GlassVideoStage,
} from "./glass-video-frame";

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

function SitePhoto({
  site,
  className,
  sizes,
  priority = false,
}: {
  site: CmsBeyondAiSite;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  if (!site.imageUrl) {
    return (
      <div
        className={cn(
          "h-full w-full bg-[linear-gradient(160deg,#c4b5fd_0%,#673de6_48%,#2f1c6a_100%)]",
          className,
        )}
      />
    );
  }

  return (
    <div className="relative h-full w-full">
      <Image
        src={site.imageUrl}
        alt={site.imageAlt || site.name}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={isRuntimeMediaSrc(site.imageUrl)}
        className={cn("object-cover object-center", className)}
      />
    </div>
  );
}

function DashboardPreview({ content }: { content: CmsBeyondAiContent }) {
  const sites = [...content.sites]
    .filter((site) => site.visible !== false)
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);

  return (
    <GlassVideoStage
      src="/images/home/beyond-ai-stage.png"
      alt="Designer building a website with Beyond AI"
      overlay={
        <GlassPromptBar text="Create a stunning hotel website with AI" />
      }
    >
      <div className="absolute top-4 right-4 z-20 hidden items-center gap-2 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-[0_10px_28px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:flex">
        <span className="inline-flex size-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Check className="size-3" strokeWidth={2.4} />
        </span>
        <span>
          {content.toastTitle}
          <span className="block text-[10px] font-medium text-slate-400">
            {content.toastSubtitle}
          </span>
        </span>
      </div>
      {sites.length ? (
        <div className="absolute bottom-20 left-4 z-20 hidden gap-2 sm:flex">
          {sites.map((site) => (
            <span
              key={site.id}
              className="relative h-14 w-20 overflow-hidden rounded-xl border border-white/50 shadow-lg"
            >
              <SitePhoto site={site} sizes="80px" className="hb-video" />
            </span>
          ))}
        </div>
      ) : null}
    </GlassVideoStage>
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
