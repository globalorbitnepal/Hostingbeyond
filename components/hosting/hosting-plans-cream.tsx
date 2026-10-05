"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Cloud, Headphones, Shield, Zap } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { PlanCard } from "@/components/home/hosting-plans-section";
import type { CmsHostingPlansContent } from "@/lib/orbit/defaults";
import { cn } from "@/lib/utils";

type Billing = "annually" | "monthly";

const CHIP_STYLES: Record<
  string,
  { icon: LucideIcon; iconBg: string; iconColor: string }
> = {
  support: {
    icon: Headphones,
    iconBg: "bg-gradient-to-br from-[#7c3aed] to-[#673de6]",
    iconColor: "text-white",
  },
  activation: {
    icon: Zap,
    iconBg: "bg-gradient-to-br from-[#2563eb] to-[#3b82f6]",
    iconColor: "text-white",
  },
  uptime: {
    icon: Shield,
    iconBg: "bg-gradient-to-br from-[#059669] to-[#10b981]",
    iconColor: "text-white",
  },
  scale: {
    icon: Cloud,
    iconBg: "bg-gradient-to-br from-[#0891b2] to-[#22d3ee]",
    iconColor: "text-white",
  },
};

function chipKey(label: string, index: number) {
  const l = label.toLowerCase();
  if (l.includes("support")) return "support";
  if (l.includes("activ")) return "activation";
  if (l.includes("uptime")) return "uptime";
  if (l.includes("scal")) return "scale";
  return ["support", "activation", "uptime", "scale"][index] ?? "scale";
}

export function HostingPlansCream({
  plansContent,
  eyebrow,
  title,
  titleAccent,
  description,
  footnote,
  className,
  productCheckoutSlug,
}: {
  plansContent: CmsHostingPlansContent;
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  footnote: string;
  className?: string;
  productCheckoutSlug?: string;
}) {
  const data = plansContent;
  const reduce = useReducedMotion();
  const [billing, setBilling] = useState<Billing>(
    data.defaultBilling === "monthly" ? "monthly" : "annually",
  );

  const plans = [...(data.plans ?? [])]
    .filter((p) => p.visible !== false)
    .sort((a, b) => a.order - b.order);

  const chips = [
    { label: data.supportLabel, hint: data.supportHint },
    { label: data.activationLabel, hint: data.activationHint },
    { label: data.uptimeLabel, hint: data.uptimeHint },
    { label: data.scaleLabel, hint: data.scaleHint },
  ].filter((c) => c.label);

  const fade = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-40px" },
          transition: {
            duration: 0.45,
            delay,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        };

  return (
    <section
      id="plans"
      className={cn(
        "hb-band-cream relative scroll-mt-24 overflow-hidden py-12 sm:py-16 lg:py-20",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#35206f]/12 to-transparent"
      />

      <div className="hb-shell relative">
        <motion.div {...fade(0)} className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-extrabold tracking-[0.28em] text-[#5b21b6]/80 uppercase sm:text-[12px]">
            {eyebrow}
          </p>
          <h2 className="font-heading mt-3 text-[clamp(1.9rem,3.8vw,2.95rem)] leading-[1.12] font-extrabold tracking-[-0.04em] text-[#2f1c6a]">
            {title}{" "}
            <span className="bg-gradient-to-r from-[#673de6] to-[#7c3aed] bg-clip-text text-transparent">
              {titleAccent}
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed font-medium text-slate-600 sm:text-[16px]">
            {description}
          </p>
        </motion.div>

        {chips.length > 0 ? (
          <ul className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {chips.map((item, index) => {
              const key = chipKey(item.label, index);
              const style = CHIP_STYLES[key];
              const Icon = style.icon;
              return (
                <motion.li
                  key={item.label}
                  {...fade(0.06 + index * 0.04)}
                  className="flex min-h-[5.5rem] items-start gap-3 rounded-2xl border border-white/90 bg-white/75 p-4 shadow-[0_12px_32px_-18px_rgba(47,28,106,0.2)] backdrop-blur-sm sm:min-h-[6rem] sm:p-4"
                >
                  <span
                    className={cn(
                      "inline-flex size-11 shrink-0 items-center justify-center rounded-xl shadow-[0_8px_20px_-8px_rgba(47,28,106,0.45)]",
                      style.iconBg,
                    )}
                  >
                    <Icon
                      className={cn("size-5", style.iconColor)}
                      strokeWidth={2.25}
                      aria-hidden
                    />
                  </span>
                  <span className="min-w-0 pt-0.5 text-left">
                    <span className="block text-[13px] leading-snug font-extrabold text-[#2f1c6a] sm:text-[14px]">
                      {item.label}
                    </span>
                    {item.hint ? (
                      <span className="mt-1 block text-[12px] leading-snug font-medium text-slate-500 sm:text-[13px]">
                        {item.hint}
                      </span>
                    ) : null}
                  </span>
                </motion.li>
              );
            })}
          </ul>
        ) : null}

        <motion.div
          {...fade(0.12)}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:mt-12 sm:flex-row sm:gap-4"
        >
          <div
            className="inline-flex max-w-full items-center rounded-full border border-slate-200/90 bg-white p-1 shadow-[0_10px_28px_-12px_rgba(47,28,106,0.25)] ring-1 ring-white"
            role="group"
            aria-label="Billing period"
          >
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              aria-pressed={billing === "monthly"}
              className={cn(
                "min-h-11 touch-manipulation rounded-full px-5 py-2.5 text-[14px] font-extrabold transition-all duration-200 sm:px-6",
                billing === "monthly"
                  ? "bg-[#2f1c6a] text-white shadow-[0_6px_16px_-6px_rgba(47,28,106,0.55)]"
                  : "text-slate-600 hover:text-[#2f1c6a]",
              )}
            >
              {data.monthlyToggleLabel || "Monthly"}
            </button>
            <button
              type="button"
              onClick={() => setBilling("annually")}
              aria-pressed={billing === "annually"}
              className={cn(
                "min-h-11 touch-manipulation rounded-full px-5 py-2.5 text-[14px] font-extrabold transition-all duration-200 sm:px-6",
                billing === "annually"
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-[0_6px_16px_-6px_rgba(16,185,129,0.55)]"
                  : "text-slate-600 hover:text-[#2f1c6a]",
              )}
            >
              {data.annualToggleLabel || "Annually"}
            </button>
          </div>
          {data.saveBadge ? (
            <span
              className={cn(
                "inline-flex min-h-11 items-center rounded-full px-4 py-2 text-[13px] font-extrabold transition-opacity duration-200",
                billing === "annually"
                  ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80"
                  : "bg-slate-100 text-slate-500 opacity-70",
              )}
            >
              {data.saveBadge}
            </span>
          ) : null}
        </motion.div>

        <div
          className={cn(
            "mt-10 grid grid-cols-1 gap-4 sm:mt-12 md:grid-cols-2 xl:grid-cols-4 xl:gap-5",
          )}
        >
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              billing={billing}
              delay={0.04 * index}
              productCheckoutSlug={productCheckoutSlug}
            />
          ))}
        </div>

        {footnote ? (
          <p className="mt-8 text-center text-[12.5px] leading-relaxed font-medium text-slate-500 sm:mt-10 sm:text-[13px]">
            {footnote}
          </p>
        ) : null}
      </div>
    </section>
  );
}
