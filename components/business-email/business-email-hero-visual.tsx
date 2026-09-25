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

/** Flat on white section — no card frame; parent section supplies white center. */
export function BusinessEmailHeroVisual({
  src,
  alt = "",
  scalePercent = 150,
}: Props) {
  const artwork = src?.trim() || DEFAULT_ART;
  const scale = Math.min(175, Math.max(80, scalePercent)) / 100;
  const maxWidth = Math.round(BASE_MAX_PX * scale);

  if (!isPortraitOnly(artwork)) {
    return (
      <div
        className="relative mx-auto w-full overflow-visible bg-white"
        style={{ maxWidth: `${maxWidth}px` }}
      >
        <Image
          src={artwork}
          alt={alt}
          width={1024}
          height={576}
          priority={/hero-custom/i.test(artwork)}
          className="h-auto w-full border-0 bg-white object-contain shadow-none"
          sizes={`(max-width: 1024px) 100vw, ${maxWidth}px`}
          unoptimized={
            isRuntimeMediaSrc(artwork) ||
            artwork.includes("/business-email/") ||
            artwork.endsWith(".webp")
          }
        />
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto aspect-[4/3] min-h-[300px] w-full overflow-hidden rounded-[24px] bg-white shadow-[0_20px_50px_-36px_rgba(47,28,106,0.25)]"
      style={{ maxWidth: `${maxWidth}px` }}
    >
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
  );
}
