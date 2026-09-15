"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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
  const [index, setIndex] = useState(0);
  const active = quotes[index];

  useEffect(() => {
    if (reduce) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % quotes.length),
      6200,
    );
    return () => window.clearInterval(timer);
  }, [reduce]);

  return (
    <section className="hb-home-section hb-home-section--lavender">
      <div className="hb-shell">
        <h2 className="font-heading mx-auto max-w-3xl text-center text-[clamp(1.7rem,3.4vw,2.85rem)] leading-[1.12] font-extrabold tracking-[-0.045em] text-[#2f1c6a]">
          See what customers are creating with HostingBeyond
        </h2>

        <div className="relative mx-auto mt-8 max-w-4xl overflow-hidden rounded-[32px] bg-white shadow-[0_32px_70px_-36px_rgba(47,28,106,0.45)] ring-1 ring-[#e4e0ff]">
          <AnimatePresence mode="wait">
            <motion.article
              key={active.id}
              initial={reduce ? false : { opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -40 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="grid md:grid-cols-[1.15fr_0.85fr]"
            >
              <div className="flex flex-col justify-center px-6 py-8 sm:px-10">
                <p className="text-[18px] leading-relaxed font-medium text-[#2f1c6a] sm:text-[20px]">
                  “{active.quote}”
                </p>
                <p className="mt-6 text-[15px] font-extrabold text-slate-950">
                  {active.name}
                </p>
                <p className="text-[13px] font-semibold text-slate-500">
                  {active.role}
                </p>
              </div>
              <div className="relative min-h-[220px] md:min-h-[280px]">
                <Image
                  src={active.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </motion.article>
          </AnimatePresence>
        </div>

        <div className="mt-5 flex justify-center gap-2">
          {quotes.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Show review from ${item.name}`}
              onClick={() => setIndex(itemIndex)}
              className={
                itemIndex === index
                  ? "h-2 w-7 rounded-full bg-[#673de6]"
                  : "h-2 w-2 rounded-full bg-[#d4c8ff] hover:bg-[#b9a6ff]"
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
