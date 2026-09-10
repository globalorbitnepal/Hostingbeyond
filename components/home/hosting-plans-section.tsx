"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Headphones,
  Lock,
  Rocket,
  Server,
  Shield,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import type {
  CmsHostingGuarantee,
  CmsHostingPlan,
  CmsHostingPlansContent,
} from "@/lib/orbit/defaults";

type Billing = "annually" | "monthly";

const accentStyles = {
  blue: {
    cube: "from-[#7dd3fc] to-[#2563eb]",
    price: "text-[#2563eb]",
    check: "text-[#2563eb]",
    cta: "border-slate-200/90 bg-white/80 text-slate-800 hover:border-slate-300 hover:bg-white",
  },
  purple: {
    cube: "from-[#d8b4fe] to-[#7c3aed]",
    price: "text-[#7c3aed]",
    check: "text-[#7c3aed]",
    cta: "border-slate-200/90 bg-white/80 text-slate-800 hover:border-slate-300 hover:bg-white",
  },
  gradient: {
    cube: "from-[#818cf8] to-[#7c3aed]",
    price:
      "bg-gradient-to-r from-[#2563eb] to-[#7c3aed] bg-clip-text text-transparent",
    check: "text-[#4f46e5]",
    cta: "border-transparent bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white shadow-[0_12px_28px_rgba(79,70,229,0.28)] hover:brightness-105",
  },
} as const;

function GuaranteeIcon({
  icon,
  className,
}: {
  icon: CmsHostingGuarantee["icon"];
  className?: string;
}) {
  if (icon === "lock") return <Lock className={className} aria-hidden />;
  if (icon === "rocket") return <Rocket className={className} aria-hidden />;
  return <Shield className={className} aria-hidden />;
}

function PlanCard({
  plan,
  billing,
  delay,
}: {
  plan: CmsHostingPlan;
  billing: Billing;
  delay: number;
}) {
  const reduceMotion = useReducedMotion();
  const styles = accentStyles[plan.accent] ?? accentStyles.blue;
  const isAnnual = billing === "annually";
  const price = isAnnual ? plan.priceAnnually : plan.priceMonthly;
  const original = isAnnual ? plan.originalAnnually : plan.originalMonthly;
  const billed = isAnnual ? plan.billedAnnually : plan.billedMonthly;
  const solidCta = plan.accent === "gradient" || plan.popular;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay, duration: 0.35 }}
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-[26px] border border-white/80 bg-white/70 p-5 shadow-[0_18px_50px_-28px_rgba(37,80,130,0.35)] backdrop-blur-2xl sm:p-6",
        plan.popular &&
          "border-indigo-200/80 bg-white/85 shadow-[0_22px_60px_-24px_rgba(79,70,229,0.38)]",
      )}
    >
      {plan.popular ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[26px] p-px"
          style={{
            background:
              "linear-gradient(160deg, rgba(37,99,235,0.55), rgba(124,58,237,0.5), rgba(255,255,255,0.15))",
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      ) : null}

      <div className="relative z-10 flex items-start justify-between gap-2">
        {plan.discountBadge ? (
          <span className="inline-flex rounded-md bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white uppercase shadow-[0_6px_18px_rgba(79,70,229,0.28)]">
            {plan.discountBadge}
          </span>
        ) : (
          <span />
        )}
        <span
          aria-hidden
          className={cn(
            "inline-flex size-9 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]",
            styles.cube,
          )}
        />
      </div>

      {plan.popular && plan.popularLabel ? (
        <span className="relative z-10 mt-3 inline-flex w-fit items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50/90 px-2.5 py-1 text-[10px] font-bold text-indigo-700">
          <Star className="size-3 fill-current" aria-hidden />
          {plan.popularLabel}
        </span>
      ) : null}

      <h3 className="font-heading relative z-10 mt-4 text-[20px] font-extrabold tracking-tight text-slate-950 sm:text-[22px]">
        {plan.name}
      </h3>

      <div className="relative z-10 mt-4">
        {original ? (
          <p className="text-[13px] font-medium text-slate-400 line-through">
            {original}
          </p>
        ) : null}
        <p className="mt-0.5 flex items-end gap-1.5">
          <span
            className={cn(
              "text-[clamp(1.85rem,2.6vw,2.4rem)] leading-none font-extrabold tracking-tight",
              styles.price,
            )}
          >
            {price}
          </span>
          <span className="pb-1 text-[13px] font-semibold text-slate-500">
            /mo
          </span>
        </p>
        <p className="mt-2 text-[12px] font-medium text-slate-500">{billed}</p>
      </div>

      <Link
        href={plan.ctaHref || "/get-started"}
        className={cn(
          "relative z-10 mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border text-[13px] font-bold shadow-[0_8px_22px_rgba(15,23,42,0.06)] transition",
          solidCta ? accentStyles.gradient.cta : styles.cta,
        )}
      >
        {plan.ctaLabel || "Get Started"}
        <ArrowRight className="size-4" aria-hidden />
      </Link>

      <ul className="relative z-10 mt-5 space-y-2.5 border-t border-slate-200/80 pt-5">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2.5 text-[13px] leading-snug text-slate-600"
          >
            <Check
              className={cn("mt-0.5 size-4 shrink-0", styles.check)}
              aria-hidden
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </motion.article>
  );
}

