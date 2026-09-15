"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Box,
  Check,
  Globe,
  Headphones,
  Layers,
  Lock,
  Rocket,
  Shield,
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

function GuaranteeIcon({
  icon,
  className,
}: {
  icon: CmsHostingGuarantee["icon"];
  className?: string;
}) {
  if (icon === "lock") return <Lock className={className} aria-hidden />;
  if (icon === "globe") return <Globe className={className} aria-hidden />;
  if (icon === "headphones")
    return <Headphones className={className} aria-hidden />;
  if (icon === "rocket") return <Rocket className={className} aria-hidden />;
  return <Shield className={className} aria-hidden />;
}

function PlanGlyph({ plan }: { plan: CmsHostingPlan }) {
  const stacked = plan.id === "plus" || plan.id === "pro" || plan.popular;
  const Icon = stacked ? Layers : Box;
  const popular = Boolean(plan.popular);
  return (
    <span
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-2xl shadow-[0_8px_18px_-12px_rgba(37,99,235,0.45)]",
        popular
          ? "bg-white/45 text-[#673de6] ring-1 ring-white/80"
          : plan.accent === "purple"
            ? "bg-white/35 text-[#7c3aed] ring-1 ring-white/70"
            : "bg-white/35 text-[#673de6] ring-1 ring-white/70",
      )}
    >
      <Icon className="size-5" strokeWidth={1.85} aria-hidden />
    </span>
  );
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
  const popular = Boolean(plan.popular);
  const isAnnual = billing === "annually";
  const price = isAnnual ? plan.priceAnnually : plan.priceMonthly;
  const original = isAnnual ? plan.originalAnnually : plan.originalMonthly;
  const billed = isAnnual ? plan.billedAnnually : plan.billedMonthly;
  const save = isAnnual ? plan.saveAnnually : plan.saveMonthly;
  const domainLine = plan.domainPerk?.trim() || "";
  const creditRaw = isAnnual ? plan.annualCredit?.trim() : "";
  const creditLine = creditRaw
    ? creditRaw.toLowerCase().includes("free")
      ? creditRaw
      : `Free ${creditRaw}`
    : "";
  const extras = [domainLine, creditLine].filter(Boolean);
  const features = plan.features.filter((feature) => {
    const value = feature.toLowerCase();
    return !extras.some(
      (extra) =>
        value === extra.toLowerCase() ||
        value.includes("beyond ai credit") ||
        value.includes("domain — free") ||
        value.includes("domain - free"),
    );
  });
  const list = [...extras, ...features];

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-[28px] border p-5 backdrop-blur-2xl transition duration-300 sm:p-6",
        popular
          ? "z-10 border-white/80 bg-[linear-gradient(165deg,rgba(255,255,255,0.52)_0%,rgba(237,233,254,0.34)_50%,rgba(255,255,255,0.28)_100%)] shadow-[0_32px_70px_-28px_rgba(103,61,230,0.5)] ring-1 ring-white/85 hover:-translate-y-1"
          : "border-white/40 bg-[linear-gradient(180deg,rgba(47,28,106,0.14)_0%,rgba(255,255,255,0.16)_42%,rgba(47,28,106,0.1)_100%)] shadow-[0_24px_56px_-32px_rgba(47,28,106,0.42)] ring-1 ring-white/45 hover:-translate-y-0.5",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 h-36 w-44 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(196,181,253,0.45),transparent_70%)] blur-2xl"
      />
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {plan.discountBadge ? (
            <span className="rounded-full border border-white/50 bg-white/25 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-slate-600 uppercase backdrop-blur-xl">
              {plan.discountBadge}
            </span>
          ) : null}
          {popular && plan.popularLabel ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/40 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-[#673de6] uppercase backdrop-blur-xl">
              <Star className="size-3 fill-current" aria-hidden />
              {plan.popularLabel}
            </span>
          ) : null}
        </div>
        <PlanGlyph plan={plan} />
      </div>

      <h3 className="font-heading mt-4 text-[1.35rem] font-extrabold tracking-[-0.03em] text-slate-950 sm:text-[1.5rem]">
        {plan.name}
      </h3>
      {plan.tagline ? (
        <p className="mt-1 min-h-[2.6rem] text-[13.5px] leading-snug text-slate-500">
          {plan.tagline}
        </p>
      ) : (
        <div className="min-h-[2.6rem]" />
      )}

      <div className="mt-4">
        {original ? (
          <p className="text-[13px] font-medium text-slate-400 line-through">
            {original}
          </p>
        ) : (
          <p className="h-[20px]" />
        )}
        <p className="mt-0.5 flex items-end gap-1.5">
          <span className="text-[clamp(1.85rem,2.8vw,2.35rem)] leading-none font-extrabold tracking-tight text-[#673de6]">
            {price}
          </span>
          <span className="pb-1 text-[13px] font-semibold text-slate-500">
            /mo
          </span>
        </p>
        <div className="mt-2 flex min-h-[1.35rem] flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-medium">
          {billed ? <span className="text-slate-500">{billed}</span> : null}
          {save ? (
            <span className="font-bold text-emerald-600">{save}</span>
          ) : null}
        </div>
      </div>

      <Link
        href={plan.ctaHref || "/get-started"}
        className={cn(
          "mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14px] font-bold transition",
          popular
            ? "bg-gradient-to-r from-[#2563eb] to-[#673de6] text-white shadow-[0_12px_24px_rgba(103,61,230,0.35)] hover:brightness-105"
            : "border border-white/70 bg-white/40 text-slate-800 shadow-[0_8px_18px_-14px_rgba(15,23,42,0.28)] backdrop-blur-xl hover:border-violet-200 hover:bg-white/55 hover:text-[#673de6]",
        )}
      >
        {plan.ctaLabel || "Get Started"}
        <ArrowRight className="size-4" aria-hidden />
      </Link>

      <ul className="mt-5 flex flex-1 flex-col gap-2.5">
        {list.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2.5 text-[13.5px] leading-snug text-slate-600"
          >
            <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-white/40 text-[#673de6] ring-1 ring-white/60">
              <Check className="size-2.5" strokeWidth={3} aria-hidden />
            </span>
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
  const data = content;
  const [billing, setBilling] = useState<Billing>(
    data?.defaultBilling === "monthly" ? "monthly" : "annually",
  );

  if (!data || data.visible === false) return null;

  const plans = [...(data.plans ?? [])]
    .filter((p) => p.visible !== false)
    .sort((a, b) => a.order - b.order);

  const chips = [
    data.supportLabel
      ? { id: "support", label: data.supportLabel, icon: Headphones }
      : null,
    data.activationLabel
      ? { id: "activation", label: data.activationLabel, icon: Zap }
      : null,
    data.uptimeLabel
      ? { id: "uptime", label: data.uptimeLabel, icon: Shield }
      : null,
  ].filter(Boolean) as Array<{
    id: string;
    label: string;
    icon: typeof Headphones;
  }>;

  const guarantees = (data.guarantees ?? []).filter(Boolean).slice(0, 4);

  return (
    <section className="hb-home-section hb-home-section--on-mist pt-6 sm:pt-8">
      <div className="hb-shell relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white bg-white/80 px-3 py-1 text-[11px] font-bold tracking-[0.22em] text-slate-500 uppercase shadow-[0_8px_20px_-14px_rgba(37,80,130,0.4)]">
            <Layers className="size-3.5 text-[#673de6]" aria-hidden />
            {data.eyebrow}
          </p>
          <h2 className="font-heading mt-3 text-[clamp(1.7rem,3.6vw,3.15rem)] leading-[1.12] font-extrabold tracking-[-0.045em] text-[#2f1c6a]">
            {data.title}{" "}
            {data.titleAccent ? (
              <span className="bg-gradient-to-r from-[#2563eb] via-[#673de6] to-[#7c3aed] bg-clip-text text-transparent">
                {data.titleAccent}
              </span>
            ) : null}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600 sm:text-[16px]">
            {data.description}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 lg:justify-start">
            {chips.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={item.id} className="flex items-center gap-3">
                  {index > 0 ? (
                    <span
                      aria-hidden
                      className="hidden h-4 w-px bg-slate-200 sm:block"
                    />
                  ) : null}
                  <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-700">
                    <Icon className="size-4 text-[#673de6]" aria-hidden />
                    {item.label}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-[0_10px_24px_-16px_rgba(37,80,130,0.4)]">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={cn(
                  "rounded-full px-4 py-2 text-[13px] font-semibold transition",
                  billing === "monthly"
                    ? "bg-slate-100 text-slate-950"
                    : "text-slate-500 hover:text-slate-900",
                )}
              >
                {data.monthlyToggleLabel || "Monthly"}
              </button>
              <button
                type="button"
                onClick={() => setBilling("annually")}
                className={cn(
                  "rounded-full px-4 py-2 text-[13px] font-semibold transition",
                  billing === "annually"
                    ? "bg-gradient-to-r from-[#2563eb] to-[#673de6] text-white shadow-[0_8px_16px_rgba(103,61,230,0.32)]"
                    : "text-slate-500 hover:text-slate-900",
                )}
              >
                {data.annualToggleLabel || "Annually"}
              </button>
            </div>
            {data.saveBadge ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[12px] font-extrabold text-emerald-600">
                {data.saveBadge}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-7 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
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
          <div className="mt-7 grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {guarantees.map((item) => (
              <div
                key={item.id}
                className="flex h-full items-start gap-3 rounded-[22px] border border-white/50 bg-white/18 px-4 py-4 shadow-[0_18px_44px_-28px_rgba(47,28,106,0.4)] ring-1 ring-white/55 backdrop-blur-2xl"
              >
                <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white/45 text-[#673de6] ring-1 ring-white/70">
                  <GuaranteeIcon icon={item.icon} className="size-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] leading-snug font-extrabold text-slate-950">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-[12.5px] leading-snug text-slate-500">
                    {item.description}
                  </span>
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
