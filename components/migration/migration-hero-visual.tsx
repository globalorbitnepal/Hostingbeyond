"use client";

import Image from "next/image";

import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";

export type MigrationHeroVisualProps = {
  /** Full hero artwork (Hostinger-style collage) — preferred. */
  compositeSrc: string;
  portraitSrc: string;
  overlayLine1: string;
  overlayLine2: string;
  chipWebsite: string;
  chipForm: string;
  progressTitle: string;
  progressValue: string;
  progressRatio?: number;
};

const DEFAULT_COMPOSITE = "/images/migration/hero-composite.png";

function usesGeneratedComposite(src: string) {
  const s = src.trim();
  if (!s) return true;
  if (s.includes("hero-composite")) return true;
  if (s.endsWith(".svg")) return false;
  if (s.includes("/people/") || s.includes("p-woman")) return false;
  return true;
}

export function MigrationHeroVisual({
  compositeSrc,
  portraitSrc,
}: MigrationHeroVisualProps) {
  const artwork =
    compositeSrc?.trim() || portraitSrc?.trim() || DEFAULT_COMPOSITE;
  const compositeMode = usesGeneratedComposite(artwork);

  if (compositeMode) {
    const src = artwork || DEFAULT_COMPOSITE;

    return (
      <div className="relative mx-auto w-full max-w-[640px] lg:w-[min(100%,620px)] lg:max-w-none">
        <Image
          src={src}
          alt=""
          width={1280}
          height={720}
          priority
          className="h-auto w-full"
          sizes="(max-width: 1024px) 100vw, 620px"
          unoptimized={isRuntimeMediaSrc(src) || src.includes("hero-composite")}
        />
      </div>
    );
  }

  const portrait =
    portraitSrc?.trim() || "/images/business-email/people/p-woman.jpg";

  return (
    <div className="relative mx-auto aspect-[1.05/1] min-h-[320px] w-full max-w-[620px]">
      <Image
        src={portrait}
        alt=""
        fill
        className="rounded-[24px] object-cover"
        unoptimized={isRuntimeMediaSrc(portrait)}
      />
    </div>
  );
}
