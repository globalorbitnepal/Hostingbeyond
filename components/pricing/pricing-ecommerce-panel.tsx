"use client";

import Link from "next/link";
import { ArrowRight, Check, Star } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import {
  AnnualPlanPerks,
  filterPlanFeatures,
  getAnnualPerkLines,
} from "@/components/hosting/annual-plan-perks";
import { planBookingHref } from "@/lib/hosting/checkout";
import type { CmsHostingPlan } from "@/lib/orbit/defaults";
import { cn } from "@/lib/utils";

type Billing = "annually" | "monthly";

export function PricingEcommercePanel({
  plans,
  billing,
  onBillingChange,
  productCheckoutSlug = "ecommerce-hosting",
}: {
  plans: CmsHostingPlan[];
  billing: Billing;
  onBillingChange: (b: Billing) => void;
  productCheckoutSlug?: string;
}) {
  const reduceMotion = useReducedMotion();
  const visible = [...plans]
    .filter((p) => p.visible !== false)
    .sort((a, b) => a.order - b.order);

  return (
    <div id="plan-selector" className="scroll-mt-28">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-center text-[13px] font-semibold text-[#475569] sm:text-left">
          Select a commerce plan. Annual billing is{" "}
          <span className="font-extrabold text-emerald-700">10% off</span> the
          monthly price.
        </p>
        <div className="inline-flex items-center rounded-full border border-[#e9e4ff] bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => onBillingChange("monthly")}
            className={cn(
              "rounded-full px-4 py-1.5 text-[13px] font-bold transition",
              billing === "monthly"
                ? "bg-[#2f1c6a] text-white"
                : "text-[#64748b]",
            )}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => onBillingChange("annually")}
            className={cn(
              "rounded-full px-4 py-1.5 text-[13px] font-bold transition",
              billing === "annually"
                ? "bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white"
                : "text-[#64748b]",
            )}
          >
            Annually
          </button>
        </div>
      </div>

      <div className="isolate mt-6 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2 xl:grid-cols-4">
        {visible.map((plan, index) => {
          const popular = plan.popular;
          const isAnnual = billing === "annually";
          const price = isAnnual ? plan.priceAnnually : plan.priceMonthly;
          const original = isAnnual
            ? plan.originalAnnually
            : plan.originalMonthly;
          const billed = isAnnual ? plan.billedAnnually : plan.billedMonthly;
          const save = isAnnual ? plan.saveAnnually : plan.saveMonthly;
          const annualPerks = getAnnualPerkLines(plan, isAnnual);
          const features = filterPlanFeatures(plan.features, annualPerks);

          return (
            <motion.article
              key={plan.id}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className={cn(
                "relative isolate flex h-full min-w-0 flex-col overflow-hidden rounded-[28px] p-5 sm:p-6",
                popular
                  ? "z-10 bg-[linear-gradient(165deg,#2563eb_0%,#4f46e5_48%,#7c3aed_100%)] pt-6 text-white shadow-[0_28px_48px_-16px_rgba(37,99,235,0.55)] ring-2 ring-white/40"
                  : "bg-white text-[#2f1c6a] shadow-[0_20px_40px_-22px_rgba(15,23,42,0.32)] ring-1 ring-white",
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                {plan.discountBadge && isAnnual ? (
                  <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white uppercase shadow-[0_8px_16px_rgba(16,185,129,0.35)]">
                    {plan.discountBadge}
                  </span>
                ) : null}
                {popular && plan.popularLabel ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-extrabold text-white uppercase ring-1 ring-white/35">
                    <Star className="size-3 fill-current" aria-hidden />
                    {plan.popularLabel}
                  </span>
                ) : null}
              </div>

              <h3
                className={cn(
                  "font-heading mt-4 text-[1.35rem] font-extrabold",
                  popular ? "text-white" : "text-[#2f1c6a]",
                )}
              >
                {plan.name}
              </h3>
              <p
                className={cn(
                  "mt-1 min-h-[2.5rem] text-[13px]",
                  popular ? "text-white/80" : "text-[#64748b]",
                )}
              >
                {plan.tagline}
              </p>

              {original ? (
                <p
                  className={cn(
                    "mt-2 text-[13px] font-semibold line-through",
                    popular ? "text-white/55" : "text-[#94a3b8]",
                  )}
                >
                  {original}
                </p>
              ) : null}
              <p className="mt-0.5 flex items-end gap-1">
                <span
                  className={cn(
                    "text-[2rem] font-extrabold tracking-tight",
                    popular ? "text-white" : "text-[#673de6]",
                  )}
                >
                  {price}
                </span>
                <span
                  className={cn(
                    "pb-1 text-[13px] font-bold",
                    popular ? "text-white/75" : "text-[#64748b]",
                  )}
                >
                  /mo
                </span>
              </p>
              <p
                className={cn(
                  "mt-1 text-[12px] font-semibold",
                  popular ? "text-white/80" : "text-[#475569]",
                )}
              >
                {billed}
                {save && isAnnual ? (
                  <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 font-extrabold text-emerald-700 ring-1 ring-emerald-200">
                    {save}
                  </span>
                ) : null}
              </p>

              <Link
                href={planBookingHref({
                  planId: plan.id,
                  billing,
                  productSlug: productCheckoutSlug,
                  ctaHref: plan.ctaHref,
                })}
                className={cn(
                  "mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-[13px] font-bold",
                  popular
                    ? "bg-white text-[#2f1c6a] shadow-lg"
                    : "bg-[#f4f0ff] text-[#2f1c6a] ring-1 ring-[#e9e4ff] hover:bg-[#ebe4ff]",
                )}
              >
                {plan.ctaLabel}
                <ArrowRight className="size-4" aria-hidden />
              </Link>

              <AnnualPlanPerks lines={annualPerks} />

              <ul
                className={cn(
                  "mt-5 flex flex-1 flex-col gap-2 border-t pt-4",
                  popular ? "border-white/25" : "border-[#eef2ff]",
                )}
              >
                {features.map((feature) => (
                  <li
                    key={feature}
                    className={cn(
                      "flex gap-2 text-[13px]",
                      popular ? "text-white" : "text-[#334155]",
                    )}
                  >
                    <Check
                      className={cn(
                        "mt-0.5 size-4 shrink-0",
                        popular ? "text-white" : "text-[#673de6]",
                      )}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
