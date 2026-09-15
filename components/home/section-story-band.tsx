"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Props = {
  eyebrow: string;
  lead: string;
  words: string[];
  tail?: string;
  description: string;
  tone?: "light" | "dark";
};

export function SectionStoryBand({
  eyebrow,
  lead,
  words,
  tail,
  description,
  tone = "light",
}: Props) {
  const reduceMotion = useReducedMotion();
  const list = words.filter(Boolean);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || list.length < 2) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % list.length),
      2400,
    );
    return () => window.clearInterval(timer);
  }, [list.length, reduceMotion]);

  const word = list[index] ?? list[0] ?? "";

  return (
    <div
      className={
        tone === "dark" ? "hb-story-band hb-story-band--dark" : "hb-story-band"
      }
    >
      <div className="hb-shell">
        <p
          className={
            tone === "dark"
              ? "text-center text-[11px] font-bold tracking-[0.28em] text-white/55 uppercase"
              : "text-center text-[11px] font-bold tracking-[0.28em] text-slate-500 uppercase"
          }
        >
          {eyebrow}
        </p>
        <h2
          className={
            tone === "dark"
              ? "font-heading mt-2 flex flex-wrap items-baseline justify-center gap-x-2 text-center text-[clamp(1.45rem,3.1vw,2.45rem)] leading-[1.15] font-extrabold tracking-[-0.045em] text-white"
              : "font-heading mt-2 flex flex-wrap items-baseline justify-center gap-x-2 text-center text-[clamp(1.45rem,3.1vw,2.45rem)] leading-[1.15] font-extrabold tracking-[-0.045em] text-slate-950"
          }
        >
          <span>{lead}</span>
          <span className="relative inline-block h-[1.2em] overflow-hidden">
            {reduceMotion || list.length < 2 ? (
              <span
                className={
                  tone === "dark"
                    ? "bg-gradient-to-r from-[#c4b5fd] via-[#a78bfa] to-white bg-clip-text text-transparent"
                    : "bg-gradient-to-r from-[#673de6] via-[#7c3aed] to-[#2f1c6a] bg-clip-text text-transparent"
                }
              >
                {word}
              </span>
            ) : (
              <AnimatePresence mode="wait">
                <motion.span
                  key={word}
                  initial={{ y: "80%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-80%", opacity: 0 }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  className={
                    tone === "dark"
                      ? "inline-block bg-gradient-to-r from-[#c4b5fd] via-[#a78bfa] to-white bg-clip-text text-transparent"
                      : "inline-block bg-gradient-to-r from-[#673de6] via-[#7c3aed] to-[#2f1c6a] bg-clip-text text-transparent"
                  }
                >
                  {word}
                </motion.span>
              </AnimatePresence>
            )}
          </span>
          {tail ? <span>{tail}</span> : null}
        </h2>
        <p
          className={
            tone === "dark"
              ? "mx-auto mt-2 max-w-2xl text-center text-[14.5px] leading-relaxed text-white/70 sm:text-[15.5px]"
              : "mx-auto mt-2 max-w-2xl text-center text-[14.5px] leading-relaxed text-slate-600 sm:text-[15.5px]"
          }
        >
          {description}
        </p>
      </div>
    </div>
  );
}
