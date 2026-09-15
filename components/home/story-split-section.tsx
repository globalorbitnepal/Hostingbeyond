"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { hbCopy, hbSlide, hbSpring } from "@/lib/motion";

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
  tone = "lavender",
  imageFirst = false,
}: {
  eyebrow?: string;
  heading: string;
  slides: StorySlide[];
  tone?: "mist" | "white" | "lavender" | "ice";
  imageFirst?: boolean;
}) {
  const reduce = useReducedMotion();
  const [[index, direction], setPage] = useState([0, 0]);
  const active = slides[index] ?? slides[0];

  function goTo(next: number) {
    if (next === index) return;
    setPage([next, next > index ? 1 : -1]);
  }

  useEffect(() => {
    if (reduce || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setPage(([current]) => {
        const next = (current + 1) % slides.length;
        return [next, 1];
      });
    }, 5600);
    return () => window.clearInterval(timer);
  }, [reduce, slides.length]);

  if (!active) return null;

  const toneClass =
    tone === "white" ? "hb-home-section--white" : "hb-home-section--lavender";

  return (
    <section className={cn("hb-home-section", toneClass)}>
      <div className="hb-shell grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <motion.div
          className={cn(imageFirst ? "lg:order-2" : "lg:order-1")}
          initial={reduce ? false : { opacity: 0, x: imageFirst ? 36 : -36 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={hbSpring}
        >
          {eyebrow ? (
            <p className="text-[12px] font-bold tracking-[0.22em] text-[#673de6] uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="font-heading mt-2 text-[clamp(1.85rem,3.6vw,3.1rem)] leading-[1.08] font-extrabold tracking-[-0.05em] text-[#2f1c6a]">
            {heading}
          </h2>

          {slides.length > 1 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {slides.map((slide, slideIndex) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(slideIndex)}
                  className={cn(
                    "rounded-full px-4 py-2 text-[13px] font-bold transition duration-300",
                    index === slideIndex
                      ? "bg-[#673de6] text-white shadow-[0_12px_24px_rgba(103,61,230,0.32)]"
                      : "bg-white text-[#2f1c6a] ring-1 ring-[#eaeaff] hover:bg-[#f4f5ff]",
                  )}
                >
                  {slide.label}
                </button>
              ))}
            </div>
          ) : null}

          <div className="relative mt-6 min-h-[168px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={active.id}
                custom={direction}
                variants={hbCopy}
                initial={reduce ? false : "enter"}
                animate="center"
                exit={reduce ? undefined : "exit"}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3 className="text-[1.45rem] font-extrabold tracking-tight text-[#2f1c6a]">
                  {active.title}
                </h3>
                <p className="mt-2 max-w-lg text-[16px] leading-relaxed text-[#727586]">
                  {active.body}
                </p>
                <Link
                  href={active.ctaHref}
                  className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#673de6] px-6 text-[14px] font-bold text-white shadow-[0_12px_28px_rgba(103,61,230,0.32)] transition hover:bg-[#5025d1]"
                >
                  {active.ctaLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          className={cn(
            "relative overflow-hidden rounded-[20px] bg-[#f4f5ff] shadow-[0_40px_80px_-40px_rgba(47,28,106,0.55)] ring-1 ring-[#eaeaff]",
            imageFirst ? "lg:order-1" : "lg:order-2",
          )}
          initial={reduce ? false : { opacity: 0, x: imageFirst ? -36 : 36 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative aspect-[16/10] w-full">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={active.image}
                custom={direction}
                variants={hbSlide}
                initial={reduce ? false : "enter"}
                animate="center"
                exit={reduce ? undefined : "exit"}
                transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={active.image}
                  alt={active.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={cn("object-cover", reduce ? "" : "hb-ken")}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
