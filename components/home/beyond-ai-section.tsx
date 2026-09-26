"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Globe, PenLine, Sparkles, Zap } from "lucide-react";
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

export function BeyondAiSection({ content }: { content?: CmsBeyondAiContent }) {
  const data = content ?? defaultBeyondAiSection();
  const reduce = useReducedMotion();
  const steps = data.highlights.slice(0, 3);
  const titleLines = data.title.split("\n").filter(Boolean);
  const image =
    data.workspaceImageUrl?.trim() ||
    "/images/home/beyond-ai/workspace-visual.png";

  return (
    <section className="hb-home-section relative overflow-hidden bg-[#4c1d95]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_12%_18%,rgba(255,255,255,0.14),transparent_34%),radial-gradient(ellipse_at_88%_72%,rgba(129,140,248,0.22),transparent_46%),linear-gradient(180deg,#5b21b6_0%,#4c1d95_42%,#312e81_100%)]"
      />
      <div className="hb-shell relative z-10 py-14 sm:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-6 xl:gap-10">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="inline-flex items-center gap-2 text-[1.45rem] font-extrabold tracking-tight text-white">
              <Sparkles className="size-5 text-[#ddd6fe]" aria-hidden />
              {data.badge}
            </p>

            <h2 className="font-heading mt-5 text-[clamp(2.55rem,5.2vw,4.35rem)] leading-[0.96] font-extrabold tracking-[-0.05em] text-white">
              {titleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <span className="block bg-gradient-to-r from-white via-[#ddd6fe] to-[#a5b4fc] bg-clip-text text-transparent">
                {data.titleAccent}
              </span>
            </h2>

            <p className="mt-5 max-w-[28rem] text-[16px] leading-relaxed text-white/86 sm:text-[17px]">
              {data.description}
            </p>

            <ul className="mt-8 space-y-5">
              {steps.map((item) => {
                const Icon = stepIcons[item.icon] ?? Zap;
                return (
                  <li key={item.id} className="flex items-start gap-3.5">
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
                  </li>
                );
              })}
            </ul>

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

          <motion.div
            initial={reduce ? false : { opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <Image
              src={image}
              alt={data.workspaceImageAlt}
              width={1280}
              height={720}
              priority
              className="h-auto w-full rounded-[26px] object-cover"
              sizes="(max-width: 1024px) 100vw, 720px"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
