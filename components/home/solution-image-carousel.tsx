"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { CmsSolutionImage } from "@/lib/orbit/defaults";
import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";
import { GlassDomainBar, GlassPromptBar } from "./glass-video-frame";

type Props = {
  images: CmsSolutionImage[];
  overlayText: string;
  overlayKind?: "prompt" | "domain";
  chips?: string[];
  paused?: boolean;
  className?: string;
  sizes: string;
  priority?: boolean;
};

export function SolutionImageCarousel({
  images,
  overlayText,
  overlayKind = "prompt",
  chips = [],
  paused = false,
  className,
  sizes,
  priority = false,
}: Props) {
  const reduceMotion = useReducedMotion();
  const slides = images
    .filter((image) => image.visible !== false && image.url.trim())
    .sort((a, b) => a.order - b.order);
  const slide = slides[0];
  const playing = !paused && !reduceMotion;

  if (!slide) {
    return (
      <div
        className={cn(
          "flex h-full items-center justify-center bg-white/10 text-sm text-white/60",
          className,
        )}
      >
        Upload a product image in Orbit
      </div>
    );
  }

  const mediaClass = cn(
    "absolute inset-0 h-full w-full object-cover object-center",
    playing ? "hb-video" : "scale-[1.08]",
  );

  return (
    <div
      className={cn(
        "relative h-full min-h-[210px] w-full overflow-hidden",
        className,
      )}
    >
      {isRuntimeMediaSrc(slide.url) ? (
        // Runtime Orbit files must skip next/image so every device hits /uploads directly.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={slide.url} alt={slide.alt || ""} className={mediaClass} />
      ) : (
        <Image
          src={slide.url}
          alt={slide.alt || ""}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized
          className={mediaClass}
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(47,28,106,0.08)_0%,transparent_38%,rgba(15,10,40,0.42)_100%)]"
      />

      {chips.length > 0 ? (
        <div className="absolute top-3 left-3 z-20 flex max-w-[92%] flex-wrap gap-1.5">
          {chips.map((chip, index) => (
            <motion.span
              key={chip}
              className="rounded-full border border-white/45 bg-white/85 px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#2f1c6a] uppercase shadow-sm backdrop-blur-xl"
              animate={
                playing ? { y: [6, 0], opacity: [0, 1] } : { y: 0, opacity: 1 }
              }
              transition={{ delay: 0.12 * index, duration: 0.4 }}
            >
              {chip}
            </motion.span>
          ))}
        </div>
      ) : null}

      {overlayKind === "domain" ? (
        <GlassDomainBar domain={overlayText} tld=".com" playing={playing} />
      ) : (
        <GlassPromptBar text={overlayText} playing={playing} />
      )}
    </div>
  );
}
