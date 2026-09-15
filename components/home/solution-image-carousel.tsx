"use client";

import Image from "next/image";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { GlassDomainBar, GlassPromptBar } from "./glass-video-frame";

type Props = {
  src: string;
  alt: string;
  overlayText: string;
  overlayKind?: "prompt" | "domain";
  chromeLabel: string;
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
  chromeLabel,
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
        "relative h-full w-full overflow-hidden bg-[#12082a]",
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
        className={cn("object-cover object-center", playing && "hb-video-card")}
      />

      <div className="absolute inset-x-0 top-0 z-20 flex h-8 items-center gap-1.5 border-b border-black/5 bg-white/88 px-3 backdrop-blur-md">
        <span className="size-2 rounded-full bg-[#ff5f57]" />
        <span className="size-2 rounded-full bg-[#febc2e]" />
        <span className="size-2 rounded-full bg-[#28c840]" />
        <span className="ml-2 truncate text-[11px] font-semibold tracking-tight text-slate-600">
          {chromeLabel}
        </span>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent"
      />

      {overlayKind === "domain" ? (
        <GlassDomainBar domain={overlayText} tld=".com" playing={playing} />
      ) : (
        <GlassPromptBar text={overlayText} playing={playing} />
      )}
    </div>
  );
}
