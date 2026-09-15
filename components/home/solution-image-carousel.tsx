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
        "relative h-full w-full overflow-hidden bg-[#1a0b3a]",
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
          "object-cover object-center",
          playing ? "hb-video-card" : "scale-[1.02]",
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#12082a]/55 to-transparent"
      />

      {overlayKind === "domain" ? (
        <GlassDomainBar domain={overlayText} tld=".com" playing={playing} />
      ) : (
        <GlassPromptBar text={overlayText} playing={playing} />
      )}
    </div>
  );
}
