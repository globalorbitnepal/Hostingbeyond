"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import type { CmsBeyondAiPageContent } from "@/lib/orbit/beyond-ai-page-content";
import { cn } from "@/lib/utils";

export function BeyondAiPremiumVideo({
  content,
}: {
  content: CmsBeyondAiPageContent;
}) {
  const reduce = useReducedMotion();
  if (!content.videoVisible) return null;

  const hasFile = Boolean(content.videoUrl?.trim());

  return (
    <section className="hb-band-purple relative overflow-hidden py-14 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(124,58,237,0.35),transparent_55%),radial-gradient(ellipse_at_80%_40%,rgba(37,99,235,0.3),transparent_50%)]"
      />
      <div className="hb-shell relative z-10">
        <div className="overflow-hidden rounded-[28px] border border-white/15 bg-[#0c0618]/75 shadow-[0_40px_80px_-32px_rgba(0,0,0,0.65)] backdrop-blur-md">
          <div className="relative min-h-[220px] sm:min-h-[280px] lg:min-h-[320px]">
            {hasFile ? (
              <video
                className="absolute inset-0 h-full w-full object-cover opacity-90"
                src={content.videoUrl}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            ) : (
              <>
                <div
                  aria-hidden
                  className={cn(
                    "absolute inset-0 opacity-95",
                    !reduce && "hb-pricing-motion-bg",
                  )}
                />
                {!reduce ? (
                  <>
                    <motion.span
                      aria-hidden
                      className="absolute top-[15%] left-[10%] h-36 w-36 rounded-full bg-[#7c3aed]/35 blur-3xl"
                      animate={{ x: [0, 28, 0], y: [0, -18, 0] }}
                      transition={{
                        duration: 9,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <motion.span
                      aria-hidden
                      className="absolute right-[8%] bottom-[10%] h-44 w-44 rounded-full bg-[#2563eb]/30 blur-3xl"
                      animate={{ x: [0, -24, 0], y: [0, 14, 0] }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </>
                ) : null}
                <div
                  aria-hidden
                  className="absolute inset-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm sm:inset-8"
                >
                  <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                    <span className="size-2.5 rounded-full bg-red-400/90" />
                    <span className="size-2.5 rounded-full bg-amber-400/90" />
                    <span className="size-2.5 rounded-full bg-emerald-400/90" />
                    <span className="ml-2 text-[11px] font-semibold text-white/45">
                      beyond-ai — workspace
                    </span>
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="h-3 w-2/3 max-w-xs rounded bg-white/20" />
                    <div className="h-24 rounded-xl bg-gradient-to-br from-[#673de6]/50 to-[#2563eb]/35" />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-10 rounded-lg bg-white/10" />
                      <div className="h-10 rounded-lg bg-white/10" />
                      <div className="h-10 rounded-lg bg-white/10" />
                    </div>
                  </div>
                </div>
              </>
            )}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c0618] via-[#0c0618]/55 to-transparent"
            />
            <div className="relative z-10 flex h-full flex-col justify-end gap-5 p-6 sm:p-8 lg:max-w-xl">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold tracking-[0.18em] text-white/90 uppercase backdrop-blur-md">
                <Play className="size-3 fill-white text-white" aria-hidden />
                {content.videoEyebrow}
              </span>
              <h2 className="font-heading text-[clamp(1.5rem,3vw,2rem)] leading-tight font-extrabold tracking-[-0.03em] text-white">
                {content.videoTitle}
              </h2>
              <p className="text-[15px] leading-relaxed text-white/82">
                {content.videoDescription}
              </p>
              <Link
                href={content.videoCtaHref}
                className="inline-flex h-11 w-fit items-center gap-2 rounded-full bg-white px-5 text-[13px] font-extrabold text-[#2f1c6a] shadow-lg"
              >
                {content.videoCtaLabel}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
