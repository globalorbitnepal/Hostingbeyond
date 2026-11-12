"use client";

import {
  Bot,
  Globe2,
  HardDrive,
  Mail,
  Shield,
  ShoppingCart,
  Sparkles,
  Zap,
} from "lucide-react";

import type { CmsPricingHighlight } from "@/lib/orbit/pricing-content";
import { cn } from "@/lib/utils";

const icons = {
  zap: Zap,
  shield: Shield,
  globe: Globe2,
  sparkles: Sparkles,
  cart: ShoppingCart,
  mail: Mail,
  server: HardDrive,
  bot: Bot,
} as const;

export function PricingHighlights({
  highlights,
}: {
  highlights: CmsPricingHighlight[];
}) {
  const items = highlights
    .filter((h) => h.visible !== false)
    .sort((a, b) => a.order - b.order);
  if (!items.length) return null;

  return (
    <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon =
          item.id === "storage" ? HardDrive : (icons[item.icon] ?? Sparkles);
        const isAddon = item.id === "storage";
        const inner = (
          <>
            <span
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-2xl text-white shadow-[0_10px_20px_-10px_rgba(15,23,42,0.45)]",
                isAddon
                  ? "bg-white/20 ring-1 ring-white/35"
                  : "bg-white/18 ring-1 ring-white/25",
              )}
            >
              <Icon className="size-[18px]" aria-hidden />
            </span>
            {isAddon ? (
              <p className="mt-3 text-[11px] font-extrabold tracking-[0.16em] text-white uppercase">
                Add-on
              </p>
            ) : null}
            <p
              className={cn(
                "text-[15px] font-extrabold text-white",
                isAddon ? "mt-1" : "mt-3",
              )}
            >
              {item.title}
            </p>
            <p className="mt-1.5 text-[13.5px] leading-snug font-medium text-white/92">
              {item.description}
            </p>
            {isAddon ? (
              <p className="mt-3 text-[13px] font-extrabold text-white">
                Add at checkout →
              </p>
            ) : null}
          </>
        );

        const className = cn(
          "rounded-[22px] border p-5 shadow-[0_18px_36px_-18px_rgba(47,28,106,0.55)]",
          isAddon
            ? "border-white/35 bg-gradient-to-br from-[#2563eb] via-[#4f46e5] to-[#7c3aed] ring-1 ring-white/25"
            : "border-white/20 bg-gradient-to-br from-[#5b21b6] via-[#673de6] to-[#7c3aed]",
        );

        if (isAddon) {
          return (
            <a
              key={item.id}
              href="#plan-selector"
              className={cn(
                className,
                "block transition hover:-translate-y-0.5",
              )}
            >
              {inner}
            </a>
          );
        }

        return (
          <div key={item.id} className={className}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
