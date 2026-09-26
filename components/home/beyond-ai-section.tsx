"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AppWindow,
  ArrowRight,
  Check,
  Globe,
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

const previewThumbs = [
  {
    src: "/images/home/beyond-ai/alpine-trails.jpg",
    label: "Adventure Awaits",
  },
  { src: "/images/home/beyond-ai/luxe-stay.jpg", label: "Stay" },
  { src: "/images/home/beyond-ai/ocean-escapes.jpg", label: "Coast" },
  { src: "/images/home/beyond-ai/desert-dunes.jpg", label: "City" },
];

function BeyondAiBadge({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "hb-ai-nav inline-flex items-center justify-center gap-1.5 rounded-full border border-violet-200/80 bg-white font-bold tracking-[-0.02em] text-slate-950",
        "h-10 px-4 text-[15px] shadow-[0_8px_22px_rgba(79,70,229,0.16),inset_0_1px_0_rgba(255,255,255,1)]",
      )}
    >
      <span className="hb-ai-nav__shine" aria-hidden />
      <Sparkles
        className="hb-ai-nav__spark size-4 shrink-0 text-[#7c3aed]"
        aria-hidden
      />
      <span>
        Beyond <span className="hb-ai-nav__word">AI</span>
      </span>
    </Link>
  );
}

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
        "absolute z-20 grid size-11 place-items-center rounded-[14px] bg-[#7c3aed] text-white shadow-[0_12px_28px_rgba(47,28,106,0.34)] ring-1 ring-white/25",
        className,
      )}
      animate={{ y: [0, -9, 0] }}
      transition={{ duration: 3.5, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.span>
  );
}

function PreviewCard({ href }: { href: string }) {
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-[22px] bg-white/96 p-4 shadow-[0_28px_70px_-20px_rgba(20,8,60,0.45)] ring-1 ring-white/80 backdrop-blur-md sm:p-5">
        <div className="flex items-center justify-between gap-2 text-[10px] font-semibold text-slate-400">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#4c1d95]">
            <Sparkles className="size-3.5" aria-hidden />
            Beyond AI
          </span>
          <span className="hidden items-center gap-2.5 xl:flex">
            Home
            <span>Templates</span>
            <span>Features</span>
            <span>Pricing</span>
            <span>Sign In</span>
          </span>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] sm:items-start">
          <div>
            <p className="font-heading text-[1.35rem] leading-[1.08] font-extrabold tracking-[-0.04em] text-slate-950 sm:text-[1.5rem]">
              Turn Your Ideas
              <br />
              Into Real Websites
            </p>
            <p className="mt-2 max-w-[15rem] text-[11.5px] leading-relaxed text-slate-500">
              Drag, drop and make it live in minutes with AI.
            </p>
            <Link
              href={href}
              className="mt-4 inline-flex h-9 items-center rounded-full bg-[#7c3aed] px-4 text-[12px] font-bold text-white"
            >
              Start Building
            </Link>
          </div>

          <div className="grid gap-2">
            <div className="relative h-[88px] overflow-hidden rounded-xl sm:h-[96px]">
              <Image
                src={previewThumbs[0].src}
                alt=""
                fill
                className="object-cover"
                sizes="220px"
              />
              <span className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white drop-shadow">
                {previewThumbs[0].label}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {previewThumbs.slice(1).map((thumb) => (
                <div
                  key={thumb.src}
                  className="relative h-12 overflow-hidden rounded-lg"
                >
                  <Image
                    src={thumb.src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="absolute right-3 -bottom-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-[0_10px_24px_rgba(20,8,60,0.16)] ring-1 ring-slate-100">
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
    <section className="relative w-full overflow-hidden bg-[#6d28d9]">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] lg:block xl:w-[56%]">
        <Image
          src={scene}
          alt=""
          fill
          priority
          className="object-contain object-right-bottom"
          sizes="58vw"
        />
      </div>

      <div className="hb-shell relative z-10 grid items-center py-16 sm:py-20 lg:min-h-[40rem] lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,34rem)] lg:py-16 xl:min-h-[44rem]">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.48 }}
          className="max-w-[38rem]"
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <BeyondAiBadge href={ctaHref} />
          </motion.div>

          <h2 className="font-heading mt-5 text-[clamp(2.82rem,5.5vw,4.6rem)] leading-[0.96] font-extrabold tracking-[-0.05em] text-white">
            {titleLines.map((line, index) => (
              <motion.span
                key={line}
                className="block"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * (index + 1) }}
              >
                {line}
              </motion.span>
            ))}
            <motion.span
              className="block text-[#f5f3ff]"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.16 }}
            >
              {data.titleAccent}
            </motion.span>
          </h2>

          <motion.p
            className="mt-5 max-w-[26rem] text-[17.5px] leading-snug text-white/84"
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.22 }}
          >
            {data.description}
          </motion.p>

          <ul className="mt-7 space-y-4">
            {steps.map((item, index) => {
              const Icon = stepIcons[item.icon] ?? Zap;
              return (
                <motion.li
                  key={item.id}
                  className="flex items-start gap-3.5"
                  initial={reduce ? false : { opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.26 + index * 0.07 }}
                >
                  <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white/12 text-white">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-[16px] font-extrabold text-white">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-[13.5px] text-white/70">
                      {item.subtitle}
                    </span>
                  </span>
                </motion.li>
              );
            })}
          </ul>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <Link
              href={ctaHref}
              className={cn(
                "group relative mt-8 inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-white px-7 text-[16px] font-bold text-[#5b21b6]",
                "shadow-[0_14px_32px_rgba(15,10,40,0.24)] transition duration-300",
                "hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,10,40,0.32)]",
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

        <div className="relative hidden h-full min-h-[28rem] lg:block">
          <FloatChip className="top-[8%] right-[78%]" delay={0}>
            <Sparkles className="size-[18px]" />
          </FloatChip>
          <FloatChip className="top-[2%] right-[6%]" delay={0.5}>
            <AppWindow className="size-[18px]" />
          </FloatChip>

          <motion.div
            className="absolute top-[6%] right-0 w-full max-w-[32rem]"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16, duration: 0.48 }}
          >
            <PreviewCard href={ctaHref} />
          </motion.div>
        </div>
      </div>

      <div className="relative overflow-hidden lg:hidden">
        <div className="relative mx-auto h-[22rem] w-full max-w-[40rem] sm:h-[26rem]">
          <Image
            src={scene}
            alt=""
            fill
            className="object-contain object-bottom"
            sizes="100vw"
          />
        </div>
        <motion.div
          className="relative z-10 mx-4 -mt-8 mb-8"
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
