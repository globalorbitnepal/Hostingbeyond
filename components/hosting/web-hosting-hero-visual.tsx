"use client";

import Image from "next/image";
import { Check, Cloud, Globe, Server, Shield } from "lucide-react";

const FEATURE_PILLS = [
  { icon: Globe, label: "Fast & Secure Hosting" },
  { icon: Shield, label: "99.9% Uptime" },
  { icon: Server, label: "Free Website Migration" },
] as const;

export function WebHostingHeroVisual() {
  return (
    <div
      className="relative w-full rounded-[22px] border-[3px] border-white bg-white p-[3px] shadow-[0_32px_70px_-36px_rgba(0,0,0,0.55)]"
      aria-hidden
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[18px] bg-[#2f1c6a]">
        <Image
          src="/images/hosting/web-hosting-hero-scene.jpg"
          alt=""
          fill
          className="object-cover object-[center_20%]"
          sizes="(max-width: 1024px) 92vw, 540px"
          priority
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#2f1c6a]/35 via-transparent to-[#1e3a8a]/25"
          aria-hidden
        />

        {/* Angular brand accents */}
        <div
          className="pointer-events-none absolute -top-1 -right-1 h-[42%] w-[38%] bg-gradient-to-bl from-[#673de6] to-[#2563eb]"
          style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-1 -left-1 h-[36%] w-[34%] bg-gradient-to-tr from-[#4c1d95] to-[#673de6]/90"
          style={{ clipPath: "polygon(0 100%, 0 0, 100% 100%)" }}
          aria-hidden
        />

        <div className="absolute top-3 right-3 z-[2]">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#673de6] shadow-[0_8px_24px_-8px_rgba(103,61,230,0.8)] ring-2 ring-white/30">
            <Cloud className="size-5 text-white" strokeWidth={2} />
          </div>
        </div>

        <div className="absolute top-4 left-3 z-[2] flex flex-col gap-2 sm:left-4">
          {FEATURE_PILLS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-full border border-white/80 bg-white/95 px-2.5 py-1.5 shadow-[0_8px_20px_-12px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:px-3 sm:py-2"
              >
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f3eeff] text-[#673de6]">
                  <Icon className="size-3.5" strokeWidth={2.25} />
                </span>
                <span className="text-[10px] font-bold text-[#2f1c6a] sm:text-[11px]">
                  {item.label}
                </span>
                <Check
                  className="ml-auto size-3.5 shrink-0 text-emerald-500"
                  strokeWidth={3}
                />
              </div>
            );
          })}
        </div>

        <p
          className="font-heading pointer-events-none absolute top-[38%] left-[28%] z-[1] text-[clamp(1.75rem,5vw,2.75rem)] leading-[0.95] font-extrabold tracking-[-0.02em] text-transparent uppercase"
          style={{
            WebkitTextStroke: "2px rgba(255,255,255,0.92)",
            paintOrder: "stroke fill",
          }}
        >
          Web
          <br />
          Hosting
        </p>

        <div className="absolute right-3 bottom-3 z-[2] w-[min(100%,220px)] rounded-2xl border border-white/70 bg-white/95 p-3 shadow-[0_12px_28px_-16px_rgba(15,23,42,0.4)] backdrop-blur-md sm:right-4 sm:bottom-4">
          <div className="flex items-center gap-3">
            <div
              className="relative size-11 shrink-0 rounded-full"
              style={{
                background:
                  "conic-gradient(#673de6 0deg 86deg, #e9e5f5 86deg 360deg)",
              }}
            >
              <div className="absolute inset-[3px] flex items-center justify-center rounded-full bg-white">
                <Server className="size-4 text-[#673de6]" />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold text-[#2f1c6a]">
                Hosting Setup in Progress
              </p>
              <p className="text-[10px] font-medium text-slate-500">
                12GB out of 50GB
              </p>
            </div>
          </div>
          <div className="mt-2.5">
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[24%] rounded-full bg-gradient-to-r from-[#673de6] to-[#2563eb]" />
            </div>
            <p className="mt-1 text-right text-[9px] font-bold text-[#673de6]">
              24%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
