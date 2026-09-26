"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AppWindow,
  ArrowRight,
  Check,
  Globe,
  Menu,
  PenLine,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { routes } from "@/config/routes";
import {
  defaultBeyondAiSection,
  type CmsBeyondAiContent,
  type CmsBeyondAiHighlight,
} from "@/lib/orbit/defaults";
import { cn } from "@/lib/utils";

const stepIcons: Record<CmsBeyondAiHighlight["icon"], typeof Zap> = {
  zap: Zap,
  cloud: PenLine,
  globe: Globe,
  rocket: Globe,
};

function FloatChip({
  className,
  delay,
  children,
}: {
  className?: string;
  delay: number;
  children: ReactNode;
}) {
  return (
    <motion.span
      className={cn(
        "absolute z-20 grid size-12 place-items-center rounded-[16px] bg-[#8b5cf6] text-white shadow-[0_14px_30px_rgba(47,28,106,0.35)] ring-1 ring-white/25",
        className,
      )}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3.4, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.span>
  );
}

export function BeyondAiSection({ content }: { content?: CmsBeyondAiContent }) {
  const data = content ?? defaultBeyondAiSection();
  const reduce = useReducedMotion();
  const steps = data.highlights.slice(0, 3);
  const titleLines = data.title.split("\n").filter(Boolean);
  const photo =
    data.workspaceImageUrl?.trim() || "/images/home/beyond-ai/person-desk.png";

  return (
    <section className="hb-home-section relative overflow-hidden bg-[#4c1d95]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_12%,rgba(255,255,255,0.14),transparent_34%),linear-gradient(115deg,#5b21b6_0%,#4c1d95_48%,#3b0f8a_100%)]"
      />

      <div className="hb-shell relative z-10 grid items-center gap-8 py-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-4 lg:py-16 xl:gap-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.5 }}
          className="max-w-[36rem]"
        >
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-[1.4rem] font-extrabold tracking-tight text-white"
          >
            <Sparkles className="size-5 text-[#ddd6fe]" aria-hidden />
            {data.badge}
          </motion.p>

          <h2 className="font-heading mt-5 text-[clamp(2.55rem,5.2vw,4.35rem)] leading-[0.96] font-extrabold tracking-[-0.05em] text-white">
            {titleLines.map((line, index) => (
              <motion.span
                key={line}
                className="block"
                initial={reduce ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.06 * (index + 1) }}
              >
                {line}
              </motion.span>
            ))}
            <motion.span
              className="block bg-gradient-to-r from-white via-[#ddd6fe] to-[#c4b5fd] bg-clip-text text-transparent"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.22 }}
            >
              {data.titleAccent}
            </motion.span>
          </h2>

          <motion.p
            className="mt-5 max-w-[28rem] text-[16px] leading-relaxed text-white/88 sm:text-[17px]"
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.28 }}
          >
            {data.description}
          </motion.p>

          <ul className="mt-8 space-y-5">
            {steps.map((item, index) => {
              const Icon = stepIcons[item.icon] ?? Zap;
              return (
                <motion.li
                  key={item.id}
                  className="flex items-start gap-3.5"
                  initial={reduce ? false : { opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.32 + index * 0.08 }}
                >
                  <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white/12 text-white ring-1 ring-white/20">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-[15px] font-extrabold text-white">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-white/72">
                      {item.subtitle}
                    </span>
                  </span>
                </motion.li>
              );
            })}
          </ul>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.58 }}
          >
            <Link
              href={data.primaryCtaHref || routes.beyondAi}
              className={cn(
                "group relative mt-9 inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-white px-7 text-[15px] font-bold text-[#4c1d95]",
                "shadow-[0_16px_40px_rgba(15,10,40,0.32)] transition duration-300",
                "hover:-translate-y-0.5 hover:shadow-[0_20px_46px_rgba(15,10,40,0.4)]",
              )}
            >
              <span
                aria-hidden
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#ede9fe] to-transparent transition duration-700 group-hover:translate-x-full"
              />
              <span className="relative">{data.primaryCtaLabel}</span>
              <ArrowRight className="relative size-4 transition duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>

        <div className="relative min-h-[320px] lg:min-h-[520px]">
          <Image
            src={photo}
            alt=""
            fill
            priority
            className="object-contain object-bottom lg:object-right-bottom"
            sizes="(max-width: 1024px) 100vw, 58vw"
          />

          <FloatChip className="top-[8%] right-[18%] hidden lg:grid" delay={0}>
            <Sparkles className="size-5" />
          </FloatChip>
          <FloatChip className="top-[4%] right-[6%] hidden lg:grid" delay={0.6}>
            <AppWindow className="size-5" />
          </FloatChip>

          <motion.div
            className="absolute top-[10%] right-0 hidden w-[min(100%,360px)] rounded-[22px] bg-white p-5 shadow-[0_28px_60px_-28px_rgba(15,10,40,0.45)] lg:block"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between gap-2 text-[10px] font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5 font-extrabold text-[#4c1d95]">
                <Sparkles className="size-3.5" />
                Beyond AI
              </span>
              <span className="hidden items-center gap-3 xl:flex">
                Home
                <span>Templates</span>
                <span>Features</span>
                <span>Pricing</span>
                <span>Sign In</span>
              </span>
              <Menu className="size-4 text-slate-400" />
            </div>
            <p className="font-heading mt-5 text-[1.55rem] leading-[1.1] font-extrabold tracking-[-0.04em] text-slate-950">
              Turn Your Ideas
              <br />
              Into Real Websites
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
              Drag, drop and make it live in minutes with AI.
            </p>
            <Link
              href={data.primaryCtaHref || routes.beyondAi}
              className="mt-4 inline-flex h-9 items-center rounded-full bg-[#673de6] px-4 text-[12px] font-bold text-white"
            >
              Start Building
            </Link>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
              <Globe className="size-3.5 text-[#673de6]" />
              Live Website
              <span className="text-slate-400">Ready in minutes</span>
              <Check className="size-3.5 text-emerald-500" />
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
