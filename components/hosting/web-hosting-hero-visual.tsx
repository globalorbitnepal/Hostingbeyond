"use client";

import Image from "next/image";
import { Check, Cloud, Globe, Server, Shield } from "lucide-react";

import { cn } from "@/lib/utils";

const FEATURE_PILLS = [
  { icon: Globe, label: "Fast & Secure Hosting" },
  { icon: Shield, label: "99.9% Uptime" },
  { icon: Server, label: "Free Website Migration" },
] as const;

/** Hero purple — must match web-hosting-premium-hero gradient */
const HERO_PURPLE = "#2f1c6a";
const HERO_PURPLE_MID = "#35206f";

export function WebHostingHeroVisual() {
  return (
    <div
      className={cn(
        "relative w-full lg:-mr-4 xl:-mr-8",
        "[mask-image:linear-gradient(to_right,transparent_0%,black_14%,black_96%,transparent_100%)]",
        "[mask-size:100%_100%] [mask-repeat:no-repeat]",
        "[-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_14%,black_96%,transparent_100%)]",
      )}
      aria-hidden
    >
      <div className="relative aspect-[16/10] min-h-[240px] w-full sm:min-h-[280px] lg:min-h-[320px]">
        <Image
          src="/images/hosting/web-hosting-hero-scene.jpg"
          alt=""
          fill
          className="object-cover object-[62%_22%] sm:object-[58%_20%]"
          sizes="(max-width: 1024px) 100vw, 560px"
          priority
        />

        {/* Blend photo into hero background — no box frame */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(105deg, ${HERO_PURPLE} 0%, ${HERO_PURPLE} 8%, color-mix(in srgb, ${HERO_PURPLE_MID} 88%, transparent) 22%, transparent 48%), linear-gradient(to top, color-mix(in srgb, ${HERO_PURPLE} 75%, transparent) 0%, transparent 28%), linear-gradient(to bottom, transparent 72%, color-mix(in srgb, ${HERO_PURPLE_MID} 55%, transparent) 100%)`,
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#1e3a8a]/25 via-transparent to-[#673de6]/20"
          aria-hidden
        />

        <div
          className="pointer-events-none absolute -top-px -right-px h-[44%] w-[40%] bg-gradient-to-bl from-[#673de6] to-[#2563eb] opacity-95"
          style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-px -left-px h-[38%] w-[36%] bg-gradient-to-tr from-[#4c1d95] to-[#673de6]"
          style={{ clipPath: "polygon(0 100%, 0 0, 100% 100%)" }}
          aria-hidden
        />

        <div className="absolute top-2 right-2 z-[2] sm:top-3 sm:right-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#673de6] shadow-[0_8px_20px_-6px_rgba(103,61,230,0.65)] sm:size-10">
            <Cloud className="size-4 text-white sm:size-5" strokeWidth={2} />
          </div>
        </div>

        <div className="absolute top-[12%] left-[4%] z-[2] flex flex-col gap-1.5 sm:left-[8%] sm:gap-2">
          {FEATURE_PILLS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex max-w-[200px] items-center gap-2 rounded-full border border-white/75 bg-white/92 px-2 py-1 shadow-[0_6px_18px_-10px_rgba(0,0,0,0.45)] backdrop-blur-[2px] sm:max-w-none sm:px-2.5 sm:py-1.5"
              >
                <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[#f3eeff] text-[#673de6] sm:size-7">
                  <Icon className="size-3 sm:size-3.5" strokeWidth={2.25} />
                </span>
                <span className="text-[9px] font-bold text-[#2f1c6a] sm:text-[10px]">
                  {item.label}
                </span>
                <Check
                  className="ml-auto size-3 shrink-0 text-emerald-500"
                  strokeWidth={3}
                />
              </div>
            );
          })}
        </div>

        <p
          className="font-heading pointer-events-none absolute top-[36%] left-[22%] z-[1] text-[clamp(1.5rem,4.2vw,2.5rem)] leading-[0.95] font-extrabold tracking-[-0.02em] text-transparent uppercase sm:left-[26%]"
          style={{
            WebkitTextStroke: "1.75px rgba(255,255,255,0.9)",
            paintOrder: "stroke fill",
          }}
        >
          Web
          <br />
          Hosting
        </p>

        <div className="absolute right-[6%] bottom-[8%] z-[2] w-[min(100%,200px)] rounded-xl border border-white/60 bg-white/92 p-2.5 shadow-[0_10px_24px_-14px_rgba(0,0,0,0.4)] backdrop-blur-sm sm:w-[210px] sm:p-3">
          <div className="flex items-center gap-2.5">
            <div
              className="relative size-10 shrink-0 rounded-full"
              style={{
                background:
                  "conic-gradient(#673de6 0deg 86deg, #e9e5f5 86deg 360deg)",
              }}
            >
              <div className="absolute inset-[3px] flex items-center justify-center rounded-full bg-white">
                <Server className="size-3.5 text-[#673de6]" />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] leading-tight font-extrabold text-[#2f1c6a]">
                Hosting Setup in Progress
              </p>
              <p className="text-[9px] font-medium text-slate-500">
                12GB out of 50GB
              </p>
            </div>
          </div>
          <div className="mt-2">
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[24%] rounded-full bg-gradient-to-r from-[#673de6] to-[#2563eb]" />
            </div>
            <p className="mt-0.5 text-right text-[8px] font-bold text-[#673de6]">
              24%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
