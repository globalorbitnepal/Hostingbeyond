"use client";

import Image from "next/image";
import { Check, Cloud, Globe, Server, Shield } from "lucide-react";

import { cn } from "@/lib/utils";

const PHOTO = "/images/hosting/web-hosting-hero-photo-v3.jpg";

const FEATURES = [
  { icon: Globe, label: "Fast & Secure Hosting" },
  { icon: Shield, label: "99.9% Uptime" },
  { icon: Server, label: "Free Website Migration" },
] as const;

const glassCard =
  "rounded-2xl border border-white/15 bg-[rgba(18,12,42,0.55)] shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl";

function GlassCheck() {
  return (
    <span
      className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
      aria-hidden
    >
      <Check className="size-3.5 text-white" strokeWidth={3} />
    </span>
  );
}

/** Right-column visual only — parent grid cell provides width (~57% desktop). */
export function WebHostingHeroVisual({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative h-full min-h-[300px] w-full overflow-hidden sm:min-h-[340px] lg:min-h-[520px]",
        className,
      )}
      aria-hidden
    >
      <Image
        src={PHOTO}
        alt=""
        fill
        priority
        sizes="(max-width: 1023px) 100vw, 57vw"
        className="z-[1] object-cover object-[76%_34%]"
      />

      {/* Narrow boundary blend (~80px) — not a full purple wash */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-[min(6.25rem,100px)] bg-gradient-to-r from-[#2f1c6a] via-[#2f1c6a]/40 to-transparent"
        aria-hidden
      />

      <div className="absolute inset-0 z-[3]">
        <div
          className={cn(
            "absolute top-[18%] left-[8%] hidden flex-col gap-2.5 lg:flex",
            "w-[min(290px,38%)]",
          )}
        >
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={cn(
                  glassCard,
                  "flex items-center gap-2.5 px-3 py-2.5",
                )}
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#673de6] text-white">
                  <Icon className="size-4" strokeWidth={2.2} />
                </span>
                <span className="text-[11px] font-semibold text-white">
                  {item.label}
                </span>
                <GlassCheck />
              </div>
            );
          })}
        </div>

        <p
          className={cn(
            "pointer-events-none absolute bottom-[12%] left-[7%] hidden max-w-[8.5rem] opacity-70 select-none lg:block",
            "font-heading text-[clamp(1.35rem,2.2vw,1.75rem)] leading-[0.95] font-extrabold tracking-[-0.03em] text-white/90 uppercase",
          )}
        >
          Web
          <span
            className="mt-0.5 block text-transparent"
            style={{
              WebkitTextStroke: "1.5px rgba(255,255,255,0.75)",
              paintOrder: "stroke fill",
            }}
          >
            Hosting
          </span>
        </p>

        <div className="absolute top-[7%] right-[6%] z-[3]">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#2563eb] shadow-[0_10px_24px_rgba(103,61,230,0.45)] sm:size-11">
            <Cloud className="size-5 text-white" strokeWidth={2} />
          </div>
        </div>

        <div
          className={cn(
            glassCard,
            "absolute right-[5%] bottom-[10%] z-[3] w-[min(240px,78%)] p-3.5",
            "sm:right-[6%] sm:bottom-[11%] sm:w-[230px]",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className="relative size-11 shrink-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, #673de6 0deg 86deg, rgba(255,255,255,0.12) 86deg 360deg)",
              }}
            >
              <div className="absolute inset-[3px] flex items-center justify-center rounded-full bg-[rgba(22,14,50,0.95)]">
                <Server className="size-4 text-[#c4b5fd]" />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[12px] leading-tight font-bold text-white">
                Hosting Setup in Progress
              </p>
              <p className="text-[10px] font-medium text-white/70">
                12GB out of 50GB
              </p>
            </div>
          </div>
          <div className="mt-2.5">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-[24%] rounded-full bg-gradient-to-r from-[#22d3ee] via-[#673de6] to-[#2563eb]" />
            </div>
            <p className="mt-1 text-right text-[10px] font-bold text-[#a5f3fc]">
              24%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
