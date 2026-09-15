"use client";

import Image from "next/image";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";
import { GlassDomainBar, GlassPromptBar } from "./glass-video-frame";

type Props = {
  src: string;
  srcB?: string;
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
  srcB,
  alt,
  overlayText,
  overlayKind = "prompt",
  chromeLabel,
  className,
  sizes,
  priority = false,
}: Props) {
  const reduceMotion = useReducedMotion();
  const film = Boolean(srcB) && !reduceMotion;
  const playing = !reduceMotion;

  if (!src) {
    return (
      <div
        className={cn(
          "flex h-full items-center justify-center bg-white/10 text-sm text-slate-500",
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
        unoptimized={isRuntimeMediaSrc(src)}
        className={cn(
          "object-cover object-center",
          film ? "hb-sol-film-a" : playing ? "hb-video" : "scale-[1.08]",
        )}
      />
      {film ? (
        <Image
          src={srcB!}
          alt=""
          fill
          sizes={sizes}
          unoptimized={isRuntimeMediaSrc(srcB)}
          className="hb-sol-film-b object-cover object-center"
        />
      ) : null}

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
