"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { hbSlide } from "@/lib/motion";

const quotes = [
  {
    id: "amina",
    quote:
      "HostingBeyond AI makes development incredibly fast. I can design, prototype, and launch without wasting a weekend.",
    name: "Amina Koirala",
    role: "Studio founder",
    image: "/images/journey/create.webp",
  },
  {
    id: "daniel",
    quote:
      "Domains, WordPress, and mail in one panel. The rate is why we moved. The inbox is why we stayed.",
    name: "Daniel Mercer",
    role: "Agency lead",
    image: "/images/journey/scale.webp",
  },
  {
    id: "sofia",
    quote:
      "I explained what I wanted, and Beyond AI did the rest. The site was live in a couple of hours.",
    name: "Sofia Alvarez",
    role: "Shop owner",
    image: "/images/journey/beyond.webp",
  },
];

export function ProofSliderSection() {
  const reduce = useReducedMotion();
  const [[index, direction], setPage] = useState([0, 0]);
  const active = quotes[index];

  function goTo(next: number) {
    if (next === index) return;
    setPage([next, next > index ? 1 : -1]);
  }

  useEffect(() => {
    if (reduce) return;
    const timer = window.setInterval(() => {
      setPage(([current]) => [(current + 1) % quotes.length, 1]);
    }, 6200);
    return () => window.clearInterval(timer);
  }, [reduce]);

  return (
    <section className="hb-home-section hb-home-section--white">
      <div className="hb-shell">
        <h2 className="font-heading mx-auto max-w-3xl text-center text-[clamp(1.85rem,3.6vw,3.1rem)] leading-[1.08] font-extrabold tracking-[-0.05em] text-[#2f1c6a]">
          See what customers are creating with HostingBeyond
        </h2>

        <div className="relative mx-auto mt-10 max-w-4xl overflow-hidden rounded-[20px] bg-[#f4f5ff]">
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
                <p className="text-[18px] leading-relaxed font-medium text-[#2f1c6a] sm:text-[22px]">
                  “{active.quote}”
                </p>
                <p className="mt-6 text-[15px] font-extrabold text-[#2f1c6a]">
                  {active.name}
                </p>
                <p className="text-[13px] font-semibold text-[#727586]">
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
                  ? "h-2 w-8 rounded-full bg-[#673de6] transition-all"
                  : "h-2 w-2 rounded-full bg-[#d9d2ff] transition-all hover:bg-[#b9a6ff]"
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
