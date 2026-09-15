"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { useTyped } from "@/hooks/use-typed";
import { cn } from "@/lib/utils";

export function GlassVideoFrame({
  src,
  alt,
  playing = true,
  overlay,
  className,
  sizes = "(max-width: 1024px) 100vw, 50vw",
  loop = false,
}: {
  src: string;
  alt: string;
  playing?: boolean;
  overlay?: ReactNode;
  className?: string;
  sizes?: string;
  loop?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <div
      className={cn(
        "relative min-h-[240px] overflow-hidden rounded-[28px] border border-white/45 bg-white/12 shadow-[0_32px_70px_-28px_rgba(15,10,40,0.45)] backdrop-blur-2xl",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={cn(
          "object-cover",
          playing && !reduce ? (loop ? "hb-video" : "hb-ken") : "scale-[1.06]",
        )}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2f1c6a]/28 via-transparent to-white/8" />
      {overlay}
    </div>
  );
}

export function GlassVideoStage({
  src,
  alt,
  overlay,
  children,
  className,
}: {
  src: string;
  alt: string;
  overlay?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[16/10] min-h-[260px] w-full sm:min-h-[320px] lg:min-h-[380px]",
        className,
      )}
    >
      <GlassVideoFrame
        src={src}
        alt={alt}
        loop
        playing
        overlay={overlay}
        className="absolute inset-0 h-full min-h-0 rounded-[32px] border-white/50 ring-1 ring-white/25"
        sizes="(max-width: 1024px) 100vw, 52vw"
      />
      {children}
    </div>
  );
}

export function GlassBand({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-[linear-gradient(180deg,#2563eb_0%,#4f46e5_32%,#673de6_68%,#3d1d9a_100%)] py-16 sm:py-20",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-8%,rgba(255,255,255,0.2),transparent_52%)]"
      />
      {children}
    </section>
  );
}

export function GlassPromptBar({
  text,
  playing = true,
  className,
}: {
  text: string;
  playing?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const typed = useTyped(text, playing, reduce, true);

  return (
    <div
      className={cn(
        "absolute inset-x-3 bottom-3 z-30 sm:inset-x-4 sm:bottom-4",
        className,
      )}
    >
      <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/92 px-3 py-2 shadow-[0_16px_40px_rgba(47,28,106,0.2)] backdrop-blur-xl sm:px-4 sm:py-2.5">
        <p className="min-w-0 flex-1 truncate text-[12px] font-semibold text-[#2f1c6a] sm:text-[14px]">
          {typed}
          <span className="hb-caret ml-0.5 inline-block h-[1em] w-[2px] bg-[#673de6] align-[-2px]" />
        </p>
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-r from-[#2563eb] to-[#673de6] text-sm font-bold text-white sm:size-8">
          →
        </span>
      </div>
    </div>
  );
}

export function GlassDomainBar({
  domain,
  tld = ".com",
  playing = true,
  className,
}: {
  domain: string;
  tld?: string;
  playing?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const typed = useTyped(domain, playing, reduce, true);

  return (
    <motion.div
      className={cn(
        "absolute inset-x-3 bottom-3 z-30 sm:inset-x-4 sm:bottom-4",
        className,
      )}
      animate={reduce ? undefined : { y: playing ? [0, -4, 0] : 0 }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="flex overflow-hidden rounded-[18px] border border-white/80 bg-white shadow-[0_24px_50px_rgba(15,23,42,0.2)]">
        <p className="flex-1 truncate px-3 py-2.5 text-[14px] font-semibold tracking-tight text-[#0c1a36] sm:px-4 sm:text-[16px]">
          {typed}
          <span className="hb-caret ml-0.5 inline-block h-[1em] w-[2px] bg-[#673de6] align-[-2px]" />
        </p>
        <span className="flex items-center bg-[#f4f5ff] px-3 text-[13px] font-extrabold text-[#673de6] sm:px-4 sm:text-[15px]">
          {tld}
        </span>
      </div>
    </motion.div>
  );
}

export function GlassChatChips({
  lines,
  playing = true,
  className,
}: {
  lines: string[];
  playing?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("absolute inset-x-4 bottom-5 z-20 space-y-2", className)}
    >
      {lines.map((line, index) => (
        <motion.p
          key={line}
          className="rounded-2xl border border-white/70 bg-white/90 px-3 py-2 text-[12px] font-semibold text-[#2f1c6a] shadow-sm backdrop-blur-xl"
          animate={
            playing ? { y: [10, 0], opacity: [0, 1] } : { y: 0, opacity: 1 }
          }
          transition={{ delay: 0.15 + index * 0.2, duration: 0.45 }}
        >
          ↗ {line}
        </motion.p>
      ))}
    </div>
  );
}
