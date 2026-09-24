"use client";

import {
  Bot,
  Globe2,
  Mail,
  Server,
  Shield,
  ShoppingCart,
  Sparkles,
  Zap,
} from "lucide-react";

import type { CmsPricingHighlight } from "@/lib/orbit/pricing-content";

const icons = {
  zap: Zap,
  shield: Shield,
  globe: Globe2,
  sparkles: Sparkles,
  cart: ShoppingCart,
  mail: Mail,
  server: Server,
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
        const Icon = icons[item.icon] ?? Sparkles;
        return (
          <div
            key={item.id}
            className="rounded-[22px] border border-[#e9e4ff] bg-white/90 p-4 shadow-[0_14px_32px_-20px_rgba(47,28,106,0.25)]"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-[#f4f0ff] text-[#673de6]">
              <Icon className="size-[18px]" aria-hidden />
            </span>
            <p className="mt-3 text-[14px] font-extrabold text-[#2f1c6a]">
              {item.title}
            </p>
            <p className="mt-1 text-[13px] leading-snug text-[#64748b]">
              {item.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
