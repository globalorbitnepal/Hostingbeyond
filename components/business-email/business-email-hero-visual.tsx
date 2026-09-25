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
      className="relative mx-auto w-full bg-transparent"
      style={{ maxWidth: `${maxWidth}px` }}
    >
      <div
        className={
          onDarkBackground
            ? "relative overflow-hidden bg-transparent"
            : "relative bg-transparent"
        }
      >
        <Image
          src={artwork}
          alt=""
          width={1024}
          height={576}
          priority
          className={
            onDarkBackground
              ? "relative -ml-[5%] h-auto w-[118%] max-w-none border-0 bg-transparent mix-blend-multiply shadow-none contrast-[1.04] saturate-[1.06]"
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
    </div>
  );
}
