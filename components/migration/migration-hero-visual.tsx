"use client";

import Image from "next/image";

import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";

export type MigrationHeroVisualProps = {
  compositeSrc: string;
  portraitSrc: string;
  scalePercent?: number;
  overlayLine1: string;
  overlayLine2: string;
  chipWebsite: string;
  chipForm: string;
  progressTitle: string;
  progressValue: string;
  progressRatio?: number;
};

const DEFAULT_ART = "/images/migration/hero-custom.webp";
const BASE_MAX_PX = 620;

function isPortraitOnly(src: string) {
  const s = src.trim();
  return (
    s.endsWith(".svg") || (s.includes("/people/") && !s.includes("/migration/"))
  );
}

export function MigrationHeroVisual({
  compositeSrc,
  portraitSrc,
  scalePercent = 130,
}: MigrationHeroVisualProps) {
  const artwork = compositeSrc?.trim() || portraitSrc?.trim() || DEFAULT_ART;
  const scale = Math.min(160, Math.max(80, scalePercent)) / 100;
  const maxWidth = Math.round(BASE_MAX_PX * scale);

  if (!isPortraitOnly(artwork)) {
    const src = artwork || DEFAULT_ART;

    return (
      <div
        className="relative mx-auto w-full overflow-visible"
        style={{ maxWidth: `${maxWidth}px` }}
      >
        <Image
          src={src}
          alt=""
          width={1024}
          height={576}
          priority
          className="h-auto w-full border-0 bg-transparent shadow-none"
          sizes={`(max-width: 1024px) 100vw, ${maxWidth}px`}
          unoptimized={
            isRuntimeMediaSrc(src) ||
            src.includes("/migration/") ||
            src.endsWith(".webp")
          }
        />
      </div>
    );
  }

  const portrait =
    portraitSrc?.trim() || "/images/business-email/people/p-woman.jpg";

  return (
    <div
      className="relative mx-auto aspect-[1.05/1] min-h-[320px] w-full overflow-visible"
      style={{ maxWidth: `${maxWidth}px` }}
    >
      <Image
        src={portrait}
        alt=""
        fill
        className="object-cover"
        unoptimized={isRuntimeMediaSrc(portrait)}
      />
    </div>
  );
}
