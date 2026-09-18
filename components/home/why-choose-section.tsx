"use client";

import {
  BarChart3,
  Cloud,
  Code2,
  Database,
  Globe,
  Headphones,
  Layers,
  LayoutTemplate,
  Lock,
  Mail,
  MousePointerClick,
  Shield,
  ShieldCheck,
  Star,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import type {
  CmsWhyChooseContent,
  CmsWhyChooseIcon,
} from "@/lib/orbit/defaults";
import { defaultWhyChooseSection } from "@/lib/orbit/defaults";

const ICONS: Record<CmsWhyChooseIcon, typeof Zap> = {
  zap: Zap,
  shield: Shield,
  database: Database,
  globe: Globe,
  lock: Lock,
  mouse: MousePointerClick,
  wordpress: LayoutTemplate,
  chart: BarChart3,
  mail: Mail,
  cloud: Cloud,
  code: Code2,
  secure: ShieldCheck,
  layers: Layers,
  headphones: Headphones,
  star: Star,
};

export function WhyChooseSection({
  content,
}: {
  content?: CmsWhyChooseContent;
}) {
  const data = content ?? defaultWhyChooseSection();
  const reduceMotion = useReducedMotion();
  const items = (data.items ?? [])
    .filter((item) => item.visible !== false)
    .sort((a, b) => a.order - b.order);

  if (!data.visible || items.length === 0) return null;

  return (
    <section className="hb-home-section hb-band-purple">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-[-12%] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(147,197,253,0.35),transparent_68%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-8%] bottom-[-20%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.16),transparent_70%)] blur-2xl"
      />

      <div className="hb-shell relative z-10">
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold tracking-[0.28em] text-white uppercase">
            {data.eyebrow}
          </p>
          <h2 className="font-heading mt-3 text-[clamp(1.75rem,3.6vw,3.15rem)] leading-[1.12] font-extrabold tracking-[-0.045em] text-white">
            {data.title}{" "}
            <span className="text-[#c4b5fd]">{data.titleAccent}</span>
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-white/90 sm:text-[16.5px]">
            {data.description}
          </p>
          {data.handwrittenNote ? (
            <p className="font-hand mt-3 text-[15px] font-semibold text-white xl:hidden">
              {data.handwrittenNote}
            </p>
          ) : null}
          {data.handwrittenNote ? (
            <p className="font-hand absolute -top-2 -right-2 hidden rotate-6 text-[15px] leading-tight font-semibold whitespace-pre-line text-white xl:block">
              {data.handwrittenNote}
            </p>
          ) : null}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {items.map((item, index) => {
            const Icon = ICONS[item.icon] ?? Zap;
            const number = String(index + 1).padStart(2, "0");
            return (
              <motion.article
                key={item.id}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.45,
                  delay: reduceMotion ? 0 : Math.min(index * 0.03, 0.24),
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="rounded-[22px] border border-[#e4dcff] bg-white p-4 shadow-[0_16px_36px_-22px_rgba(47,28,106,0.28)] transition duration-500 hover:-translate-y-1 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#f3eeff] text-[#673de6]">
                    <Icon className="size-[18px]" strokeWidth={1.9} />
                  </span>
                  <span className="pt-1 text-[11px] font-extrabold tracking-wide text-[#673de6]">
                    {number}
                  </span>
                </div>
                <h3 className="mt-3 text-[14.5px] leading-snug font-extrabold tracking-tight text-[#2f1c6a]">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
