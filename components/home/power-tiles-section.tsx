"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import {
  defaultPowerTilesSection,
  type CmsPowerTilesContent,
} from "@/lib/orbit/defaults";
import { hbSpring } from "@/lib/motion";

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
    <section className="hb-home-section hb-home-section--aurora">
      <div className="hb-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={hbSpring}
          className="max-w-3xl"
        >
          <h2 className="font-heading text-[clamp(1.85rem,3.6vw,3.1rem)] leading-[1.08] font-extrabold tracking-[-0.05em] text-[#0c1a36]">
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
                className="group grid overflow-hidden rounded-[24px] border border-white/80 bg-white/75 shadow-[0_24px_50px_-32px_rgba(37,80,130,0.4)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:shadow-[0_28px_50px_-28px_rgba(103,61,230,0.38)] sm:grid-cols-[1.15fr_0.85fr]"
              >
                <div className="flex flex-col justify-center px-6 py-7">
                  <h3 className="text-[18px] font-extrabold text-[#0c1a36]">
                    {tile.title}
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-slate-600">
                    {tile.body}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[14px] font-extrabold text-[#2563eb]">
                    {tile.ctaLabel}
                    <ArrowRight className="size-4 text-[#673de6] transition group-hover:translate-x-0.5" />
                  </span>
                </div>
                <div className="relative min-h-[180px]">
                  <Image
                    src={tile.image}
                    alt={tile.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 30vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.06]"
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
