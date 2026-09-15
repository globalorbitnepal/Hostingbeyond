"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { hbCopy } from "@/lib/motion";
import {
  defaultProofSection,
  type CmsProofContent,
} from "@/lib/orbit/defaults";
import { GlassVideoFrame } from "./glass-video-frame";

export function ProofSliderSection({ content }: { content?: CmsProofContent }) {
  const reduce = useReducedMotion();
  const data = content ?? defaultProofSection();
  const quotes = useMemo(
    () =>
      data.quotes
        .filter((quote) => quote.visible !== false)
        .sort((a, b) => a.order - b.order),
    [data.quotes],
  );
  const [[index, direction], setPage] = useState([0, 0]);
  const active = quotes[index];

  function goTo(next: number) {
    if (next === index) return;
    setPage([next, next > index ? 1 : -1]);
  }

  useEffect(() => {
    if (reduce || quotes.length < 2) return;
    const timer = window.setInterval(() => {
      setPage(([current]) => [(current + 1) % quotes.length, 1]);
    }, 6200);
    return () => window.clearInterval(timer);
  }, [reduce, quotes.length]);

  if (!data.visible || !active) return null;

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#673de6_0%,#5025d1_55%,#2f1c6a_100%)] py-16 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.16),transparent_52%)]"
      />
      <div className="hb-shell relative">
        <h2 className="font-heading mx-auto max-w-3xl text-center text-[clamp(1.85rem,3.6vw,3.1rem)] leading-[1.08] font-extrabold tracking-[-0.05em] text-white">
          {data.title}
        </h2>

        <div className="mx-auto mt-10 grid max-w-5xl items-center gap-6 overflow-hidden rounded-[28px] border border-white/35 bg-white/12 p-3 shadow-[0_32px_70px_-28px_rgba(15,10,40,0.5)] backdrop-blur-2xl md:grid-cols-[1.1fr_0.9fr] md:p-4">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={active.id}
              custom={direction}
              variants={hbCopy}
              initial={reduce ? false : "enter"}
              animate="center"
              exit={reduce ? undefined : "exit"}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col justify-center px-4 py-8 sm:px-8"
            >
              <p className="text-[18px] leading-relaxed font-medium text-white sm:text-[22px]">
                “{active.quote}”
              </p>
              <p className="mt-6 text-[15px] font-extrabold text-white">
                {active.name}
              </p>
              <p className="text-[13px] font-semibold text-white/65">
                {active.role}
              </p>
            </motion.div>
          </AnimatePresence>
          <div className="relative min-h-[240px] md:min-h-[320px]">
            <GlassVideoFrame
              src={active.image}
              alt=""
              playing={!reduce}
              className="absolute inset-0 h-full min-h-0"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {quotes.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Show review from ${item.name}`}
              onClick={() => goTo(itemIndex)}
              className={
                itemIndex === index
                  ? "h-2 w-8 rounded-full bg-white transition-all"
                  : "h-2 w-2 rounded-full bg-white/35 transition-all hover:bg-white/60"
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
