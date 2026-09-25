"use client";

import { useState } from "react";
import { Headphones, Shield, Zap, Cloud } from "lucide-react";

import { PlanCard } from "@/components/home/hosting-plans-section";
import type { CmsHostingPlansContent } from "@/lib/orbit/defaults";
import { cn } from "@/lib/utils";

type Billing = "annually" | "monthly";

export function HostingPlansCream({
  plansContent,
  eyebrow,
  title,
  titleAccent,
  description,
  footnote,
}: {
  plansContent: CmsHostingPlansContent;
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  footnote: string;
}) {
  const data = plansContent;
  const [billing, setBilling] = useState<Billing>(
    data.defaultBilling === "monthly" ? "monthly" : "annually",
  );

  const plans = [...(data.plans ?? [])]
    .filter((p) => p.visible !== false)
    .sort((a, b) => a.order - b.order);

  const chips = [
    { icon: Headphones, label: data.supportLabel, hint: data.supportHint },
    { icon: Zap, label: data.activationLabel, hint: data.activationHint },
    { icon: Shield, label: data.uptimeLabel, hint: data.uptimeHint },
    { icon: Cloud, label: data.scaleLabel, hint: data.scaleHint },
  ].filter((c) => c.label);

  return (
    <section id="plans" className="hb-band-cream scroll-mt-24 py-16 sm:py-20">
      <div className="hb-shell">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold tracking-[0.28em] text-slate-500 uppercase">
            {eyebrow}
          </p>
          <h2 className="font-heading mt-3 text-[clamp(1.85rem,3.6vw,2.9rem)] font-extrabold tracking-[-0.04em] text-[#2f1c6a]">
            {title} <span className="text-[#673de6]">{titleAccent}</span>
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600 sm:text-[16px]">
            {description}
          </p>
        </div>

        <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-[13px] text-slate-700">
          {chips.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label} className="flex items-start gap-2">
                <Icon className="mt-0.5 size-4 shrink-0 text-[#673de6]" />
                <span>
                  <span className="font-bold">{item.label}</span>
                  {item.hint ? (
                    <span className="block text-[12px] text-slate-500">
                      {item.hint}
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={cn(
                "rounded-full px-4 py-1.5 text-[13px] font-bold transition",
                billing === "monthly"
                  ? "bg-[#2f1c6a] text-white"
                  : "text-slate-600",
              )}
            >
              {data.monthlyToggleLabel || "Monthly"}
            </button>
            <button
              type="button"
              onClick={() => setBilling("annually")}
              className={cn(
                "rounded-full px-4 py-1.5 text-[13px] font-bold transition",
                billing === "annually"
                  ? "bg-emerald-500 text-white"
                  : "text-slate-600",
              )}
            >
              {data.annualToggleLabel || "Annually"}
            </button>
          </div>
          {data.saveBadge ? (
            <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-[12px] font-extrabold text-emerald-800">
              {data.saveBadge}
            </span>
          ) : null}
        </div>

        <div
          className={cn(
            "mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2",
            plans.length <= 3 ? "xl:grid-cols-3" : "xl:grid-cols-4",
          )}
        >
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              billing={billing}
              delay={0.04 * index}
            />
          ))}
        </div>

        {footnote ? (
          <p className="mt-6 text-center text-[12.5px] text-slate-500">
            {footnote}
          </p>
        ) : null}
      </div>
    </section>
  );
}
