"use client";

import Image from "next/image";
import { Check, FolderOpen } from "lucide-react";

import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";

export type MigrationHeroVisualProps = {
  portraitSrc: string;
  overlayLine1: string;
  overlayLine2: string;
  chipWebsite: string;
  chipForm: string;
  progressTitle: string;
  progressValue: string;
  progressRatio?: number;
};

function GogglesDecor() {
  return (
    <svg
      viewBox="0 0 120 72"
      className="h-14 w-[88px] drop-shadow-lg"
      aria-hidden
    >
      <ellipse cx="36" cy="36" rx="28" ry="22" fill="#a78bfa" opacity="0.9" />
      <ellipse cx="84" cy="36" rx="28" ry="22" fill="#7c3aed" opacity="0.85" />
      <path
        d="M64 36h-8"
        stroke="#4c1d95"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse
        cx="36"
        cy="36"
        rx="18"
        ry="14"
        fill="none"
        stroke="#ede9fe"
        strokeWidth="2"
      />
      <ellipse
        cx="84"
        cy="36"
        rx="18"
        ry="14"
        fill="none"
        stroke="#ede9fe"
        strokeWidth="2"
      />
    </svg>
  );
}

function SneakerDecor() {
  return (
    <svg
      viewBox="0 0 200 100"
      className="h-[72px] w-[140px] -rotate-12 drop-shadow-xl"
      aria-hidden
    >
      <path
        d="M20 55c30-8 55-6 80 4 25 10 55 8 75-2l15 18H15l5-20z"
        fill="#f8fafc"
      />
      <path
        d="M25 58c28-6 52-4 78 6 22 9 48 7 68-2"
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="2"
      />
      <path
        d="M40 62h100"
        stroke="#673de6"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <ellipse cx="155" cy="48" rx="22" ry="14" fill="#e2e8f0" />
    </svg>
  );
}

export function MigrationHeroVisual({
  portraitSrc,
  overlayLine1,
  overlayLine2,
  chipWebsite,
  chipForm,
  progressTitle,
  progressValue,
  progressRatio = 0.76,
}: MigrationHeroVisualProps) {
  const src =
    portraitSrc?.trim() || "/images/business-email/people/p-woman.jpg";
  const circumference = 2 * Math.PI * 36;
  const dash = circumference * progressRatio;

  return (
    <div className="relative mx-auto aspect-[1.05/1] min-h-[320px] w-full max-w-[620px] sm:min-h-[380px] lg:min-h-[440px]">
      {/* Lavender slab */}
      <div
        className="absolute inset-[6%_0_8%_8%] rounded-[32px] bg-[#ebe8ff]"
        style={{
          clipPath: "polygon(8% 0%, 100% 4%, 96% 100%, 0% 92%, 4% 12%)",
        }}
        aria-hidden
      />

      {/* Striped panel */}
      <div
        className="absolute top-[12%] right-[4%] bottom-[18%] left-[14%] overflow-hidden rounded-[20px] border border-white/60 shadow-inner"
        style={{
          background:
            "repeating-linear-gradient(90deg, #dbeafe 0px, #dbeafe 14px, #eff6ff 14px, #eff6ff 28px)",
        }}
        aria-hidden
      />

      {/* MOVE FORWARD outline */}
      <div
        className="pointer-events-none absolute top-[22%] right-[8%] left-[18%] z-[2] text-center font-extrabold tracking-[0.08em] text-transparent select-none"
        style={{
          WebkitTextStroke: "2px rgba(255,255,255,0.85)",
          fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)",
          lineHeight: 1.05,
        }}
        aria-hidden
      >
        <div>{overlayLine1}</div>
        <div>{overlayLine2}</div>
      </div>

      {/* Portrait */}
      <div className="absolute top-[10%] right-[12%] bottom-[12%] left-[22%] z-[3] overflow-hidden rounded-b-[18px]">
        <Image
          src={src}
          alt=""
          fill
          priority
          className="object-cover object-[50%_15%]"
          sizes="(max-width: 1024px) 90vw, 420px"
          unoptimized={isRuntimeMediaSrc(src)}
        />
      </div>

      {/* Chips */}
      <div className="absolute top-[6%] left-[2%] z-[5] flex flex-col gap-2 sm:left-[0%]">
        {[chipWebsite, chipForm].map((label) => (
          <span
            key={label}
            className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 shadow-md sm:text-[12px]"
          >
            <span className="flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="size-2.5 stroke-[3]" />
            </span>
            {label}
          </span>
        ))}
      </div>

      {/* Folder icon */}
      <div
        className="absolute top-[8%] right-[2%] z-[5] flex size-11 items-center justify-center rounded-xl bg-[#673de6] text-white shadow-lg sm:size-12"
        aria-hidden
      >
        <FolderOpen className="size-5" />
      </div>

      {/* Goggles */}
      <div className="absolute top-[38%] right-[0%] z-[5] sm:right-[-2%]">
        <GogglesDecor />
      </div>

      {/* Sneaker */}
      <div className="absolute bottom-[4%] left-[-2%] z-[5] sm:left-[-4%]">
        <SneakerDecor />
      </div>

      {/* Progress card */}
      <div className="absolute right-[2%] bottom-[6%] z-[5] flex max-w-[220px] items-center gap-3 rounded-2xl border border-white/80 bg-white/95 px-3 py-3 shadow-xl backdrop-blur-sm sm:px-4">
        <div className="relative size-[72px] shrink-0">
          <svg viewBox="0 0 80 80" className="size-full -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#e9d5ff"
              strokeWidth="8"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#673de6"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
            />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-slate-500 sm:text-[12px]">
            {progressTitle}
          </p>
          <p className="text-[13px] font-extrabold text-slate-900 sm:text-[14px]">
            {progressValue}
          </p>
        </div>
      </div>
    </div>
  );
}
