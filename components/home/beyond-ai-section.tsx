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
  const scene =
    data.workspaceImageUrl?.trim() ||
    "/images/home/beyond-ai/fullbleed-scene.png";

  return (
    <section className="hb-home-section relative min-h-[34rem] overflow-hidden bg-[#3b0f8a] lg:min-h-[40rem]">
      <Image
        src={scene}
        alt=""
        fill
        priority
        className="object-cover object-[72%_center]"
        sizes="100vw"
      />
      <div className="hb-shell relative z-10 py-16 sm:py-20 lg:py-24">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[34rem]"
        >
          <p className="inline-flex items-center gap-2 text-[1.45rem] font-extrabold tracking-tight text-white">
            <Sparkles className="size-5 text-[#ddd6fe]" aria-hidden />
            {data.badge}
          </p>

          <h2 className="font-heading mt-5 text-[clamp(2.6rem,5.4vw,4.4rem)] leading-[0.96] font-extrabold tracking-[-0.05em] text-white">
            {titleLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <span className="block bg-gradient-to-r from-white via-[#ddd6fe] to-[#a5b4fc] bg-clip-text text-transparent">
              {data.titleAccent}
            </span>
          </h2>

          <p className="mt-5 max-w-[28rem] text-[16px] leading-relaxed text-white/88 sm:text-[17px]">
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
      </div>
    </section>
  );
}
