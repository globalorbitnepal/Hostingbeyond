"use client";

import {
  ChevronDown,
  CircleAlert,
  CircleCheck,
  CircleDashed,
} from "lucide-react";
import { useState } from "react";

import type { BlogSeoScore, SeoCheckStatus } from "@/lib/blog/seo-score";
import { cn } from "@/lib/utils";

const toneRing: Record<"green" | "amber" | "red", string> = {
  green: "#16a34a",
  amber: "#d97706",
  red: "#dc2626",
};

function statusIcon(status: SeoCheckStatus) {
  if (status === "good") {
    return <CircleCheck className="size-3.5 shrink-0 text-emerald-600" />;
  }
  if (status === "warn") {
    return <CircleAlert className="size-3.5 shrink-0 text-amber-500" />;
  }
  return <CircleDashed className="size-3.5 shrink-0 text-red-500" />;
}

export function SeoScorePanel({ result }: { result: BlogSeoScore }) {
  const [open, setOpen] = useState(true);
  const tone =
    result.score >= 85 ? "green" : result.score >= 60 ? "amber" : "red";
  const circumference = 2 * Math.PI * 26;
  const dash = (result.score / 100) * circumference;

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-sm font-bold text-slate-900">
          SEO score &amp; content analysis
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-slate-400 transition",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "space-y-3 border-t border-slate-100 px-4 py-3",
          !open && "hidden",
        )}
      >
        <div className="flex items-center gap-3">
          <div className="relative size-16 shrink-0">
            <svg viewBox="0 0 64 64" className="size-16 -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="6"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke={toneRing[tone]}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference}`}
                className="transition-[stroke-dasharray] duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-extrabold text-slate-900">
              {result.score}
            </span>
          </div>
          <div className="min-w-0">
            <p
              className={cn(
                "text-sm font-bold",
                tone === "green"
                  ? "text-emerald-700"
                  : tone === "amber"
                    ? "text-amber-700"
                    : "text-red-600",
              )}
            >
              {result.grade}
            </p>
            <p className="text-xs text-slate-500">
              {result.passed} of {result.total} checks passed
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Score updates as you edit. Publish at 85+ for the strongest
              result.
            </p>
          </div>
        </div>

        <ul className="space-y-1.5">
          {result.checks.map((item) => (
            <li key={item.id} className="flex items-start gap-2 text-xs">
              {statusIcon(item.status)}
              <span className="min-w-0">
                <span
                  className={cn(
                    "font-semibold",
                    item.status === "good"
                      ? "text-slate-700"
                      : item.status === "warn"
                        ? "text-amber-800"
                        : "text-slate-500",
                  )}
                >
                  {item.label}
                </span>
                <span className="ml-1 text-[11px] text-slate-400">
                  {item.earned}/{item.max}
                </span>
                {item.status !== "good" ? (
                  <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">
                    {item.hint}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
