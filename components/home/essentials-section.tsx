"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import {
  defaultEssentialsSection,
  type CmsEssentialsContent,
} from "@/lib/orbit/defaults";
import { hbSpring } from "@/lib/motion";
import { GlassPromptBar, GlassVideoFrame } from "./glass-video-frame";

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
    <section className="hb-band-cream relative overflow-hidden pt-16 pb-12 sm:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.16),transparent_46%)]"
      />
      <div className="hb-shell relative">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={hbSpring}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="font-heading text-[clamp(1.85rem,3.6vw,3.1rem)] leading-[1.08] font-extrabold tracking-[-0.05em] text-[#2f1c6a]">
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
              <Link href={card.ctaHref} className="group block h-full">
                <div className="relative h-[280px] sm:h-[300px]">
                  <GlassVideoFrame
                    src={card.image}
                    alt={card.alt}
                    playing={!reduce}
                    className="absolute inset-0 h-full min-h-0 transition duration-500 group-hover:-translate-y-1"
                    sizes="(max-width: 1280px) 50vw, 25vw"
                    overlay={
                      <GlassPromptBar text={card.title} playing={!reduce} />
                    }
                  />
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-[#2f1c6a]/80">
                  {card.body}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-[14px] font-extrabold text-[#2563eb]">
                  {card.ctaLabel}
                  <ArrowRight className="size-4 text-[#673de6] transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
