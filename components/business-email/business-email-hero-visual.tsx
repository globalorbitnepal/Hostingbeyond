"use client";

import Image from "next/image";

import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";

const DEFAULT_ART = "/images/business-email/hero-custom.webp";
const BASE_MAX_PX = 620;

function isPortraitOnly(src: string) {
  const s = src.trim();
  return (
    s.endsWith(".svg") || (s.includes("/people/") && !s.includes("hero-custom"))
  );
}

type Props = {
  src: string;
  alt?: string;
  scalePercent?: number;
};

/** Cream-band panel: section uses hb-band-cream; visible frames stay on white backing. */
export function BusinessEmailHeroVisual({
  src,
  alt = "",
  scalePercent = 130,
}: Props) {
  const artwork = src?.trim() || DEFAULT_ART;
  const scale = Math.min(160, Math.max(80, scalePercent)) / 100;
  const maxWidth = Math.round(BASE_MAX_PX * scale);

  if (!isPortraitOnly(artwork)) {
    return (
      <div
        className="relative mx-auto w-full overflow-visible"
        style={{ maxWidth: `${maxWidth}px` }}
      >
        <div className="overflow-hidden rounded-[28px] border border-white/95 bg-white p-2 shadow-[0_24px_60px_-32px_rgba(47,28,106,0.28)] ring-1 ring-white/80 sm:p-2.5">
          <Image
            src={artwork}
            alt={alt}
            width={1024}
            height={576}
            priority={/hero-custom/i.test(artwork)}
            className="h-auto w-full rounded-[22px] border-0 bg-white object-contain shadow-none"
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

  return (
    <div
      className="relative mx-auto w-full overflow-hidden rounded-[28px] border border-white/95 bg-white p-1.5 shadow-[0_24px_60px_-32px_rgba(47,28,106,0.28)] ring-1 ring-white/80"
      style={{ maxWidth: `${maxWidth}px` }}
    >
      <div className="relative aspect-[4/3] min-h-[300px] w-full overflow-hidden rounded-[22px]">
        <Image
          src={artwork}
          alt={alt}
          fill
          className="object-cover object-center"
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
