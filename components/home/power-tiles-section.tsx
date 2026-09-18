"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import {
  defaultPowerTilesSection,
  type CmsPowerTilesContent,
} from "@/lib/orbit/defaults";
import { hbSpring } from "@/lib/motion";
import { GlassPromptBar, GlassVideoFrame } from "./glass-video-frame";

export function PowerTilesSection({
  content,
}: {
  content?: CmsPowerTilesContent;
}) {
  const reduce = useReducedMotion();
  const data = content ?? defaultPowerTilesSection();
  const tiles = data.tiles
    .filter((tile) => tile.visible !== false)
    .sort((a, b) => a.order - b.order);

  if (!data.visible || !tiles.length) return null;

  return (
    <section className="hb-band-cream relative overflow-hidden pt-16 pb-12 sm:pt-20">
      <div className="hb-shell relative">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={hbSpring}
          className="max-w-3xl"
        >
          <h2 className="font-heading text-[clamp(1.85rem,3.6vw,3.1rem)] leading-[1.08] font-extrabold tracking-[-0.05em] text-[#2f1c6a]">
            {data.title}
          </h2>
          <p className="mt-3 text-[16px] leading-relaxed text-slate-600">
            {data.description}
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {tiles.map((tile, index) => (
            <motion.div
              key={tile.id}
              initial={reduce ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: reduce ? 0 : index * 0.07, duration: 0.5 }}
            >
              <Link
                href={tile.ctaHref}
                className="group grid overflow-hidden rounded-[28px] border border-[#dcd3ff] bg-white shadow-[0_18px_40px_-24px_rgba(47,28,106,0.22)] transition duration-500 hover:-translate-y-1 sm:grid-cols-[1.05fr_0.95fr]"
              >
                <div className="flex flex-col justify-center px-6 py-7">
                  <h3 className="text-[18px] font-extrabold tracking-tight text-[#2f1c6a]">
                    {tile.title}
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-slate-600">
                    {tile.body}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[14px] font-extrabold text-[#673de6]">
                    {tile.ctaLabel}
                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
                <div className="relative min-h-[200px]">
                  <GlassVideoFrame
                    src={tile.image}
                    alt={tile.alt}
                    playing={!reduce}
                    className="absolute inset-0 h-full min-h-0 rounded-none border-0 shadow-none"
                    sizes="(max-width: 768px) 100vw, 30vw"
                    overlay={
                      <GlassPromptBar text={tile.title} playing={!reduce} />
                    }
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
