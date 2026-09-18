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
    <section className="hb-band-cream relative overflow-hidden py-16 sm:py-20">
      <div className="hb-shell relative">
        <h2 className="font-heading mx-auto max-w-3xl text-center text-[clamp(1.85rem,3.6vw,3.1rem)] leading-[1.08] font-extrabold tracking-[-0.05em] text-[#2f1c6a]">
          {data.title}
        </h2>

        <div className="mx-auto mt-10 grid max-w-5xl items-center gap-6 overflow-hidden rounded-[28px] border border-white/80 bg-white/70 p-3 shadow-[0_32px_70px_-28px_rgba(15,10,40,0.18)] backdrop-blur-2xl md:grid-cols-[1.1fr_0.9fr] md:p-4">
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
              <p className="text-[18px] leading-relaxed font-medium text-[#2f1c6a] sm:text-[22px]">
                “{active.quote}”
              </p>
              <p className="mt-6 text-[15px] font-extrabold text-[#2f1c6a]">
                {active.name}
              </p>
              <p className="text-[13px] font-semibold text-slate-500">
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
                  ? "h-2 w-8 rounded-full bg-[#2f1c6a] transition-all"
                  : "h-2 w-2 rounded-full bg-[#2f1c6a]/25 transition-all hover:bg-[#2f1c6a]/50"
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
