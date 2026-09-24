"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { routes } from "@/config/routes";
import type { CmsPricingCategoryContent } from "@/lib/orbit/pricing-content";
import { cn } from "@/lib/utils";

/**
 * Image-free “video mode” showcase — animated mesh + glass UI chrome.
 */
export function PricingMotionStage({
  category,
}: {
  category: CmsPricingCategoryContent;
}) {
  const reduce = useReducedMotion();

  return (
    <div className="mt-14 overflow-hidden rounded-[32px] border border-[#e9e4ff] bg-[#0f0a24] shadow-[0_32px_64px_-28px_rgba(47,28,106,0.55)]">
      <div className="relative min-h-[220px] sm:min-h-[260px]">
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 opacity-90",
            !reduce && "hb-pricing-motion-bg",
          )}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(147,197,253,0.35),transparent_55%),radial-gradient(ellipse_at_70%_80%,rgba(167,139,250,0.4),transparent_50%)]"
        />
        {!reduce ? (
          <>
            <motion.span
              aria-hidden
              className="absolute top-[18%] left-[12%] h-32 w-32 rounded-full bg-[#7c3aed]/30 blur-3xl"
              animate={{ x: [0, 24, 0], y: [0, -16, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              aria-hidden
              className="absolute right-[10%] bottom-[12%] h-40 w-40 rounded-full bg-[#2563eb]/25 blur-3xl"
              animate={{ x: [0, -20, 0], y: [0, 12, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        ) : null}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(15,10,36,0.75)_100%)]"
        />

        <div className="relative z-10 flex h-full flex-col justify-between gap-6 p-6 sm:p-8 lg:flex-row lg:items-end">
          <div className="max-w-lg">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold tracking-[0.2em] text-white/90 uppercase backdrop-blur-md">
              <Play className="size-3 fill-white text-white" aria-hidden />
              Live preview
            </span>
            <h3 className="font-heading mt-4 text-[clamp(1.35rem,2.8vw,1.85rem)] leading-tight font-extrabold tracking-[-0.03em] text-white">
              {category.showcaseTitle}
            </h3>
            <p className="mt-2 text-[15.4px] leading-relaxed font-medium text-white/85 sm:text-[16px]">
              {category.showcaseBody}
            </p>
          </div>

          <div className="w-full max-w-md shrink-0">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <span className="size-2.5 rounded-full bg-red-400/90" />
                <span className="size-2.5 rounded-full bg-amber-400/90" />
                <span className="size-2.5 rounded-full bg-emerald-400/90" />
                <span className="ml-2 truncate text-[11px] font-semibold text-white/50">
                  hostingbeyond — {category.shortLabel}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {[0.92, 0.78, 0.65].map((w, i) => (
                  <motion.div
                    key={i}
                    aria-hidden
                    className="h-2 rounded-full bg-gradient-to-r from-[#7c3aed]/80 to-[#38bdf8]/60"
                    style={{ width: `${w * 100}%` }}
                    animate={reduce ? undefined : { opacity: [0.5, 1, 0.5] }}
                    transition={{
                      duration: 2.2,
                      delay: i * 0.25,
                      repeat: Infinity,
                    }}
                  />
                ))}
              </div>
              <Link
                href={routes.getStarted}
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white text-[13px] font-extrabold text-[#2f1c6a] transition hover:bg-[#f4f0ff]"
              >
                Get started
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
