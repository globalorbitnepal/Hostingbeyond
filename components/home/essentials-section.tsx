"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import {
  defaultEssentialsSection,
  type CmsEssentialsContent,
} from "@/lib/orbit/defaults";
import { hbSpring } from "@/lib/motion";

export function EssentialsSection({
  content,
}: {
  content?: CmsEssentialsContent;
}) {
  const reduce = useReducedMotion();
  const data = content ?? defaultEssentialsSection();
  const cards = data.cards
    .filter((card) => card.visible !== false)
    .sort((a, b) => a.order - b.order);

  if (!data.visible || !cards.length) return null;

  return (
    <section className="hb-home-section hb-home-section--aurora">
      <div className="hb-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={hbSpring}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="font-heading text-[clamp(1.85rem,3.6vw,3.1rem)] leading-[1.08] font-extrabold tracking-[-0.05em] text-[#0c1a36]">
            {data.title}
          </h2>
          <p className="mt-3 text-[16px] leading-relaxed text-slate-600">
            {data.description}
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card, index) => (
            <motion.article
              key={card.id}
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                delay: reduce ? 0 : index * 0.08,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                href={card.ctaHref}
                className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-white/80 bg-white/70 shadow-[0_24px_50px_-32px_rgba(37,80,130,0.45)] backdrop-blur-xl transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_50px_-28px_rgba(103,61,230,0.4)]"
              >
                <div className="relative h-[200px] overflow-hidden sm:h-[220px]">
                  <Image
                    src={card.image}
                    alt={card.alt}
                    fill
                    sizes="(max-width: 1280px) 50vw, 25vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.06]"
                  />
                </div>
                <div className="flex flex-1 flex-col px-5 py-5">
                  <h3 className="text-[18px] font-extrabold tracking-tight text-[#0c1a36]">
                    {card.title}
                  </h3>
                  <p className="mt-1.5 flex-1 text-[14px] leading-relaxed text-slate-600">
                    {card.body}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[14px] font-extrabold text-[#2563eb]">
                    {card.ctaLabel}
                    <ArrowRight className="size-4 text-[#673de6] transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
