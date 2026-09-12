"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Globe,
  Layers,
  Play,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";
import {
  defaultAiAssistantSection,
  type CmsAiAssistantContent,
  type CmsAiAssistantHighlight,
  type CmsAiAssistantPrompt,
  type CmsAiAssistantStat,
} from "@/lib/orbit/defaults";

const highlightIcons: Record<CmsAiAssistantHighlight["icon"], typeof Zap> = {
  zap: Zap,
  layers: Layers,
  shield: Shield,
  users: Users,
};

const promptIcons: Record<CmsAiAssistantPrompt["icon"], typeof Globe> = {
  globe: Globe,
  layers: Layers,
  search: Search,
  refresh: RefreshCw,
};

const statIcons: Record<CmsAiAssistantStat["icon"], typeof Globe> = {
  globe: Globe,
  layers: Layers,
  users: Users,
};

function TypeLine({
  text,
  speed = 46,
  delay = 200,
  loop = true,
  className,
  onCycleDone,
}: {
  text: string;
  speed?: number;
  delay?: number;
  loop?: boolean;
  className?: string;
  onCycleDone?: () => void;
}) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeout = 0;

    function type(from = 0) {
      if (cancelled) return;
      if (from === 0) {
        setShown("");
        setDone(false);
      }
      if (from >= text.length) {
        setDone(true);
        onCycleDone?.();
        if (loop) {
          timeout = window.setTimeout(() => type(0), 2600);
        }
        return;
      }
      timeout = window.setTimeout(
        () => {
          if (cancelled) return;
          setShown(text.slice(0, from + 1));
          type(from + 1);
        },
        from === 0 ? delay : speed,
      );
    }

    type(0);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
    // Restart only when the copy changes — not when parent re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onCycleDone is a notify callback
  }, [text, speed, delay, loop]);

  return (
    <span className={className}>
      {shown}
      <span
        className={`ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-current ${
          done ? "animate-pulse" : ""
        }`}
      />
    </span>
  );
}

