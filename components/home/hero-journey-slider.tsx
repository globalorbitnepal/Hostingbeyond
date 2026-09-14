"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { defaultJourneySection } from "@/lib/orbit/defaults";
import type { CmsJourneyContent } from "@/lib/orbit/defaults";
import { cn } from "@/lib/utils";

export function HeroJourneySlider({
  content,
}: {
  content?: CmsJourneyContent;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  const data = content ?? defaultJourneySection();
  const slides = useMemo(
    () =>
      data.slides
        .filter((slide) => slide.visible !== false)
        .sort((a, b) => a.order - b.order),
    [data.slides],
  );

  const active = slides[Math.min(index, Math.max(slides.length - 1, 0))];

  useEffect(() => {
    if (reduce || slides.length < 2) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % slides.length),
      Math.max(1.5, data.autoplaySeconds) * 1000,
    );
    return () => window.clearInterval(timer);
  }, [reduce, slides.length, data.autoplaySeconds]);

  if (!slides.length || !active) return null;

  return (
    <section className="relative z-20 bg-[#4c1d95] py-12 sm:py-16">
      <div className="hb-shell">
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setIndex(slideIndex)}
              className={cn(
                "rounded-full px-4 py-1.5 text-[13px] font-bold transition",
                index === slideIndex
                  ? "bg-white text-slate-950"
                  : "bg-white/15 text-white/85 hover:bg-white/25",
              )}
            >
              {slide.label}
            </button>
          ))}
        </div>

        <div className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {slides.map((slide, slideIndex) => {
            const on = slideIndex === index;
            return (
              <motion.article
                key={slide.id}
                layout
                className={cn(
                  "relative overflow-hidden rounded-[24px] border border-white/15 bg-white/10 shadow-[0_24px_50px_-28px_rgba(0,0,0,0.55)]",
                  on ? "ring-2 ring-white/70" : "opacity-90",
                )}
              >
                <div className="relative h-[210px] sm:h-[230px]">
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    style={{ objectPosition: slide.imagePosition }}
                    className={cn(
                      "object-cover transition duration-700",
                      on ? "scale-100" : "scale-[1.04]",
                    )}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1b1233]/80 via-transparent to-transparent" />
                  {slide.badge ? (
                    <p className="absolute top-4 left-4 rounded-full bg-[#673de6] px-3 py-1 text-[11px] font-bold text-white shadow-lg">
                      {slide.badge}
                    </p>
                  ) : null}
                </div>
              </motion.article>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto mt-6 max-w-2xl text-center text-white"
          >
            <h2 className="font-heading text-[clamp(1.35rem,2.6vw,1.85rem)] font-extrabold tracking-[-0.03em]">
              {active.title}
            </h2>
            <p className="mt-2 text-[15px] text-white/75">{active.body}</p>
            {active.ctaLabel ? (
              <Link
                href={active.ctaHref || "/"}
                className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-extrabold text-white"
              >
                {active.ctaLabel}
                <ArrowRight className="size-4" />
              </Link>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
