"use client";

import Image from "next/image";

import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";

const BASE_MAX_PX = 600;

type Props = {
  src: string;
  scalePercent?: number;
  /** Slight zoom to crop baked-in white matte on JPEG/WebP exports. */
  cropMatte?: boolean;
};

export function MigrationBandImage({
  src,
  scalePercent = 120,
  cropMatte = true,
}: Props) {
  const scale = Math.min(160, Math.max(80, scalePercent)) / 100;
  const maxWidth = Math.round(BASE_MAX_PX * scale);
  const artwork = src?.trim() || "/images/migration/hero-custom.webp";

  return (
    <div
      className="relative w-full bg-transparent"
      style={{ maxWidth: `${maxWidth}px` }}
    >
      <div
        className={
          cropMatte
            ? "relative overflow-hidden bg-transparent"
            : "relative bg-transparent"
        }
      >
        <Image
          src={artwork}
          alt=""
          width={1024}
          height={576}
          className={
            cropMatte
              ? "relative -ml-[3%] h-auto w-[112%] max-w-none bg-transparent mix-blend-multiply contrast-[1.02] saturate-[1.05]"
              : "h-auto w-full border-0 bg-transparent shadow-none"
          }
          sizes={`(max-width: 1024px) 100vw, ${maxWidth}px`}
          unoptimized={
            isRuntimeMediaSrc(artwork) ||
            artwork.includes("/migration/") ||
            artwork.endsWith(".webp")
          }
        />
      </div>
    </div>
  );
}
