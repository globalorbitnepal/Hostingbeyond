"use client";

import {
  BarChart3,
  Cloud,
  Code2,
  Crown,
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

/** Matches the premium rhythm: light, ink, light across the first three rows. */
const INK_CARDS = new Set([1, 3, 5, 7, 8, 10, 12, 14]);

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
        <div className="hb-why-head">
          <p className="hb-why-kicker">{data.eyebrow}</p>
          {data.handwrittenNote ? (
            <p className="hb-why-pill">
              <Crown className="size-3.5" strokeWidth={2.2} aria-hidden />
              {data.handwrittenNote}
            </p>
          ) : null}
          <h2 className="font-heading hb-why-title">
            {data.title} <span>{data.titleAccent}</span>
          </h2>
          <p className="hb-why-lead">{data.description}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {items.map((item, index) => {
            const Icon = ICONS[item.icon] ?? Zap;
            const number = String(index + 1).padStart(2, "0");
            const ink = INK_CARDS.has(index);
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
                className={ink ? "hb-why-card hb-why-card--ink" : "hb-why-card"}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="hb-why-card__icon">
                    <Icon className="size-[18px]" strokeWidth={2.15} />
                  </span>
                  <span className="hb-why-card__num">{number}</span>
                </div>
                <h3 className="hb-why-card__title">{item.title}</h3>
                <p className="hb-why-card__copy">{item.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
