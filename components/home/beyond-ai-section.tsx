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
        "absolute z-20 grid size-[52px] place-items-center rounded-[18px] bg-[#7c3aed] text-white shadow-[0_16px_32px_rgba(47,28,106,0.32)] ring-1 ring-white/20",
        className,
      )}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3.6, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.span>
  );
}

function PreviewCard({ href }: { href: string }) {
  return (
    <div className="rounded-[26px] bg-white p-5 shadow-[0_28px_70px_-24px_rgba(15,10,40,0.5)] sm:p-6">
      <div className="flex items-center justify-between gap-3 text-[10px] font-semibold text-slate-400">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-extrabold text-[#4c1d95]">
          <Sparkles className="size-3.5" aria-hidden />
          Beyond AI
        </span>
        <span className="hidden items-center gap-3 xl:flex">
          Home
          <span>Templates</span>
          <span>Features</span>
          <span>Pricing</span>
          <span>Sign In</span>
        </span>
        <Menu className="size-4 text-slate-400" aria-hidden />
      </div>
      <p className="font-heading mt-6 text-[1.7rem] leading-[1.08] font-extrabold tracking-[-0.045em] text-slate-950 sm:text-[1.85rem]">
        Turn Your Ideas
        <br />
        Into Real Websites
      </p>
      <p className="mt-2 max-w-[16rem] text-[12.5px] leading-relaxed text-slate-500">
        Drag, drop and make it live in minutes with AI.
      </p>
      <Link
        href={href}
        className="mt-5 inline-flex h-10 items-center rounded-full bg-[#7c3aed] px-5 text-[13px] font-bold text-white"
      >
        Start Building
      </Link>
      <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
        <Globe className="size-3.5 text-[#7c3aed]" aria-hidden />
        Live Website
        <span className="font-medium text-slate-400">Ready in minutes</span>
        <Check className="size-3.5 text-emerald-500" aria-hidden />
      </p>
    </div>
  );
}

export function BeyondAiSection({ content }: { content?: CmsBeyondAiContent }) {
  const data = content ?? defaultBeyondAiSection();
  const reduce = useReducedMotion();
  const steps = data.highlights.slice(0, 3);
  const titleLines = data.title.split("\n").filter(Boolean);
  const scene =
    data.workspaceImageUrl?.trim() || "/images/home/beyond-ai/scene-full.png";
  const ctaHref = data.primaryCtaHref || routes.beyondAi;

  return (
    <section className="relative overflow-hidden bg-[#6d28d9] !py-0">
      <Image
        src={scene}
        alt=""
        fill
        priority
        className="hidden object-cover object-[center_center] lg:block"
        sizes="100vw"
      />

      <div className="hb-shell relative z-10 grid items-center py-16 sm:py-20 lg:min-h-[44rem] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:py-0 xl:min-h-[48rem]">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.5 }}
          className="max-w-[34rem]"
        >
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-[1.35rem] font-extrabold tracking-tight text-white"
          >
            <Sparkles className="size-5 text-[#ddd6fe]" aria-hidden />
            {data.badge}
          </motion.p>

          <h2 className="font-heading mt-5 text-[clamp(2.6rem,5.4vw,4.45rem)] leading-[0.95] font-extrabold tracking-[-0.05em] text-white">
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
              className="block"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.22 }}
            >
              {data.titleAccent}
            </motion.span>
          </h2>

          <motion.p
            className="mt-5 max-w-[27rem] text-[16px] leading-relaxed text-white/88 sm:text-[17px]"
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
              href={ctaHref}
              className={cn(
                "group relative mt-9 inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-white px-7 text-[15px] font-bold text-[#5b21b6]",
                "shadow-[0_16px_40px_rgba(15,10,40,0.28)] transition duration-300",
                "hover:-translate-y-0.5 hover:shadow-[0_20px_46px_rgba(15,10,40,0.38)]",
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

        <div className="relative hidden h-full min-h-[36rem] lg:block">
          <FloatChip className="top-[11%] right-[36%]" delay={0}>
            <Sparkles className="size-5" />
          </FloatChip>
          <FloatChip className="top-[8%] right-[8%]" delay={0.55}>
            <AppWindow className="size-5" />
          </FloatChip>

          <motion.div
            className="absolute top-[16%] right-0 w-[min(100%,380px)]"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.18, duration: 0.5 }}
          >
            <PreviewCard href={ctaHref} />
          </motion.div>
        </div>
      </div>

      <div className="relative h-[20rem] overflow-hidden sm:h-[24rem] lg:hidden">
        <Image
          src={scene}
          alt=""
          fill
          className="object-cover object-[78%_center]"
          sizes="100vw"
        />
        <motion.div
          className="absolute right-4 bottom-5 w-[min(100%-2rem,280px)]"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <PreviewCard href={ctaHref} />
        </motion.div>
      </div>
    </section>
  );
}