function AssistantChat({ content }: { content: CmsAiAssistantContent }) {
  const [helloDone, setHelloDone] = useState(false);
  const firstPrompt = content.prompts[0]?.label ?? "I want to create a website";

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white/70 shadow-[0_32px_80px_-28px_rgba(37,80,130,0.45)] backdrop-blur-2xl sm:rounded-[32px]">
      <div className="flex items-center justify-between gap-3 border-b border-white/70 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[#38bdf8] to-[#2563eb] text-white">
            <Sparkles className="size-4" />
          </span>
          <span>
            <span className="block text-[13px] font-extrabold text-slate-900">
              {content.botName}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {content.botStatus}
            </span>
          </span>
        </div>
        <span className="grid grid-cols-3 gap-0.5 p-1">
          {Array.from({ length: 9 }).map((_, index) => (
            <span key={index} className="size-1 rounded-full bg-slate-300" />
          ))}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div className="max-w-[92%] rounded-2xl bg-[#eef4ff] px-3.5 py-3">
          <p className="text-[15px] font-extrabold text-slate-900">
            <TypeLine
              text={content.helloTitle}
              speed={70}
              delay={240}
              onCycleDone={() => setHelloDone(true)}
            />
          </p>
          <p className="mt-1 min-h-[18px] text-[12px] text-slate-500">
            {helloDone ? (
              <TypeLine
                text={content.helloSubtitle}
                speed={28}
                delay={80}
                loop={false}
              />
            ) : (
              "\u00a0"
            )}
          </p>
        </div>

        <div className="space-y-2">
          {content.prompts.map((prompt, index) => {
            const Icon = promptIcons[prompt.icon] ?? Globe;
            const isFirst = index === 0;
            return (
              <button
                key={prompt.id}
                type="button"
                className="flex w-full items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-2 text-left text-[12px] font-semibold text-slate-700 shadow-[0_8px_18px_rgba(37,80,130,0.06)]"
              >
                <Icon className="size-3.5 shrink-0 text-[#2563eb]" />
                {isFirst ? (
                  <TypeLine
                    text={firstPrompt}
                    speed={36}
                    delay={900}
                    loop
                    className="min-w-0 truncate"
                  />
                ) : (
                  <span className="truncate">{prompt.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AssistantStage({ content }: { content: CmsAiAssistantContent }) {
  return (
    <div className="relative mx-auto min-h-[520px] w-full max-w-[640px] sm:min-h-[580px] lg:ml-auto lg:min-h-[600px] lg:max-w-none">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-[40px] bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.16),transparent_62%)] blur-2xl"
      />

      {content.imageUrl ? (
        <div className="absolute right-[-8%] bottom-[-8%] z-10 h-[108%] w-[92%] sm:right-[-4%] sm:w-[82%] lg:w-[78%]">
          <Image
            src={content.imageUrl}
            alt={content.imageAlt}
            fill
            priority
            sizes="(max-width: 1024px) 90vw, 50vw"
            unoptimized={
              isRuntimeMediaSrc(content.imageUrl) ||
              content.imageUrl.endsWith(".png")
            }
            className="[mask-image:radial-gradient(ellipse_78%_82%_at_62%_48%,#000_56%,transparent_84%)] object-contain object-bottom [-webkit-mask-image:radial-gradient(ellipse_78%_82%_at_62%_48%,#000_56%,transparent_84%)]"
          />
        </div>
      ) : null}

      <div className="absolute top-[12%] left-0 z-20 w-[86%] max-w-[340px] sm:top-[16%] sm:w-[54%]">
        <AssistantChat content={content} />
      </div>

      {content.handwrittenNote ? (
        <p className="absolute top-2 right-2 z-30 hidden max-w-[140px] text-right font-serif text-[13px] leading-snug text-[#60a5fa] italic xl:block">
          {content.handwrittenNote.split("\n").map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
      ) : null}

      <div className="absolute top-[28%] right-0 z-30 hidden w-[168px] flex-col gap-2 xl:flex">
        {content.stats.map((stat) => {
          const Icon = statIcons[stat.icon] ?? Globe;
          return (
            <div
              key={stat.id}
              className="flex items-center gap-2 rounded-2xl border border-white/80 bg-white/80 px-2.5 py-2 shadow-[0_12px_30px_rgba(37,80,130,0.12)] backdrop-blur-xl"
            >
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2563eb]">
                <Icon className="size-4" />
              </span>
              <span>
                <span className="block text-[11px] font-extrabold text-slate-900">
                  {stat.title}
                </span>
                <span className="block text-[10px] text-slate-500">
                  {stat.subtitle}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AiAssistantSection({
  content,
}: {
  content?: CmsAiAssistantContent;
}) {
  const data = content ?? defaultAiAssistantSection();

  return (
    <section className="relative isolate overflow-hidden bg-[#f4f8fd] pt-4 pb-16 sm:pt-6 sm:pb-20 lg:pb-24">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f4f8fd_0%,#eef4fb_40%,#f7fbff_100%)]" />
        <div className="absolute top-[-8%] right-[-8%] h-[52%] w-[48%] rounded-full bg-[radial-gradient(ellipse,rgba(147,197,253,0.32),transparent_68%)] blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[42%] w-[40%] rounded-full bg-[radial-gradient(ellipse,rgba(167,139,250,0.14),transparent_70%)] blur-3xl" />
      </div>

      <div className="hb-shell relative z-10">
        <div className="mb-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] font-bold text-slate-600 sm:mb-10 sm:gap-x-7">
          {data.partners.map((partner) => (
            <span key={partner.id} className="inline-flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-[#4f46e5]" />
              {partner.label}
            </span>
          ))}
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-8 xl:gap-12">
          <div className="max-w-xl">
            <span className="hb-ai-nav hb-ai-nav--section inline-flex items-center justify-center gap-2 rounded-full border border-white/80 bg-white/55 text-slate-950 backdrop-blur-xl">
              <span className="hb-ai-nav__shine" aria-hidden />
              <Sparkles
                className="hb-ai-nav__spark size-4 shrink-0 text-[#7c3aed]"
                aria-hidden
              />
              <span>{data.badge}</span>
            </span>

            <h2 className="font-heading mt-6 text-[clamp(1.85rem,4vw,3.4rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-slate-950">
              <span className="block">{data.title}</span>
              <span className="block bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
                {data.titleAccent}
              </span>
            </h2>

            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-600 sm:text-[16.5px]">
              {data.description}
            </p>

            <div className="mt-6 space-y-3">
              {data.highlights.map((item) => {
                const Icon = highlightIcons[item.icon] ?? Zap;
                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/80 text-[#2563eb] shadow-[0_8px_20px_rgba(37,80,130,0.08)]">
                      <Icon className="size-[18px]" />
                    </span>
                    <span>
                      <span className="block text-[14px] font-extrabold text-slate-900">
                        {item.title}
                      </span>
                      <span className="block text-[13px] text-slate-500">
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
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-6 text-[14px] font-bold text-white shadow-[0_12px_28px_rgba(37,99,235,0.32)]"
              >
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
          </div>

          <div className="relative pb-10 sm:pb-8">
            <AssistantStage content={data} />
          </div>
        </div>
      </div>
    </section>
  );
}
