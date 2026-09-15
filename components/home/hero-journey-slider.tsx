"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { defaultJourneySection } from "@/lib/orbit/defaults";
import type { CmsJourneyContent } from "@/lib/orbit/defaults";
import { cn } from "@/lib/utils";
import { hbCopy, hbSlide } from "@/lib/motion";

export function HeroJourneySlider({
  content,
}: {
  content?: CmsJourneyContent;
}) {
  const reduce = useReducedMotion();
  const [[index, direction], setPage] = useState([0, 0]);

  const data = content ?? defaultJourneySection();
  const slides = useMemo(
    () =>
      data.slides
        .filter((slide) => slide.visible !== false)
        .sort((a, b) => a.order - b.order),
    [data.slides],
  );

  const active = slides[Math.min(index, Math.max(slides.length - 1, 0))];

  function goTo(next: number) {
    if (next === index) return;
    setPage([next, next > index ? 1 : -1]);
  }

  useEffect(() => {
    if (reduce || slides.length < 2) return;
    const timer = window.setInterval(
      () => {
        setPage(([current]) => {
          const next = (current + 1) % slides.length;
          return [next, 1];
        });
      },
      Math.max(1.5, data.autoplaySeconds) * 1000,
    );
    return () => window.clearInterval(timer);
  }, [reduce, slides.length, data.autoplaySeconds]);

  if (!slides.length || !active) return null;

  return (
    <section className="relative z-20 overflow-hidden bg-[linear-gradient(180deg,#673de6_0%,#5025d1_52%,#2f1c6a_100%)] py-14 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.16),transparent_52%)]"
      />
      <div className="hb-shell relative">
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(slideIndex)}
              className={cn(
                "rounded-full px-5 py-2 text-[13px] font-bold transition duration-300",
                index === slideIndex
                  ? "bg-white text-[#2f1c6a] shadow-[0_12px_28px_rgba(0,0,0,0.18)]"
                  : "bg-white/12 text-white/85 ring-1 ring-white/15 hover:bg-white/20",
              )}
            >
              {slide.label}
            </button>
          ))}
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-white/20 shadow-[0_40px_80px_-32px_rgba(0,0,0,0.55)]">
          <div className="relative aspect-[16/7] min-h-[220px] w-full sm:min-h-[280px]">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={active.id}
                custom={direction}
                variants={hbSlide}
                initial={reduce ? false : "enter"}
                animate="center"
                exit={reduce ? undefined : "exit"}
                transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={active.image}
                  alt={active.alt}
                  fill
                  priority
                  sizes="100vw"
                  style={{ objectPosition: active.imagePosition }}
                  className={cn("object-cover", reduce ? "" : "hb-ken")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2f1c6a]/70 via-[#2f1c6a]/10 to-transparent" />
                {active.badge ? (
                  <p className="absolute top-5 left-5 rounded-full bg-gradient-to-r from-[#2563eb] to-[#673de6] px-3.5 py-1 text-[11px] font-bold text-white shadow-lg">
                    {active.badge}
                  </p>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-4 grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {slides.map((slide, slideIndex) => {
            const on = slideIndex === index;
            return (
              <motion.button
                key={slide.id}
                type="button"
                onClick={() => goTo(slideIndex)}
                layout
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "relative overflow-hidden rounded-[18px] text-left",
                  on
                    ? "shadow-[0_28px_50px_-24px_rgba(0,0,0,0.55)] ring-2 ring-white"
                    : "opacity-75 ring-1 ring-white/10 hover:opacity-95",
                )}
              >
                <div className="relative h-[118px] sm:h-[132px]">
                  <Image
                    src={slide.image}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    style={{ objectPosition: slide.imagePosition }}
                    className={cn(
                      "object-cover transition duration-[900ms] ease-out",
                      on ? "scale-100" : "scale-[1.08]",
                    )}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2f1c6a]/80 via-transparent to-transparent" />
                  <p className="absolute right-0 bottom-2 left-0 px-3 text-[12px] font-extrabold text-white">
                    {slide.label}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="relative mx-auto mt-8 min-h-[118px] max-w-2xl text-center text-white">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={active.id}
              custom={direction}
              variants={hbCopy}
              initial={reduce ? false : "enter"}
              animate="center"
              exit={reduce ? undefined : "exit"}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="font-heading text-[clamp(1.45rem,2.8vw,2rem)] font-extrabold tracking-[-0.03em]">
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
      </div>
    </section>
  );
}
