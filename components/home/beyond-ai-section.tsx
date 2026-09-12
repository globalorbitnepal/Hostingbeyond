"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Cloud,
  FolderKanban,
  Gauge,
  Globe,
  Layers,
  LayoutGrid,
  Play,
  Rocket,
  Sparkles,
  Users,
  Wand2,
  Zap,
} from "lucide-react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";
import {
  defaultBeyondAiSection,
  type CmsBeyondAiContent,
  type CmsBeyondAiFeature,
  type CmsBeyondAiHighlight,
  type CmsBeyondAiSite,
} from "@/lib/orbit/defaults";

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

const tools = [
  { label: "AI Generate", icon: Sparkles },
  { label: "Customize", icon: LayoutGrid },
  { label: "Templates", icon: FolderKanban },
  { label: "Publish", icon: Globe },
];

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
          "h-full w-full bg-[linear-gradient(160deg,#7dd3fc_0%,#4f46e5_48%,#0f172a_100%)]",
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

function SiteSlider({ sites }: { sites: CmsBeyondAiSite[] }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const slides = sites.filter((site) => site.visible !== false);

  useEffect(() => {
    if (reduceMotion || hovered || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [hovered, reduceMotion, slides.length]);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [index, slides.length]);

  if (!slides.length) return null;

  const active = slides[index] ?? slides[0];

  function go(direction: -1 | 1) {
    setIndex(
      (current) => (current + direction + slides.length) % slides.length,
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-[22px] border border-white/70 bg-slate-950/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[16/10] min-h-[210px] w-full sm:min-h-[240px]">
        {slides.map((slide, slideIndex) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
              slideIndex === index
                ? "z-[1] scale-100 opacity-100"
                : "pointer-events-none z-0 scale-[1.03] opacity-0",
              reduceMotion && "transition-none",
            )}
          >
            <SitePhoto
              site={slide}
              sizes="(max-width: 1024px) 100vw, 560px"
              priority={slideIndex === 0}
            />
          </div>
        ))}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,transparent_28%,rgba(15,23,42,0.42)_100%)]"
        />
        <div className="absolute right-3 bottom-3 left-3 z-10 flex items-end justify-between gap-3">
          <div className="min-w-0 rounded-2xl border border-white/25 bg-white/18 px-3 py-2 backdrop-blur-xl">
            <p className="truncate text-[13px] font-extrabold text-white">
              {active.name}
            </p>
            <p className="truncate text-[11px] text-white/80">
              {active.domain}
            </p>
          </div>
          <p className="inline-flex items-center gap-1 rounded-full border border-emerald-200/40 bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-[0_8px_18px_rgba(16,185,129,0.28)]">
            <span className="size-1.5 rounded-full bg-white" />
            {active.status}
          </p>
        </div>
      </div>

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous website"
            onClick={() => go(-1)}
            className="absolute top-1/2 left-2 z-20 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/80 text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.16)] backdrop-blur-xl"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next website"
            onClick={() => go(1)}
            className="absolute top-1/2 right-2 z-20 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/80 text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.16)] backdrop-blur-xl"
          >
            <ChevronRight className="size-4" />
          </button>
          <div className="absolute top-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Show ${slide.name}`}
                onClick={() => setIndex(slideIndex)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  slideIndex === index
                    ? "w-5 bg-white"
                    : "w-1.5 bg-white/55 hover:bg-white/80",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function DashboardPreview({ content }: { content: CmsBeyondAiContent }) {
  const sites = [...content.sites]
    .filter((site) => site.visible !== false)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="relative mx-auto w-full max-w-[640px] lg:ml-auto lg:max-w-none">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-[40px] bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.16),transparent_62%)] blur-2xl"
      />

      <div className="absolute -top-3 right-2 z-20 hidden items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-[0_10px_28px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:flex md:right-8">
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

      <div className="absolute top-16 -right-2 z-20 hidden flex-col gap-2 xl:flex">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.label}
              className="flex size-[68px] flex-col items-center justify-center rounded-2xl border border-white/80 bg-white/70 text-center shadow-[0_12px_30px_rgba(37,80,130,0.12)] backdrop-blur-xl"
            >
              <Icon className="size-4 text-[#4f46e5]" />
              <span className="mt-1 text-[9px] font-bold text-slate-600">
                {tool.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/55 shadow-[0_32px_80px_-28px_rgba(37,80,130,0.5)] backdrop-blur-2xl sm:rounded-[32px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.55),transparent_38%)]"
        />
        <div className="relative flex items-center gap-2 border-b border-white/70 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          <div className="ml-3 flex min-w-0 items-center gap-4 text-[11px] font-semibold text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-800">
              <Sparkles className="size-3.5 text-[#4f46e5]" />
              {content.badge}
            </span>
            <span className="hidden text-[#2563eb] sm:inline">Sites</span>
            <span className="hidden md:inline">Templates</span>
            <span className="hidden md:inline">AI Assistant</span>
          </div>
        </div>

        <div className="relative p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-[15px] font-extrabold tracking-tight text-slate-900">
              {content.dashboardTitle}
            </h3>
            <span className="inline-flex h-8 items-center rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-3 text-[11px] font-bold text-white">
              + New Website
            </span>
          </div>
          <SiteSlider sites={sites} />
        </div>
      </div>

      <div className="absolute -bottom-3 left-2 z-20 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/85 px-4 py-3 shadow-[0_14px_36px_rgba(37,80,130,0.16)] backdrop-blur-xl sm:left-8 sm:px-5">
        <div>
          <p className="text-[11px] font-semibold text-slate-400">
            {content.statsLabel}
          </p>
          <p className="text-[28px] leading-none font-extrabold text-slate-950">
            {content.statsValue}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-emerald-600">
            {content.statsHint}
          </p>
        </div>
        <div className="flex h-12 items-end gap-1 pb-0.5">
          {[40, 55, 48, 72, 64, 88, 76].map((h, i) => (
            <span
              key={i}
              className="w-1.5 rounded-full bg-gradient-to-t from-[#2563eb] to-[#7dd3fc]"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      <div className="absolute right-2 -bottom-2 z-20 hidden w-[210px] rounded-2xl border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(237,233,254,0.9))] p-3.5 shadow-[0_16px_40px_rgba(79,70,229,0.16)] backdrop-blur-xl sm:block md:right-12">
        <p className="mb-2 flex items-center gap-1.5 text-[12px] font-extrabold text-slate-900">
          <Cloud className="size-3.5 text-[#2563eb]" />
          {content.saasTitle}
        </p>
        {content.saasItems.map((item) => (
          <p
            key={item}
            className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600"
          >
            <Check className="size-3 text-[#2563eb]" />
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

export function BeyondAiSection({ content }: { content?: CmsBeyondAiContent }) {
  const data = content ?? defaultBeyondAiSection();
  const titleLines = data.title.split("\n").filter(Boolean);

  return (
    <section className="relative isolate overflow-hidden bg-[#f4f8fd] pt-4 pb-16 sm:pt-6 sm:pb-20 lg:pb-24">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f4f8fd_0%,#eef4fb_40%,#f7fbff_100%)]" />
        <div className="absolute top-[-8%] right-[-8%] h-[52%] w-[48%] rounded-full bg-[radial-gradient(ellipse,rgba(147,197,253,0.32),transparent_68%)] blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[42%] w-[40%] rounded-full bg-[radial-gradient(ellipse,rgba(167,139,250,0.14),transparent_70%)] blur-3xl" />
      </div>

      <div className="hb-shell relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-8 xl:gap-12">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <BeyondAiBadge text={data.badge} />
              {data.badgeSecondary ? (
                <span className="rounded-full border border-white/80 bg-white/70 px-3.5 py-1.5 text-[12px] font-bold text-[#4f46e5] shadow-[0_8px_22px_rgba(79,70,229,0.08)] backdrop-blur-xl">
                  {data.badgeSecondary}
                </span>
              ) : null}
            </div>

            <h2 className="font-heading mt-6 text-[clamp(1.85rem,4vw,3.4rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-slate-950">
              {(titleLines.length ? titleLines : [data.title]).map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <span className="block bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
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
                    className="flex items-start gap-2.5 rounded-2xl border border-white/70 bg-white/55 px-2 py-2 shadow-[0_10px_24px_rgba(37,80,130,0.06)] backdrop-blur-xl sm:flex-col sm:items-center sm:bg-transparent sm:px-0 sm:py-0 sm:text-center sm:shadow-none"
                  >
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/80 text-[#2563eb] shadow-[0_8px_20px_rgba(37,80,130,0.08)]">
                      <Icon className="size-[18px]" />
                    </span>
                    <span>
                      <span className="block text-[12px] font-extrabold text-slate-900">
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
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#4f46e5] px-6 text-[14px] font-bold text-white shadow-[0_12px_28px_rgba(37,99,235,0.32)]"
              >
                <Sparkles className="size-4" />
                {data.primaryCtaLabel}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={data.secondaryCtaHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/80 bg-white/80 px-5 text-[14px] font-bold text-slate-800 shadow-[0_10px_24px_rgba(37,80,130,0.08)] backdrop-blur-xl"
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
                    <Check className="size-3.5 text-[#2563eb]" />
                    {item}
                  </span>
                ))}
            </div>
          </div>

          <div className="relative pb-16 sm:pb-10 lg:pb-8">
            <DashboardPreview content={data} />
          </div>
        </div>

        <div className="mt-10 grid gap-3 rounded-[28px] border border-white/80 bg-white/60 p-3 shadow-[0_18px_50px_-28px_rgba(37,80,130,0.32)] backdrop-blur-2xl sm:mt-14 sm:grid-cols-2 lg:grid-cols-4 lg:p-4">
          {data.features.map((item) => {
            const Icon = featureIcons[item.icon] ?? Wand2;
            return (
              <article
                key={item.id}
                className="flex gap-3 rounded-2xl px-3 py-3 sm:px-4"
              >
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2563eb]">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-[14px] font-extrabold tracking-tight text-slate-950">
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
