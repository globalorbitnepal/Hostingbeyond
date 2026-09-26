"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Globe, Sparkles, Wand2, Zap } from "lucide-react";
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
  cloud: Wand2,
  globe: Globe,
  rocket: Globe,
};

export function BeyondAiSection({ content }: { content?: CmsBeyondAiContent }) {
  const data = content ?? defaultBeyondAiSection();
  const reduceMotion = useReducedMotion();
  const steps = data.highlights.slice(0, 3);
  const titleLines = data.title.split("\n").filter(Boolean);
  const image =
    data.workspaceImageUrl?.trim() || "/images/home/beyond-ai/dream-hero.png";

  return (
    <section className="hb-home-section relative overflow-hidden bg-[linear-gradient(115deg,#4c1d95_0%,#5b21b6_28%,#6d28d9_55%,#312e81_100%)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_20%,rgba(255,255,255,0.16),transparent_36%),radial-gradient(ellipse_at_80%_70%,rgba(56,189,248,0.16),transparent_42%)]"
      />
      <div className="hb-shell relative z-10 py-12 sm:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55 }}
          >
            <p className="inline-flex items-center gap-2 text-[1.35rem] font-extrabold tracking-tight text-white sm:text-[1.55rem]">
              <Sparkles className="size-5 text-[#c4b5fd]" aria-hidden />
              {data.badge}
            </p>

            <h2 className="font-heading mt-5 text-[clamp(2.4rem,5vw,4.15rem)] leading-[0.98] font-extrabold tracking-[-0.045em] text-white">
              {titleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <span className="block bg-gradient-to-r from-[#e9d5ff] via-[#c4b5fd] to-[#a5b4fc] bg-clip-text text-transparent">
                {data.titleAccent}
              </span>
            </h2>

            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-white/88 sm:text-[17px]">
              {data.description}
            </p>

            <ul className="mt-7 space-y-4">
              {steps.map((item) => {
                const Icon = stepIcons[item.icon] ?? Zap;
                return (
                  <li key={item.id} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/12 text-white ring-1 ring-white/25">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-[15px] font-extrabold text-white">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-[13px] text-white/75">
                        {item.subtitle}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>

            <Link
              href={data.primaryCtaHref || routes.beyondAi}
              className={cn(
                "group relative mt-8 inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-white px-6 text-[15px] font-bold text-[#4c1d95] shadow-[0_14px_36px_rgba(15,10,40,0.28)]",
                "transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,10,40,0.38)]",
              )}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent transition duration-700 group-hover:translate-x-full"
              />
              <span className="relative">{data.primaryCtaLabel}</span>
              <ArrowRight className="relative size-4 transition duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <Image
              src={image}
              alt={data.workspaceImageAlt}
              width={1280}
              height={720}
              priority
              className="h-auto w-full rounded-[28px] object-cover shadow-[0_30px_80px_-30px_rgba(15,10,40,0.55)]"
              sizes="(max-width: 1024px) 100vw, 720px"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
