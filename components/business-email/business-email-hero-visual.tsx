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

export function BusinessEmailHeroVisual({
  src,
  alt = "",
  scalePercent = 180,
}: Props) {
  const artwork = src?.trim() || DEFAULT_ART;
  const scale = Math.min(200, Math.max(80, scalePercent)) / 100;
  const maxWidth = Math.round(BASE_MAX_PX * scale);

  if (!isPortraitOnly(artwork)) {
    return (
      <div
        className="relative mx-auto w-full bg-transparent"
        style={{ maxWidth: `${maxWidth}px` }}
      >
        <div className="relative overflow-hidden bg-transparent">
          <Image
            src={artwork}
            alt={alt}
            width={1024}
            height={576}
            priority={/hero-custom/i.test(artwork)}
            className="relative -ml-[2%] h-auto w-[104%] max-w-none border-0 bg-transparent object-contain shadow-none"
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
      className="relative mx-auto aspect-[4/3] min-h-[300px] w-full overflow-hidden rounded-[24px] shadow-[0_20px_50px_-36px_rgba(47,28,106,0.25)]"
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
