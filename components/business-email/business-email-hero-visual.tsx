"use client";

import Image from "next/image";

import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";
import { cn } from "@/lib/utils";

const DEFAULT_ART = "/images/business-email/hero-custom.webp";
const BASE_MAX_PX = 620;

function isPortraitPhoto(src: string) {
  const s = src.trim();
  return s.includes("/people/") && !s.includes("hero-custom");
}

/** Flat marketing art on light bands — white canvas in uploads blends into section bg. */
function shouldBlendArtwork(src: string) {
  const s = src.trim();
  if (!s || s.endsWith(".svg") || isPortraitPhoto(s)) return false;
  return true;
}

type Props = {
  src: string;
  alt?: string;
  scalePercent?: number;
};

export function BusinessEmailHeroVisual({
  src,
  alt = "",
  scalePercent = 180,
}: Props) {
  const artwork = src?.trim() || DEFAULT_ART;
  const scale = Math.min(200, Math.max(80, scalePercent)) / 100;
  const maxWidth = Math.round(BASE_MAX_PX * scale);
  const blend = shouldBlendArtwork(artwork);

  return (
    <div
      className="relative mx-auto w-full max-w-full bg-transparent"
      style={{ maxWidth: `${maxWidth}px` }}
    >
      <Image
        src={artwork}
        alt={alt}
        width={1600}
        height={900}
        priority={/hero-custom/i.test(artwork)}
        className={cn(
          "block h-auto w-full max-w-full border-0 bg-transparent object-contain object-center shadow-none ring-0 outline-none",
          blend && "mix-blend-multiply",
        )}
        sizes={`(max-width: 1024px) 100vw, ${maxWidth}px`}
        unoptimized={
          isRuntimeMediaSrc(artwork) ||
          artwork.includes("/business-email/") ||
          artwork.endsWith(".webp") ||
          artwork.endsWith(".png") ||
          artwork.endsWith(".jpg")
        }
      />
    </div>
  );
}
