"use client";

import Image from "next/image";
import { Check, Cloud, Globe, Server, Shield } from "lucide-react";

const FEATURE_PILLS = [
  { icon: Globe, label: "Fast & Secure Hosting" },
  { icon: Shield, label: "99.9% Uptime" },
  { icon: Server, label: "Free Website Migration" },
] as const;

const SCENE = "/images/hosting/web-hosting-hero-scene-v2.jpg";

/**
 * Full-bleed hero art layer — no card frame. Parent must be `position: relative` + overflow hidden.
 */
export function WebHostingHeroVisual({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <div className="absolute inset-0">
        <Image
          src={SCENE}
          alt=""
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 60vw"
          className="object-cover object-[72%_center] lg:object-[68%_42%]"
        />

        {/* Seamless merge with section purple — wide soft feather */}
        <div
          className="absolute inset-0"
          style={{
            background: [
              "linear-gradient(95deg, #2f1c6a 0%, #2f1c6a 6%, rgba(47,28,106,0.97) 14%, rgba(47,28,106,0.75) 28%, rgba(47,28,106,0.35) 42%, rgba(47,28,106,0.08) 52%, transparent 58%)",
              "linear-gradient(180deg, rgba(47,28,106,0.65) 0%, transparent 16%, transparent 84%, rgba(53,32,111,0.5) 100%)",
            ].join(", "),
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#1e3a8a]/25" />

        <div
          className="absolute top-0 right-0 h-[50%] w-[48%] bg-gradient-to-bl from-[#673de6] via-[#5b32d6]/80 to-transparent opacity-90"
          style={{ clipPath: "polygon(100% 0, 28% 0, 100% 72%)" }}
        />
        <div
          className="absolute bottom-0 left-[5%] h-[44%] w-[42%] bg-gradient-to-tr from-[#4c1d95] via-[#673de6]/65 to-transparent"
          style={{ clipPath: "polygon(0 100%, 0 20%, 90% 100%)" }}
        />
      </div>

      <div className="absolute inset-0 z-[1]">
        <div className="absolute top-[11%] left-[10%] flex flex-col gap-2.5 sm:left-[12%] lg:left-[14%]">
          {FEATURE_PILLS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex w-[210px] max-w-[calc(100vw-3rem)] items-center gap-2.5 rounded-full bg-white py-2 pr-3 pl-2 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.4)] sm:w-[230px]"
              >
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f3eeff] text-[#673de6]">
                  <Icon className="size-4" strokeWidth={2.2} />
                </span>
                <span className="text-[11px] font-bold text-[#2f1c6a]">
                  {item.label}
                </span>
                <Check
                  className="ml-auto size-4 shrink-0 text-emerald-500"
                  strokeWidth={3}
                />
              </div>
            );
          })}
        </div>

        <p
          className="font-heading absolute top-[44%] left-[18%] text-[clamp(2rem,5.5vw,3.25rem)] leading-[0.9] font-extrabold tracking-[-0.03em] text-transparent uppercase lg:left-[22%]"
          style={{
            WebkitTextStroke: "2.25px rgba(255,255,255,0.9)",
            paintOrder: "stroke fill",
          }}
        >
          Web
          <br />
          Hosting
        </p>

        <div className="absolute top-[9%] right-[10%] lg:right-[12%]">
          <div className="relative flex size-11 items-center justify-center rounded-xl bg-[#673de6] shadow-[0_12px_32px_-10px_rgba(103,61,230,0.85)]">
            <div
              className="absolute -inset-3 rounded-2xl bg-[#673de6]/35 blur-xl"
              aria-hidden
            />
            <Cloud className="relative size-5 text-white" strokeWidth={2} />
          </div>
        </div>

        <div className="absolute right-[8%] bottom-[14%] w-[220px] max-w-[calc(100%-2rem)] rounded-2xl bg-white p-3.5 shadow-[0_18px_44px_-22px_rgba(0,0,0,0.5)] lg:right-[10%]">
          <div className="flex items-center gap-3">
            <div
              className="relative size-12 shrink-0 rounded-full"
              style={{
                background:
                  "conic-gradient(#673de6 0deg 86deg, #e8e4f4 86deg 360deg)",
              }}
            >
              <div className="absolute inset-[4px] flex items-center justify-center rounded-full bg-white">
                <Server className="size-4 text-[#673de6]" />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[12px] leading-tight font-extrabold text-[#2f1c6a]">
                Hosting Setup in Progress
              </p>
              <p className="text-[10px] font-medium text-slate-500">
                12GB out of 50GB
              </p>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[24%] rounded-full bg-gradient-to-r from-[#673de6] to-[#2563eb]" />
            </div>
            <p className="mt-1 text-right text-[10px] font-bold text-[#673de6]">
              24%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