export function HostingPlansSection({
  content,
}: {
  content?: CmsHostingPlansContent;
}) {
  const reduceMotion = useReducedMotion();
  const data = content;
  const [billing, setBilling] = useState<Billing>(
    data?.defaultBilling === "monthly" ? "monthly" : "annually",
  );

  if (!data || data.visible === false) return null;

  const plans = [...(data.plans ?? [])]
    .filter((p) => p.visible !== false)
    .sort((a, b) => a.order - b.order);

  const guarantees = data.guarantees ?? [];

  return (
    <section className="relative isolate overflow-hidden bg-[#f4f8fd] pt-8 pb-16 sm:pt-10 sm:pb-20 lg:pt-12 lg:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#eef4fb_0%,#f4f8fd_42%,#e7f1fb_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-12%] left-[-8%] h-[48%] w-[50%] rounded-full bg-[radial-gradient(ellipse,rgba(147,197,253,0.38),transparent_68%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-10%] bottom-[-8%] h-[42%] w-[46%] rounded-full bg-[radial-gradient(ellipse,rgba(167,139,250,0.16),transparent_70%)] blur-3xl"
      />

      <div className="hb-shell relative z-10">
        <div className="text-center">
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-1.5 text-[11px] font-bold tracking-[0.14em] text-slate-600 uppercase shadow-[0_8px_24px_rgba(37,80,130,0.08)] backdrop-blur-xl"
          >
            <Server className="size-3.5 text-[#2563eb]" aria-hidden />
            {data.eyebrow}
          </motion.span>

          <motion.h2
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.04 }}
            className="font-heading mt-4 text-[clamp(1.75rem,3.6vw,3.15rem)] leading-[1.12] font-extrabold tracking-[-0.04em] text-slate-950"
          >
            {data.title}{" "}
            <span className="bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
              {data.titleAccent}
            </span>
          </motion.h2>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="mx-auto mt-3 max-w-[640px] text-[14px] leading-relaxed text-slate-600 sm:text-[16px]"
          >
            {data.description}
          </motion.p>
        </div>

        <div className="mt-7 flex flex-col gap-4 sm:mt-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-semibold text-slate-600">
            <span className="inline-flex items-center gap-2">
              <Headphones className="size-4 text-[#2563eb]" aria-hidden />
              {data.supportLabel}
            </span>
            <span className="inline-flex items-center gap-2">
              <Zap className="size-4 text-[#7c3aed]" aria-hidden />
              {data.activationLabel}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500">
              <Sparkles className="size-3.5 text-[#2563eb]" aria-hidden />
              {data.annualToggleLabel}
            </span>
            <div className="inline-flex rounded-full border border-white/80 bg-white/70 p-1 shadow-[0_8px_22px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setBilling("annually")}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[12px] font-bold transition",
                  billing === "annually"
                    ? "bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white shadow-[0_8px_18px_rgba(79,70,229,0.28)]"
                    : "text-slate-500 hover:text-slate-800",
                )}
              >
                Annually
              </button>
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[12px] font-bold transition",
                  billing === "monthly"
                    ? "bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white shadow-[0_8px_18px_rgba(79,70,229,0.28)]"
                    : "text-slate-500 hover:text-slate-800",
                )}
              >
                {data.monthlyToggleLabel || "Monthly"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              billing={billing}
              delay={0.05 * index}
            />
          ))}
        </div>

        {guarantees.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-4">
            {guarantees.map((item, index) => (
              <motion.div
                key={item.id}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.04 * index }}
                className="flex gap-3.5 rounded-[20px] border border-white/80 bg-white/70 p-4 shadow-[0_14px_40px_-24px_rgba(37,80,130,0.28)] backdrop-blur-2xl sm:p-5"
              >
                <span
                  className={cn(
                    "inline-flex size-11 shrink-0 items-center justify-center rounded-xl border",
                    item.icon === "lock"
                      ? "border-violet-200 bg-violet-50 text-[#7c3aed]"
                      : "border-sky-200 bg-sky-50 text-[#2563eb]",
                  )}
                >
                  <GuaranteeIcon icon={item.icon} className="size-5" />
                </span>
                <div>
                  <h4 className="font-heading text-[14px] font-extrabold tracking-tight text-slate-950">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-[12px] leading-relaxed text-slate-500 sm:text-[13px]">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
