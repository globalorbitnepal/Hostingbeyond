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

      <div className="mt-6 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2 xl:grid-cols-4">
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
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className={cn(
                "relative flex h-full min-w-0 flex-col overflow-hidden rounded-[28px] border border-white/80 p-5 backdrop-blur-xl sm:p-6",
                popular
                  ? "z-10 scale-[1.045] bg-[linear-gradient(165deg,rgba(255,255,255,0.88)_0%,rgba(248,250,255,0.78)_46%,rgba(239,246,255,0.7)_100%)] pt-6 shadow-[0_40px_72px_-22px_rgba(37,99,235,0.38),0_24px_48px_-24px_rgba(124,58,237,0.42)] ring-2 ring-[#7c3aed]/40"
                  : "bg-white/60 shadow-[0_20px_40px_-24px_rgba(47,28,106,0.32)] ring-1 ring-[#ddd6fe]/80",
              )}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[28px] bg-[linear-gradient(165deg,rgba(255,255,255,0.55),rgba(255,255,255,0.06)_42%,rgba(219,234,254,0.22))]"
              />
              {popular ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-20 left-1/2 h-40 w-52 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.28),rgba(167,139,250,0.2),transparent_70%)] blur-2xl"
                />
              ) : null}
              <div className="relative z-[1] flex flex-wrap items-center gap-2">
                {plan.discountBadge && isAnnual ? (
                  <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white uppercase shadow-[0_8px_16px_rgba(16,185,129,0.35)]">
                    {plan.discountBadge}
                  </span>
                ) : null}
                {popular && plan.popularLabel ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-2.5 py-1 text-[10px] font-extrabold text-white uppercase">
                    <Star className="size-3 fill-current" aria-hidden />
                    {plan.popularLabel}
                  </span>
                ) : null}
              </div>

              <h3 className="font-heading relative z-[1] mt-4 text-[1.35rem] font-extrabold text-[#2f1c6a]">
                {plan.name}
              </h3>
              <p className="relative z-[1] mt-1 min-h-[2.5rem] text-[13px] text-[#64748b]">
                {plan.tagline}
              </p>

              {original ? (
                <p className="relative z-[1] mt-2 text-[13px] font-semibold text-[#94a3b8] line-through">
                  {original}
                </p>
              ) : null}
              <p className="relative z-[1] mt-0.5 flex items-end gap-1">
                <span className="text-[2rem] font-extrabold tracking-tight text-[#673de6]">
                  {price}
                </span>
                <span className="pb-1 text-[13px] font-bold text-[#64748b]">
                  /mo
                </span>
              </p>
              <p className="relative z-[1] mt-1 text-[12px] font-semibold text-[#475569]">
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
                  "relative z-[1] mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-[13px] font-bold",
                  popular
                    ? "bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white shadow-lg"
                    : "bg-white/80 text-[#2f1c6a] ring-1 ring-white/80 backdrop-blur-md hover:bg-[#f4f0ff]",
                )}
              >
                {plan.ctaLabel}
                <ArrowRight className="size-4" aria-hidden />
              </Link>

              <div className="relative z-[1]">
                <AnnualPlanPerks lines={annualPerks} />
              </div>

              <ul className="relative z-[1] mt-5 flex flex-1 flex-col gap-2 border-t border-[#eef2ff]/80 pt-4">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex gap-2 text-[13px] text-[#334155]"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-[#673de6]" />
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
