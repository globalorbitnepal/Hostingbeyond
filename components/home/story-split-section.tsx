"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export type StorySlide = {
  id: string;
  label: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  alt: string;
};

export function StorySplitSection({
  eyebrow,
  heading,
  slides,
  tone = "mist",
  imageFirst = false,
}: {
  eyebrow?: string;
  heading: string;
  slides: StorySlide[];
  tone?: "mist" | "white" | "lavender" | "ice";
  imageFirst?: boolean;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const active = slides[index] ?? slides[0];

  useEffect(() => {
    if (reduce || slides.length < 2) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % slides.length),
      5600,
    );
    return () => window.clearInterval(timer);
  }, [reduce, slides.length]);

  if (!active) return null;

  const toneClass =
    tone === "white"
      ? "hb-home-section--white"
      : tone === "lavender"
        ? "hb-home-section--lavender"
        : "hb-home-section--ice";

  return (
    <section className={cn("hb-home-section", toneClass)}>
      <div className="hb-shell grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <motion.div
          className={cn(imageFirst ? "lg:order-2" : "lg:order-1")}
          initial={reduce ? false : { opacity: 0, x: imageFirst ? 28 : -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {eyebrow ? (
            <p className="text-[11px] font-bold tracking-[0.28em] text-[#673de6] uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="font-heading mt-2 text-[clamp(1.7rem,3.4vw,2.85rem)] leading-[1.12] font-extrabold tracking-[-0.045em] text-[#2f1c6a]">
            {heading}
          </h2>

          {slides.length > 1 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {slides.map((slide, slideIndex) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setIndex(slideIndex)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-[13px] font-bold transition",
                    index === slideIndex
                      ? "bg-[#673de6] text-white shadow-[0_10px_22px_rgba(103,61,230,0.28)]"
                      : "bg-white text-[#2f1c6a] ring-1 ring-[#e4e0ff] hover:bg-[#f4f5ff]",
                  )}
                >
                  {slide.label}
                </button>
              ))}
            </div>
          ) : null}

          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <h3 className="mt-6 text-[1.35rem] font-extrabold tracking-tight text-[#2f1c6a]">
                {active.title}
              </h3>
              <p className="mt-2 max-w-lg text-[15.5px] leading-relaxed text-slate-600">
                {active.body}
              </p>
              <Link
                href={active.ctaHref}
                className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-[#673de6] px-6 text-[14px] font-bold text-white shadow-[0_12px_28px_rgba(103,61,230,0.32)]"
              >
                {active.ctaLabel}
                <ArrowRight className="size-4" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div
          className={cn(
            "relative overflow-hidden rounded-[32px] shadow-[0_32px_70px_-32px_rgba(47,28,106,0.5)]",
            imageFirst ? "lg:order-1" : "lg:order-2",
          )}
          initial={reduce ? false : { opacity: 0, x: imageFirst ? -28 : 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative aspect-[16/10] w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.image}
                initial={reduce ? false : { opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45 }}
                className="absolute inset-0"
              >
                <Image
                  src={active.image}
                  alt={active.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
