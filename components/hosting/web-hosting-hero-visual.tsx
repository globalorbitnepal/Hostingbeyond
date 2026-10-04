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
      className="relative h-[min(52vw,380px)] w-full sm:h-[min(48vw,400px)] lg:absolute lg:inset-y-0 lg:right-0 lg:left-[-8%] lg:h-auto lg:min-h-[420px]"
      aria-hidden
    >
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/images/hosting/web-hosting-hero-scene.jpg"
          alt=""
          fill
          className="scale-[1.12] object-cover object-[55%_28%]"
          sizes="(max-width: 1024px) 100vw, 58vw"
          priority
        />

        {/* Feather into hero — no mask, no card edge */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              "linear-gradient(100deg, #2f1c6a 0%, #2f1c6a 10%, rgba(47,28,106,0.92) 20%, rgba(47,28,106,0.55) 36%, rgba(47,28,106,0.15) 50%, transparent 62%)",
              "linear-gradient(0deg, rgba(53,32,111,0.55) 0%, transparent 22%, transparent 78%, rgba(47,28,106,0.35) 100%)",
              "linear-gradient(270deg, transparent 0%, rgba(30,58,138,0.12) 100%)",
            ].join(", "),
          }}
        />

        <div
          className="pointer-events-none absolute top-0 right-0 h-[46%] w-[44%] bg-gradient-to-bl from-[#673de6]/85 via-[#5b32d6]/70 to-transparent"
          style={{ clipPath: "polygon(100% 0, 35% 0, 100% 75%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-[8%] h-[40%] w-[38%] bg-gradient-to-tr from-[#4c1d95]/80 via-[#673de6]/50 to-transparent"
          style={{ clipPath: "polygon(0 100%, 0 25%, 85% 100%)" }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1]">
        <div className="absolute top-[10%] right-[8%] sm:top-[8%] sm:right-[10%]">
          <div className="relative">
            <div
              className="absolute -inset-2 rounded-2xl bg-[#673de6]/40 blur-lg"
              aria-hidden
            />
            <div className="relative flex size-10 items-center justify-center rounded-xl bg-[#673de6] shadow-[0_10px_28px_-8px_rgba(103,61,230,0.75)] sm:size-11">
              <Cloud className="size-5 text-white" strokeWidth={2} />
            </div>
          </div>
        </div>

        <div className="absolute top-[14%] left-[14%] flex flex-col gap-2 sm:left-[18%] sm:gap-2.5">
          {FEATURE_PILLS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex w-[max(168px,46vw)] max-w-[220px] items-center gap-2 rounded-full bg-white px-2.5 py-1.5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)] sm:w-auto sm:px-3 sm:py-2"
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
          className="font-heading absolute top-[42%] left-[20%] text-[clamp(1.65rem,4.5vw,2.85rem)] leading-[0.92] font-extrabold tracking-[-0.03em] text-transparent uppercase sm:left-[24%]"
          style={{
            WebkitTextStroke: "2px rgba(255,255,255,0.88)",
            paintOrder: "stroke fill",
          }}
        >
          Web
          <br />
          Hosting
        </p>

        <div className="absolute right-[10%] bottom-[12%] w-[min(92%,210px)] rounded-2xl bg-white p-3 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.45)] sm:right-[12%] sm:bottom-[14%]">
          <div className="flex items-center gap-3">
            <div
              className="relative size-11 shrink-0 rounded-full"
              style={{
                background:
                  "conic-gradient(#673de6 0deg 86deg, #ebe6f7 86deg 360deg)",
              }}
            >
              <div className="absolute inset-[3px] flex items-center justify-center rounded-full bg-white">
                <Server className="size-4 text-[#673de6]" />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] leading-tight font-extrabold text-[#2f1c6a]">
                Hosting Setup in Progress
              </p>
              <p className="text-[10px] font-medium text-slate-500">
                12GB out of 50GB
              </p>
            </div>
          </div>
          <div className="mt-2.5">
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/90">
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
