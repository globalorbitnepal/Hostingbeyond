"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Cloud,
  Globe,
  Play,
  Rocket,
  Sparkles,
  Zap,
} from "lucide-react";

import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";
import {
  defaultBeyondAiCreatorSection,
  type CmsBeyondAiCreatorContent,
  type CmsBeyondAiHighlight,
} from "@/lib/orbit/defaults";

const highlightIcons: Record<CmsBeyondAiHighlight["icon"], typeof Zap> = {
  zap: Zap,
  cloud: Cloud,
  globe: Globe,
  rocket: Rocket,
};

export function BeyondAiCreatorSection({
  content,
}: {
  content?: CmsBeyondAiCreatorContent;
}) {
  const data = content ?? defaultBeyondAiCreatorSection();
  const titleLines = data.title.split("\n").filter(Boolean);

  return (
    <section className="relative isolate overflow-hidden bg-[#f4f8fd] pt-2 pb-14 sm:pt-4 sm:pb-20 lg:pb-24">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f7fbff_0%,#eef4fb_48%,#f4f8fd_100%)]" />
        <div className="absolute top-[8%] right-[-12%] h-[70%] w-[55%] rounded-full bg-[radial-gradient(ellipse,rgba(147,197,253,0.28),transparent_68%)] blur-3xl" />
        <div className="absolute bottom-[-18%] left-[-8%] h-[42%] w-[40%] rounded-full bg-[radial-gradient(ellipse,rgba(167,139,250,0.12),transparent_70%)] blur-3xl" />
      </div>

      <div className="hb-shell relative z-10">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-6 xl:gap-10 2xl:gap-14">
          <div className="order-1 mx-auto w-full max-w-xl lg:mx-0 lg:max-w-none">
            {data.eyebrow ? (
              <p className="text-[12px] font-bold tracking-[0.08em] text-slate-500 uppercase sm:text-[13px]">
                {data.eyebrow}
              </p>
            ) : null}

            <h2 className="font-heading mt-3 text-[clamp(1.75rem,4.6vw,3.35rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-slate-950">
              {titleLines.map((line) => (
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

            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4 sm:gap-3">
              {data.highlights.map((item) => {
                const Icon = highlightIcons[item.icon] ?? Zap;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-2.5 sm:flex-col sm:items-center sm:text-center"
                  >
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-[#2563eb] shadow-[0_8px_20px_rgba(37,80,130,0.08)] backdrop-blur-xl">
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

            <div className="mt-7 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={data.primaryCtaHref}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#4f46e5] px-6 text-[14px] font-bold text-white shadow-[0_12px_28px_rgba(37,99,235,0.32)] sm:w-auto"
              >
                <Sparkles className="size-4" />
                {data.primaryCtaLabel}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={data.secondaryCtaHref}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white/70 px-5 text-[14px] font-bold text-slate-800 shadow-[0_10px_24px_rgba(37,80,130,0.08)] backdrop-blur-xl sm:w-auto"
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

          <div className="relative order-2 -mx-[var(--hb-shell-pad)] h-[300px] w-[calc(100%+2*var(--hb-shell-pad))] sm:mx-0 sm:h-[400px] sm:w-full md:h-[460px] lg:h-[540px] xl:h-[600px] 2xl:h-[660px]">
            {data.imageUrl ? (
              <Image
                src={data.imageUrl}
                alt={data.imageAlt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 50vw"
                unoptimized={isRuntimeMediaSrc(data.imageUrl)}
                className="object-cover object-[78%_center] sm:rounded-none"
              />
            ) : null}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-[28%] bg-gradient-to-r from-[#eef4fb] via-[#eef4fb]/70 to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#f4f8fd] to-transparent"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
