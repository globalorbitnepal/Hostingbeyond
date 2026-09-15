"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { defaultJourneySection } from "@/lib/orbit/defaults";
import type { CmsJourneyContent, CmsJourneySlide } from "@/lib/orbit/defaults";
import { cn } from "@/lib/utils";
import { hbCopy } from "@/lib/motion";

function useTyped(text: string, playing: boolean, reduce: boolean | null) {
  const [count, setCount] = useState(reduce || !playing ? text.length : 0);

  useEffect(() => {
    if (reduce || !playing) {
      setCount(text.length);
      return;
    }
    setCount(0);
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) window.clearInterval(timer);
    }, 42);
    return () => window.clearInterval(timer);
  }, [text, playing, reduce]);

  return text.slice(0, count);
}

function GlassCard({
  active,
  onSelect,
  children,
  className,
}: {
  active: boolean;
  onSelect: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      layout
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative h-[280px] overflow-hidden rounded-[28px] text-left sm:h-[320px] lg:h-[340px]",
        "border border-white/35 bg-white/12 shadow-[0_28px_60px_-28px_rgba(15,10,40,0.55)] backdrop-blur-2xl",
        active
          ? "ring-2 ring-white/90"
          : "opacity-90 hover:opacity-100 hover:ring-1 hover:ring-white/40",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

function BuildScene({
  image,
  alt,
  playing,
  reduce,
}: {
  image: string;
  alt: string;
  playing: boolean;
  reduce: boolean | null;
}) {
  const prompt = useTyped(
    "Create a website for my sunglasses business",
    playing,
    reduce,
  );
  return (
    <div className="absolute inset-0">
      <Image
        src={image}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 42vw"
        className={cn(
          "object-cover",
          playing && !reduce ? "hb-ken" : "scale-[1.04]",
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#2f1c6a]/35 via-transparent to-white/5" />
      <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-white/88 px-3 py-1 text-[11px] font-extrabold text-[#2f1c6a] shadow-sm backdrop-blur-xl">
        <Sparkles className="size-3 text-[#673de6]" />
        Start
      </span>
      <div className="absolute inset-x-4 bottom-5 sm:inset-x-8">
        <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/88 px-4 py-3 shadow-[0_16px_40px_rgba(47,28,106,0.22)] backdrop-blur-xl">
          <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[#2f1c6a] sm:text-[15px]">
            {prompt}
            <span className="hb-caret ml-0.5 inline-block h-[1em] w-[2px] bg-[#673de6] align-[-2px]" />
          </p>
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-r from-[#2563eb] to-[#673de6] text-white">
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </div>
  );
}

function LaunchScene({
  image,
  playing,
  reduce,
}: {
  image: string;
  playing: boolean;
  reduce: boolean | null;
}) {
  const domain = useTyped("launchsitetoday", playing, reduce);
  return (
    <div className="absolute inset-0">
      <Image
        src={image}
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 28vw"
        className={cn("object-cover", playing && !reduce ? "hb-ken" : "")}
      />
      <div className="absolute inset-0 bg-[#2563eb]/10" />
      <motion.div
        className="absolute inset-x-3 top-1/2 -translate-y-1/2 sm:inset-x-5"
        animate={reduce ? undefined : { y: playing ? [0, -6, 0] : 0 }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex overflow-hidden rounded-[22px] border border-white/80 bg-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
          <p className="flex-1 truncate px-4 py-4 text-[17px] font-semibold tracking-tight text-[#0c1a36] sm:px-5 sm:text-[22px]">
            {domain}
            <span className="hb-caret ml-0.5 inline-block h-[1em] w-[2px] bg-[#673de6] align-[-2px]" />
          </p>
          <span className="flex items-center bg-[#f4f5ff] px-4 text-[16px] font-extrabold text-[#673de6] sm:px-5 sm:text-[20px]">
            .com
          </span>
        </div>
      </motion.div>
    </div>
  );
}

function GrowScene({
  classic,
  round,
  playing,
}: {
  classic: string;
  round: string;
  playing: boolean;
}) {
  const items = [
    { src: classic, name: "Classic shades", price: "$48" },
    { src: round, name: "Sunnys key clip", price: "$18" },
    { src: round, name: "Round shades", price: "$36" },
  ];
  return (
    <div className="absolute inset-0 bg-[linear-gradient(180deg,#f7f4ff_0%,#eef4ff_100%)] p-3 sm:p-4">
      <div className="flex h-full flex-col justify-center gap-2.5">
        {items.map((item, index) => (
          <motion.div
            key={item.name}
            className="flex items-center gap-3 rounded-[18px] bg-white/90 px-3 py-2.5 shadow-[0_10px_24px_rgba(47,28,106,0.08)] ring-1 ring-white"
            animate={
              playing ? { x: [8, 0], opacity: [0.4, 1] } : { x: 0, opacity: 1 }
            }
            transition={{
              delay: index * 0.18,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <span className="relative size-12 overflow-hidden rounded-2xl bg-[#f4f5ff] sm:size-14">
              <Image src={item.src} alt="" fill className="object-cover" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-extrabold text-[#0c1a36]">
                {item.name}
              </span>
              <span className="text-[12px] font-semibold text-[#673de6]">
                {item.price}
              </span>
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ManageScene({ playing }: { playing: boolean }) {
  return (
    <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8f6ff_0%,#eef3ff_100%)] px-4 py-5">
      <div className="flex h-full flex-col">
        <div className="text-center">
          <span className="mx-auto mb-2 grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#673de6] text-lg text-white shadow-[0_10px_24px_rgba(103,61,230,0.35)]">
            ✦
          </span>
          <p className="text-[16px] font-extrabold text-[#0c1a36]">Hello 👋</p>
          <p className="mt-0.5 text-[12px] font-medium text-slate-500">
            How can I help you today?
          </p>
        </div>
        <div className="mt-4 space-y-2">
          {[
            "I want to migrate to HostingBeyond",
            "I want to create a website",
          ].map((line, index) => (
            <motion.p
              key={line}
              className="rounded-2xl bg-white/85 px-3 py-2 text-[12px] font-semibold text-[#2f1c6a] shadow-sm ring-1 ring-white"
              animate={
                playing ? { y: [10, 0], opacity: [0, 1] } : { y: 0, opacity: 1 }
              }
              transition={{ delay: 0.2 + index * 0.22, duration: 0.5 }}
            >
              ↗ {line}
            </motion.p>
          ))}
        </div>
      </div>
    </div>
  );
}

function scenePhoto(slide: CmsJourneySlide, fallback: string) {
  const src = slide.image || "";
  if (!src || /\/journey\/(discover|create|scale|beyond)\./i.test(src)) {
    return fallback;
  }
  return src;
}

function sceneKind(slide: CmsJourneySlide, index: number) {
  const id = slide.id.toLowerCase();
  if (id.includes("create") || id.includes("launch")) return "launch";
  if (id.includes("scale") || id.includes("grow")) return "grow";
  if (id.includes("beyond") || id.includes("manage")) return "manage";
  if (id.includes("discover") || id.includes("build")) return "build";
  return (["build", "launch", "grow", "manage"] as const)[index] ?? "build";
}

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
    <section className="relative z-20 overflow-hidden bg-[linear-gradient(180deg,#673de6_0%,#5b35e0_42%,#3d1d9a_100%)] pt-8 pb-14 sm:pt-10 sm:pb-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.18),transparent_52%)]"
      />
      <div className="hb-shell relative">
        <div className="mb-7 flex flex-wrap justify-center gap-2">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(slideIndex)}
              className={cn(
                "rounded-full px-5 py-2 text-[13px] font-bold backdrop-blur-xl transition duration-300",
                index === slideIndex
                  ? "bg-white text-[#2f1c6a] shadow-[0_12px_28px_rgba(0,0,0,0.18)]"
                  : "bg-white/12 text-white/90 ring-1 ring-white/20 hover:bg-white/20",
              )}
            >
              {slide.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:gap-4">
          {slides.map((slide, slideIndex) => {
            const kind = sceneKind(slide, slideIndex);
            const on = slideIndex === index;
            return (
              <GlassCard
                key={slide.id}
                active={on}
                onSelect={() => goTo(slideIndex)}
                className={on ? "lg:col-span-6" : "lg:col-span-2"}
              >
                {kind === "build" ? (
                  <BuildScene
                    image={scenePhoto(slide, "/images/journey/build-towel.png")}
                    alt={slide.alt}
                    playing={on}
                    reduce={reduce}
                  />
                ) : null}
                {kind === "launch" ? (
                  <LaunchScene
                    image={scenePhoto(slide, "/images/journey/launch-sky.png")}
                    playing={on}
                    reduce={reduce}
                  />
                ) : null}
                {kind === "grow" ? (
                  <GrowScene
                    classic="/images/journey/product-classic.png"
                    round="/images/journey/product-round.png"
                    playing={on}
                  />
                ) : null}
                {kind === "manage" ? <ManageScene playing={on} /> : null}
              </GlassCard>
            );
          })}
        </div>

        <div className="relative mx-auto mt-9 min-h-[108px] max-w-2xl text-center text-white">
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
              <h2 className="font-heading text-[clamp(1.55rem,3vw,2.15rem)] font-extrabold tracking-[-0.04em]">
                {active.title}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-white/78 sm:text-[16px]">
                {active.body}
              </p>
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
