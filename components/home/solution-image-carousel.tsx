"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { GlassDomainBar, GlassPromptBar } from "./glass-video-frame";

type Props = {
  src: string;
  alt: string;
  overlayText: string;
  overlayKind?: "prompt" | "domain";
  headline: string;
  lines: string[];
  paused?: boolean;
  className?: string;
  sizes: string;
  priority?: boolean;
};

export function SolutionImageCarousel({
  src,
  alt,
  overlayText,
  overlayKind = "prompt",
  headline,
  lines,
  paused = false,
  className,
  sizes,
  priority = false,
}: Props) {
  const reduceMotion = useReducedMotion();
  const playing = !paused && !reduceMotion;

  if (!src) {
    return (
      <div
        className={cn(
          "flex h-full items-center justify-center bg-white/10 text-sm text-white/60",
          className,
        )}
      >
        Missing category visual
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative h-full min-h-[210px] w-full overflow-hidden bg-[#12082a]",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized
        className={cn(
          "absolute inset-0 h-full w-full object-cover object-center",
          playing ? "hb-video-card" : "scale-[1.08]",
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,10,40,0.18)_0%,rgba(15,10,40,0.08)_36%,rgba(15,10,40,0.58)_100%)]"
      />

      <div className="absolute inset-x-3 top-3 z-20 max-w-[92%] sm:inset-x-4">
        <p className="font-heading text-[18px] leading-tight font-extrabold tracking-tight text-white drop-shadow-[0_8px_18px_rgba(15,10,40,0.45)] sm:text-[22px]">
          {headline}
        </p>
        <div className="mt-2 space-y-1">
          {lines.map((line, index) => (
            <motion.p
              key={line}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-white/90 sm:text-[12px]"
              animate={playing ? { opacity: [0.35, 1, 0.35] } : { opacity: 1 }}
              transition={{
                duration: 2.8,
                delay: index * 0.35,
                repeat: playing ? Infinity : 0,
              }}
            >
              <span className="size-1.5 shrink-0 rounded-full bg-[#93c5fd]" />
              {line}
            </motion.p>
          ))}
        </div>
      </div>

      {overlayKind === "domain" ? (
        <GlassDomainBar domain={overlayText} tld=".com" playing={playing} />
      ) : (
        <GlassPromptBar text={overlayText} playing={playing} />
      )}
    </div>
  );
}
