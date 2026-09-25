"use client";

import Image from "next/image";

import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";
import { cn } from "@/lib/utils";

export function DomainFrameImage({
  src,
  alt = "",
  className,
  overlay = "medium",
  priority = false,
}: {
  src?: string;
  alt?: string;
  className?: string;
  overlay?: "none" | "light" | "medium" | "dark";
  priority?: boolean;
}) {
  if (!src?.trim()) return null;

  const overlayClass =
    overlay === "dark"
      ? "from-[#0a0f1f]/95 via-[#0a0f1f]/55 to-[#0a0f1f]/25"
      : overlay === "medium"
        ? "from-black/70 via-black/25 to-transparent"
        : overlay === "light"
          ? "from-white/90 via-white/40 to-transparent"
          : "";

  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 33vw"
        unoptimized={isRuntimeMediaSrc(src)}
        className={cn("object-cover", className)}
      />
      {overlay !== "none" ? (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-t",
            overlayClass,
          )}
        />
      ) : null}
    </>
  );
}
