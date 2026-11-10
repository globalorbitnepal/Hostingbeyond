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
                "inline-flex size-10 items-center justify-center rounded-2xl",
                isAddon
                  ? "bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-white shadow-[0_10px_18px_-10px_rgba(37,99,235,0.55)]"
                  : "bg-[#f4f0ff] text-[#673de6]",
              )}
            >
              <Icon className="size-[18px]" aria-hidden />
            </span>
            {isAddon ? (
              <p className="mt-3 text-[11px] font-extrabold tracking-[0.14em] text-[#2563eb] uppercase">
                Add-on
              </p>
            ) : null}
            <p
              className={cn(
                "text-[14px] font-extrabold text-[#2f1c6a]",
                isAddon ? "mt-1" : "mt-3",
              )}
            >
              {item.title}
            </p>
            <p className="mt-1 text-[13px] leading-snug text-[#64748b]">
              {item.description}
            </p>
            {isAddon ? (
              <p className="mt-3 text-[12px] font-extrabold text-[#673de6]">
                Add at checkout →
              </p>
            ) : null}
          </>
        );

        const className = cn(
          "rounded-[22px] border p-4 shadow-[0_14px_32px_-20px_rgba(47,28,106,0.25)] backdrop-blur-md",
          isAddon
            ? "border-dashed border-[#a78bfa] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(238,242,255,0.78))] ring-1 ring-[#c4b5fd]/70"
            : "border-[#e9e4ff] bg-white/90",
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
