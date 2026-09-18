"use client";

import Image from "next/image";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";

type Props = {
  src: string;
  srcB?: string;
  alt: string;
  cropClass?: string;
  paused?: boolean;
  className?: string;
  sizes: string;
  priority?: boolean;
};

export function SolutionImageCarousel({
  src,
  srcB,
  alt,
  cropClass = "object-center",
  paused = false,
  className,
  sizes,
  priority = false,
}: Props) {
  const reduceMotion = useReducedMotion();
  const film = Boolean(srcB) && !reduceMotion;
  const playing = !reduceMotion && !paused;

  if (!src) {
    return (
      <div
        className={cn(
          "flex h-full items-center justify-center bg-[#12082a] text-sm text-white/60",
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
        "relative h-full w-full overflow-hidden bg-[#0b0718]",
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
          "object-cover",
          cropClass,
          film
            ? "hb-sol-film-a"
            : playing
              ? "hb-sol-screen-pan"
              : "scale-[1.04]",
        )}
      />
      {film ? (
        <Image
          src={srcB!}
          alt=""
          fill
          sizes={sizes}
          unoptimized={isRuntimeMediaSrc(srcB)}
          className={cn("hb-sol-film-b object-cover", cropClass)}
        />
      ) : null}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,transparent_18%,transparent_72%,rgba(12,8,32,0.18)_100%)]"
      />
    </div>
  );
}
