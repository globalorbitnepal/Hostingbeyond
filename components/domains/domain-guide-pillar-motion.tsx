"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeftRight, Globe2, Server } from "lucide-react";

import type { DomainGuidePillar } from "@/lib/domains/content";
import { cn } from "@/lib/utils";

export function DomainGuidePillarMotion({
  pillar,
  className,
}: {
  pillar: DomainGuidePillar["pillar"];
  className?: string;
}) {
  const reduce = useReducedMotion();
  const playing = !reduce;

  return (
    <div
      className={cn(
        "relative h-full min-h-[200px] w-full overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b]/90 via-[#312e81]/80 to-[#0f172a]/90" />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(129,140,248,0.8) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      {pillar === "what" ? <WhatMotion playing={playing} /> : null}
      {pillar === "transfer" ? <TransferMotion playing={playing} /> : null}
      {pillar === "hosting" ? <HostingMotion playing={playing} /> : null}
    </div>
  );
}

function WhatMotion({ playing }: { playing: boolean }) {
  return (
    <div className="relative z-10 flex h-full items-center justify-center p-8">
      <motion.div
        className="relative flex size-32 items-center justify-center sm:size-36"
        animate={playing ? { rotate: 360 } : undefined}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
      >
        <span className="absolute top-0 left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-[#a5b4fc] shadow-[0_0_14px_rgba(165,180,252,0.95)]" />
        <div className="flex size-28 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md sm:size-32">
          <Globe2
            className="size-14 text-[#c4b5fd] sm:size-16"
            strokeWidth={1.5}
          />
        </div>
      </motion.div>
      <motion.span
        className="absolute bottom-8 rounded-lg bg-[#673de6] px-2.5 py-1 text-[11px] font-extrabold text-white shadow-lg"
        animate={playing ? { scale: [1, 1.05, 1] } : undefined}
        transition={{ duration: 2.2, repeat: Infinity }}
      >
        yourbrand.com
      </motion.span>
    </div>
  );
}

function TransferMotion({ playing }: { playing: boolean }) {
  return (
    <div className="relative z-10 flex h-full items-center justify-center gap-3 px-6 sm:gap-5">
      <DomainChip label="old-reg.io" muted />
      <motion.div
        animate={playing ? { x: [0, 6, 0] } : undefined}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowLeftRight className="size-8 text-[#a5b4fc] sm:size-9" />
      </motion.div>
      <DomainChip label="hostingbeyond" highlight />
    </div>
  );
}

function DomainChip({
  label,
  muted,
  highlight,
}: {
  label: string;
  muted?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-center text-[12px] font-extrabold tracking-tight sm:text-[13px]",
        highlight
          ? "border-[#673de6]/60 bg-[#673de6]/25 text-white shadow-[0_0_30px_rgba(103,61,230,0.35)]"
          : muted
            ? "border-white/15 bg-white/5 text-white/60"
            : "border-white/20 bg-white/10 text-white",
      )}
    >
      {label}
    </div>
  );
}

function HostingMotion({ playing }: { playing: boolean }) {
  return (
    <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 p-6">
      <div className="flex items-center gap-4">
        <motion.div
          className="flex size-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10"
          animate={playing ? { y: [0, -4, 0] } : undefined}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <Globe2 className="size-8 text-[#c4b5fd]" />
        </motion.div>
        <motion.div
          className="h-0.5 w-10 rounded-full bg-gradient-to-r from-[#673de6] to-[#60a5fa]"
          animate={playing ? { scaleX: [0.4, 1, 0.4] } : undefined}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ originX: 0.5 }}
        />
        <motion.div
          className="flex size-16 items-center justify-center rounded-2xl border border-[#673de6]/40 bg-[#673de6]/20"
          animate={playing ? { y: [0, 4, 0] } : undefined}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.2 }}
        >
          <Server className="size-8 text-white" />
        </motion.div>
      </div>
      <p className="text-[11px] font-bold tracking-wide text-white/50 uppercase">
        Domain + hosting
      </p>
    </div>
  );
}
