"use client";

import Link from "next/link";
import { ArrowRight, Check, Star } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import type { CmsHostingPlan } from "@/lib/orbit/defaults";
import { cn } from "@/lib/utils";

type Billing = "annually" | "monthly";

export function PricingEcommercePanel({
  plans,
  billing,
  onBillingChange,
}: {
  plans: CmsHostingPlan[];
  billing: Billing;
  onBillingChange: (b: Billing) => void;
}) {
  const reduceMotion = useReducedMotion();
  const visible = [...plans]
    .filter((p) => p.visible !== false)
    .sort((a, b) => a.order - b.order);

  return (
    <div id="plan-selector" className="scroll-mt-28">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-center text-[13px] font-semibold text-[#475569] sm:text-left">
          Select a commerce plan — prices shown{" "}
          <span className="font-extrabold text-emerald-700">~5% below</span>{" "}
          typical Hostinger-style promos.
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
                ? "bg-emerald-500 text-white"
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

          return (
            <motion.article
              key={plan.id}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className={cn(
                "relative flex h-full flex-col rounded-[26px] border p-5",
                popular
                  ? "z-10 border-[#7c3aed]/40 bg-[linear-gradient(180deg,#ffffff_0%,#f3edff_100%)] shadow-[0_28px_50px_-18px_rgba(103,61,230,0.45)] ring-2 ring-[#a78bfa]/60"
                  : "border-[#e9e4ff] bg-white shadow-[0_20px_40px_-22px_rgba(47,28,106,0.2)]",
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                {plan.discountBadge ? (
                  <span className="rounded-full bg-[#673de6] px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white uppercase">
                    {plan.discountBadge}
                  </span>
                ) : null}
                {popular && plan.popularLabel ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-extrabold text-white uppercase">
                    <Star className="size-3 fill-current" aria-hidden />
                    {plan.popularLabel}
                  </span>
                ) : null}
              </div>

              <h3 className="font-heading mt-4 text-[1.35rem] font-extrabold text-[#2f1c6a]">
                {plan.name}
              </h3>
              <p className="mt-1 min-h-[2.5rem] text-[13px] text-[#64748b]">
                {plan.tagline}
              </p>

              {original ? (
                <p className="mt-2 text-[13px] font-semibold text-[#94a3b8] line-through">
                  {original}
                </p>
              ) : null}
              <p className="mt-0.5 flex items-end gap-1">
                <span className="text-[2rem] font-extrabold tracking-tight text-[#673de6]">
                  {price}
                </span>
                <span className="pb-1 text-[13px] font-bold text-[#64748b]">
                  /mo
                </span>
              </p>
              <p className="mt-1 text-[12px] font-semibold text-[#475569]">
                {billed}
                {save ? (
                  <span className="ml-2 font-extrabold text-emerald-600">
                    {save}
                  </span>
                ) : null}
              </p>

              <Link
                href={plan.ctaHref}
                className={cn(
                  "mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-[13px] font-bold",
                  popular
                    ? "bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white shadow-lg"
                    : "bg-[#f4f0ff] text-[#2f1c6a] hover:bg-[#ebe4ff]",
                )}
              >
                {plan.ctaLabel}
                <ArrowRight className="size-4" aria-hidden />
              </Link>

              <ul className="mt-5 flex flex-1 flex-col gap-2 border-t border-[#eef2ff] pt-4">
                {plan.domainPerk ? (
                  <li className="flex gap-2 text-[13px] font-semibold text-[#1e1b4b]">
                    <Check className="mt-0.5 size-4 shrink-0 text-[#673de6]" />
                    {plan.domainPerk}
                  </li>
                ) : null}
                {plan.features.map((feature) => (
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
