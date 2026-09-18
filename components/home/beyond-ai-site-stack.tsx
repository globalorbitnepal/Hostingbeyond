"use client";

import Image from "next/image";

import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";

const FALLBACK_SRC = "/images/home/beyond-ai/workspace.jpg";
const FALLBACK_ALT = "Building a Beyond AI website on a laptop at a home desk";

export function BeyondAiSiteStack({
  imageUrl,
  imageAlt,
}: {
  imageUrl?: string;
  imageAlt?: string;
}) {
  const src = imageUrl?.trim() || FALLBACK_SRC;
  const alt = imageAlt?.trim() || FALLBACK_ALT;

  return (
    <div className="relative mx-auto w-full max-w-[640px] lg:max-w-none">
      <div className="relative aspect-[4/3] overflow-hidden sm:rounded-[28px] lg:aspect-auto lg:min-h-[540px] lg:rounded-[32px]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 52vw"
          unoptimized={isRuntimeMediaSrc(src) || src.endsWith(".jpg")}
          className="object-cover object-[62%_center]"
        />
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-[18%] bg-gradient-to-r from-[#673de6] via-[#673de6]/35 to-transparent"
        />
      </div>
    </div>
  );
}
