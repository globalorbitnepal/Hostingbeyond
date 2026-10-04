"use client";

import Image from "next/image";
import { Check, Cloud, Globe, Server, Shield } from "lucide-react";

const PHOTO = "/images/hosting/web-hosting-hero-photo.jpg";

const FEATURES = [
  { icon: Globe, label: "Fast & Secure Hosting" },
  { icon: Shield, label: "99.9% Uptime" },
  { icon: Server, label: "Free Website Migration" },
] as const;

function GlassCheck() {
  return (
    <span
      className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/90 shadow-[0_0_12px_rgba(16,185,129,0.45)]"
      aria-hidden
    >
      <Check className="size-3.5 text-white" strokeWidth={3} />
    </span>
  );
}

export function WebHostingHeroVisual({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={PHOTO}
          alt=""
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 58vw"
          className="scale-[1.06] object-cover object-[58%_42%] lg:object-[52%_40%]"
        />

        <div
          className="absolute inset-0 bg-gradient-to-br from-[#3b1d8a]/40 via-transparent to-[#2563eb]/30"
          aria-hidden
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, #2f1c6a 0%, rgba(47,28,106,0.98) 8%, rgba(47,28,106,0.55) 22%, rgba(47,28,106,0.12) 36%, transparent 44%), linear-gradient(0deg, rgba(47,28,106,0.55) 0%, transparent 18%, transparent 82%, rgba(30,58,138,0.35) 100%)",
          }}
          aria-hidden
        />

        <div
          className="absolute top-0 right-0 h-[55%] w-[52%] bg-gradient-to-bl from-[#673de6]/90 via-[#5b32d6]/50 to-transparent"
          style={{ clipPath: "polygon(100% 0, 22% 0, 100% 78%)" }}
          aria-hidden
        />
        <div
          className="absolute bottom-0 left-0 h-[48%] w-[45%] bg-gradient-to-tr from-[#4c1d95]/85 via-[#673de6]/40 to-transparent"
          style={{ clipPath: "polygon(0 100%, 0 15%, 88% 100%)" }}
          aria-hidden
        />
      </div>

      <div className="absolute inset-0 z-[1]">
        <div className="absolute top-[10%] left-[6%] flex flex-col gap-2 sm:left-[8%] sm:gap-2.5 lg:left-[10%]">
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex w-[min(240px,78vw)] items-center gap-2.5 rounded-2xl border border-white/20 bg-[rgba(12,8,32,0.52)] px-3 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:w-[250px]"
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#673de6] text-white shadow-inner">
                  <Icon className="size-4" strokeWidth={2.2} />
                </span>
                <span className="text-[11px] font-semibold text-white sm:text-[12px]">
                  {item.label}
                </span>
                <GlassCheck />
              </div>
            );
          })}
        </div>

        <div className="pointer-events-none absolute top-[38%] left-[22%] select-none sm:left-[26%] lg:left-[28%]">
          <p className="font-heading text-[clamp(2.4rem,6vw,3.75rem)] leading-[0.92] font-extrabold tracking-[-0.04em] text-white uppercase">
            Web
          </p>
          <p
            className="font-heading -mt-1 text-[clamp(2.4rem,6vw,3.75rem)] leading-[0.92] font-extrabold tracking-[-0.04em] text-transparent uppercase"
            style={{
              WebkitTextStroke: "2px rgba(255,255,255,0.92)",
              paintOrder: "stroke fill",
            }}
          >
            Hosting
          </p>
        </div>

        <div className="absolute top-[8%] right-[8%] sm:right-[10%]">
          <div className="relative">
            <div
              className="absolute -inset-4 rounded-3xl bg-[#673de6]/40 blur-2xl"
              aria-hidden
            />
            <div className="relative flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#2563eb] shadow-[0_12px_32px_rgba(103,61,230,0.55)] sm:size-12">
              <Cloud className="size-5 text-white sm:size-6" strokeWidth={2} />
            </div>
          </div>
        </div>

        <div className="absolute right-[6%] bottom-[10%] w-[min(240px,88vw)] rounded-2xl border border-white/20 bg-[rgba(10,8,28,0.58)] p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:right-[8%] sm:bottom-[12%] sm:w-[250px]">
          <div className="flex items-center gap-3">
            <div
              className="relative size-12 shrink-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, #673de6 0deg 86deg, rgba(255,255,255,0.15) 86deg 360deg)",
              }}
            >
              <div className="absolute inset-[3px] flex items-center justify-center rounded-full bg-[rgba(20,12,48,0.9)]">
                <Server className="size-4 text-[#c4b5fd]" />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[12px] leading-tight font-bold text-white">
                Hosting Setup in Progress
              </p>
              <p className="text-[10px] font-medium text-white/65">
                12GB out of 50GB
              </p>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-2 overflow-hidden rounded-full bg-white/15">
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
