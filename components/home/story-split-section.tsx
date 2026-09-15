"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { hbCopy, hbSpring } from "@/lib/motion";
import type { CmsStoryBandContent } from "@/lib/orbit/defaults";
import {
  GlassChatChips,
  GlassDomainBar,
  GlassPromptBar,
  GlassVideoFrame,
} from "./glass-video-frame";
import { TemplateStudio } from "./story-template-studio";

export function StorySplitSection({
  content,
  tone = "mist",
}: {
  content: CmsStoryBandContent;
  tone?: "mist" | "aurora" | "sheet";
}) {
  const reduce = useReducedMotion();
  const slides = useMemo(
    () =>
      content.slides
        .filter((slide) => slide.visible !== false)
        .sort((a, b) => a.order - b.order),
    [content.slides],
  );
  const [[index, direction], setPage] = useState([0, 0]);
  const active = slides[index] ?? slides[0];
  const imageFirst = content.imageFirst;

  function goTo(next: number) {
    if (next === index) return;
    setPage([next, next > index ? 1 : -1]);
  }

  useEffect(() => {
    if (reduce || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setPage(([current]) => [(current + 1) % slides.length, 1]);
    }, 5600);
    return () => window.clearInterval(timer);
  }, [reduce, slides.length]);

  if (!content.visible || !active) return null;

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#673de6_0%,#5025d1_48%,#3d1d9a_100%)] py-16 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.16),transparent_52%)]"
      />
      <div className="hb-shell relative grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <motion.div
          className={cn(imageFirst ? "lg:order-2" : "lg:order-1")}
          initial={reduce ? false : { opacity: 0, x: imageFirst ? 36 : -36 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={hbSpring}
        >
          {content.eyebrow ? (
            <p className="text-[12px] font-bold tracking-[0.22em] text-white/60 uppercase">
              {content.eyebrow}
            </p>
          ) : null}
          <h2 className="font-heading mt-2 text-[clamp(1.85rem,3.6vw,3.1rem)] leading-[1.08] font-extrabold tracking-[-0.05em] text-white">
            {content.heading}
          </h2>

          {slides.length > 1 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {slides.map((slide, slideIndex) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(slideIndex)}
                  className={cn(
                    "rounded-full px-4 py-2 text-[13px] font-bold backdrop-blur-xl transition duration-300",
                    index === slideIndex
                      ? "bg-white text-[#2f1c6a] shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
                      : "bg-white/12 text-white/90 ring-1 ring-white/20 hover:bg-white/20",
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
                <h3 className="text-[1.45rem] font-extrabold tracking-tight text-white">
                  {active.title}
                </h3>
                <p className="mt-2 max-w-lg text-[16px] leading-relaxed text-white/75">
                  {active.body}
                </p>
                <Link
                  href={active.ctaHref}
                  className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[14px] font-bold text-[#2f1c6a] shadow-[0_12px_28px_rgba(0,0,0,0.16)]"
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
            "relative aspect-[16/10] w-full",
            imageFirst ? "lg:order-1" : "lg:order-2",
          )}
          initial={reduce ? false : { opacity: 0, x: imageFirst ? -36 : 36 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          {active.id === "templates" &&
          (!active.image?.trim() ||
            active.image.includes("templates.webp") ||
            active.image.includes("/images/home/templates")) ? (
            <TemplateStudio playing={!reduce} />
          ) : (
            <GlassVideoFrame
              key={active.image}
              src={
                active.image.includes("templates.webp")
                  ? "/images/home/wordpress.webp"
                  : active.image
              }
              alt={active.alt}
              playing={!reduce}
              loop
              className="absolute inset-0 h-full min-h-0"
              overlay={
                tone === "mist" ? (
                  <GlassDomainBar domain="yourbrand" playing={!reduce} />
                ) : tone === "aurora" ? (
                  <GlassChatChips
                    playing={!reduce}
                    lines={["Migrate my site", "Draft a campaign"]}
                  />
                ) : (
                  <GlassPromptBar
                    text={
                      active.id === "wordpress"
                        ? "Install WordPress in one click"
                        : active.title
                    }
                    playing={!reduce}
                  />
                )
              }
            />
          )}
        </motion.div>
      </div>
    </section>
  );
}
