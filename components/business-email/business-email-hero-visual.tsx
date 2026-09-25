"use client";

import Image from "next/image";

import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";

const DEFAULT_ART = "/images/business-email/hero-custom.webp";
const BASE_MAX_PX = 580;

/** Full marketing composite (built-in UI); skip floating chips on the page. */
export function isCompositeImpressionArt(src: string) {
  const s = src?.trim() || DEFAULT_ART;
  return /hero-custom\.webp/i.test(s);
}

type Props = {
  src: string;
  alt?: string;
  scalePercent?: number;
};

export function BusinessEmailHeroVisual({
  src,
  alt = "",
  scalePercent = 118,
}: Props) {
  const artwork = src?.trim() || DEFAULT_ART;
  const composite = isCompositeImpressionArt(artwork);
  const scale = Math.min(150, Math.max(90, scalePercent)) / 100;
  const maxWidth = Math.round(BASE_MAX_PX * scale);

  return (
    <div
      className="relative mx-auto w-full"
      style={{ maxWidth: `${maxWidth}px` }}
    >
      <div className="overflow-hidden rounded-[28px] border border-white/90 bg-white p-2 shadow-[0_28px_72px_-34px_rgba(8,6,28,0.55)] ring-1 ring-white/70 sm:p-3">
        <Image
          src={artwork}
          alt={alt}
          width={1400}
          height={composite ? 788 : 933}
          priority={composite}
          className={
            composite
              ? "h-auto w-full rounded-[22px] object-contain"
              : "h-[min(420px,52vh)] w-full rounded-[22px] object-cover object-center"
          }
          sizes={`(max-width: 1024px) 100vw, ${maxWidth}px`}
          unoptimized={
            isRuntimeMediaSrc(artwork) ||
            artwork.includes("/business-email/") ||
            artwork.endsWith(".webp")
          }
        />
      </div>
    </div>
  );
}
