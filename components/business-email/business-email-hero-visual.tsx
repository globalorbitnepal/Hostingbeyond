"use client";

import Image from "next/image";

import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";

const DEFAULT_ART = "/images/business-email/hero-custom.webp";
const BASE_MAX_PX = 620;

type Props = {
  src: string;
  scalePercent?: number;
  /** When true, softens white matte on dark purple hero backgrounds. */
  onDarkBackground?: boolean;
};

export function BusinessEmailHeroVisual({
  src,
  scalePercent = 130,
  onDarkBackground = true,
}: Props) {
  const artwork = src?.trim() || DEFAULT_ART;
  const scale = Math.min(160, Math.max(80, scalePercent)) / 100;
  const maxWidth = Math.round(BASE_MAX_PX * scale);

  return (
    <div
      className="relative mx-auto w-full overflow-visible"
      style={{ maxWidth: `${maxWidth}px` }}
    >
      <Image
        src={artwork}
        alt=""
        width={1024}
        height={576}
        priority
        className={
          onDarkBackground
            ? "relative -ml-[2%] h-auto w-[104%] max-w-none border-0 bg-transparent mix-blend-screen shadow-none contrast-[1.03] saturate-[1.04]"
            : "h-auto w-full border-0 bg-transparent shadow-none"
        }
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
