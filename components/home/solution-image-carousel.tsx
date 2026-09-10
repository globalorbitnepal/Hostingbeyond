"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";
import type { CmsSolutionImage } from "@/lib/orbit/defaults";

type Props = {
  images: CmsSolutionImage[];
  paused?: boolean;
  className?: string;
  sizes: string;
  priority?: boolean;
};

export function SolutionImageCarousel({
  images,
  paused = false,
  className,
  sizes,
  priority = false,
}: Props) {
  const reduceMotion = useReducedMotion();
  const slides = images
    .filter((image) => image.visible !== false && image.url.trim())
    .sort((a, b) => a.order - b.order);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (reduceMotion || paused || hovered || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [hovered, paused, reduceMotion, slides.length]);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [index, slides.length]);

  if (slides.length === 0) {
    return (
      <div
        className={cn(
          "flex h-full items-center justify-center bg-gradient-to-br from-[#d7e8f8] to-[#eef4fb] text-sm text-slate-400",
          className,
        )}
      >
        Upload a product image in Orbit
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {slides.map((slide, slideIndex) => {
        const active = slideIndex === index;
        return (
          <Image
            key={slide.id || slide.url}
            src={slide.url}
            alt={slide.alt || ""}
            fill
            sizes={sizes}
            priority={priority && slideIndex === 0}
            unoptimized={isRuntimeMediaSrc(slide.url)}
            className={cn(
              "object-cover object-center transition-[opacity,transform] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              active
                ? "scale-100 opacity-100"
                : "pointer-events-none scale-[1.04] opacity-0",
              reduceMotion && "transition-none",
            )}
          />
        );
      })}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,transparent_32%,rgba(15,40,70,0.18)_100%)]"
      />
      {slides.length > 1 ? (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id || `${slide.url}-${slideIndex}`}
              type="button"
              aria-label={`Show image ${slideIndex + 1}`}
              onClick={() => setIndex(slideIndex)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                slideIndex === index
                  ? "w-4 bg-gradient-to-r from-[var(--hb-blue)] to-[var(--hb-purple)]"
                  : "w-1.5 bg-white/70 hover:bg-white",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
