"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { hbSlide } from "@/lib/motion";
import {
  defaultProofSection,
  type CmsProofContent,
} from "@/lib/orbit/defaults";

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
    <section className="hb-home-section hb-home-section--sheet">
      <div className="hb-shell">
        <h2 className="font-heading mx-auto max-w-3xl text-center text-[clamp(1.85rem,3.6vw,3.1rem)] leading-[1.08] font-extrabold tracking-[-0.05em] text-[#0c1a36]">
          {data.title}
        </h2>

        <div className="relative mx-auto mt-10 max-w-4xl overflow-hidden rounded-[24px] border border-white/80 bg-white/70 shadow-[0_32px_70px_-36px_rgba(37,80,130,0.4)] backdrop-blur-xl">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.article
              key={active.id}
              custom={direction}
              variants={hbSlide}
              initial={reduce ? false : "enter"}
              animate="center"
              exit={reduce ? undefined : "exit"}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="grid md:grid-cols-[1.15fr_0.85fr]"
            >
              <div className="flex flex-col justify-center px-6 py-10 sm:px-12">
                <p className="text-[18px] leading-relaxed font-medium text-[#0c1a36] sm:text-[22px]">
                  “{active.quote}”
                </p>
                <p className="mt-6 text-[15px] font-extrabold text-[#0c1a36]">
                  {active.name}
                </p>
                <p className="text-[13px] font-semibold text-slate-500">
                  {active.role}
                </p>
              </div>
              <div className="relative min-h-[240px] md:min-h-[320px]">
                <Image
                  src={active.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className={reduce ? "object-cover" : "hb-ken object-cover"}
                />
              </div>
            </motion.article>
          </AnimatePresence>
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
                  ? "h-2 w-8 rounded-full bg-gradient-to-r from-[#2563eb] to-[#673de6] transition-all"
                  : "h-2 w-2 rounded-full bg-[#c7d2fe] transition-all hover:bg-[#a5b4fc]"
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
