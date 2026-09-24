"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Cloud,
  Globe,
  Layers,
  Lightbulb,
  Pencil,
  Rocket,
  Users,
  Zap,
} from "lucide-react";

import {
  AiModelBrandIcon,
  pricingModelRow,
} from "@/components/beyond-ai/ai-model-brand-icons";
import {
  CoinStack,
  ModelLogoStack,
  OnDemandCoins,
  PlanCornerCube,
  PlanCornerCrown,
} from "@/components/beyond-ai/beyond-ai-pricing-art";
import {
  beyondAiCheckoutPath,
  beyondAiPlansConfig,
  type BeyondAiPlanId,
} from "@/config/beyond-ai-product";
import type { CmsBeyondAiPageContent } from "@/lib/orbit/beyond-ai-page-content";
import { cn } from "@/lib/utils";

const cornerByPlan: Record<string, "cube" | "crown" | "users" | "zap"> = {
  free: "cube",
  pro: "crown",
  "pro-plus": "users",
  ultra: "zap",
};

function PlanCornerIcon({
  type,
  popular,
}: {
  type: string;
  popular?: boolean;
}) {
  if (type === "cube") {
    return <PlanCornerCube className="size-11" />;
  }
  if (type === "crown") {
    return (
      <PlanCornerCrown className="size-12 drop-shadow-[0_0_12px_rgba(251,191,36,0.55)]" />
    );
  }
  const cls = cn("size-10", popular ? "text-[#c4b5fd]" : "text-[#3b82f6]");
  if (type === "users") return <Users className={cls} strokeWidth={1.5} />;
  return <Zap className={cls} strokeWidth={1.5} fill="currentColor" />;
}

export function BeyondAiPricingMockup({
  content,
}: {
  content: CmsBeyondAiPageContent;
}) {
  const [yearly, setYearly] = useState(false);
  const discount = yearly ? 0.8 : 1;
  const configById = new Map(beyondAiPlansConfig.map((p) => [p.id, p]));

  return (
    <section
      id="beyond-ai-plans"
      className="hb-band-cream relative scroll-mt-4 overflow-hidden border-t border-[#e9e4ff]/70 pt-12 pb-10 sm:pt-14"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(199,210,254,0.45),transparent_65%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[50%] bg-[radial-gradient(ellipse_at_25%_100%,rgba(167,139,250,0.32),transparent_55%),radial-gradient(ellipse_at_75%_95%,rgba(96,165,250,0.28),transparent_50%)]"
      />

      <div className="hb-shell relative z-10 max-w-[1240px]">
        <p className="text-center text-[11px] font-extrabold tracking-[0.32em] text-[#673de6] uppercase">
          {content.pricingEyebrow}
        </p>
        <h2 className="font-heading mt-3 text-center text-[clamp(2.05rem,4.5vw,3.25rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-[#2f1c6a]">
          {content.pricingTitle}{" "}
          <span className="bg-gradient-to-r from-[#1d4ed8] via-[#673de6] to-[#c026d3] bg-clip-text text-transparent">
            {content.pricingTitleAccent}
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-[640px] text-center text-[15px] leading-relaxed text-[#64748b] sm:text-[16px]">
          {content.pricingDescription}
        </p>

        <div className="-mx-4 mt-10 overflow-x-auto px-4 pb-2 sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="flex min-w-max items-end justify-center gap-x-8 gap-y-6 sm:min-w-0 sm:flex-wrap sm:gap-x-12">
            {pricingModelRow.map((m) => (
              <div
                key={m.id}
                className="flex w-[80px] flex-col items-center gap-2 sm:w-[88px]"
              >
                <div className="flex size-16 items-center justify-center rounded-full border border-[#e9e4ff] bg-white shadow-[0_8px_24px_-12px_rgba(47,28,106,0.2)] sm:size-[72px]">
                  <AiModelBrandIcon
                    id={m.id}
                    size={m.id === "openrouter" ? 34 : 36}
                  />
                </div>
                <p className="text-center text-[13px] font-extrabold text-[#2f1c6a] sm:text-[14px]">
                  {m.name}
                </p>
                <p className="text-center text-[11px] font-medium text-[#94a3b8] sm:text-[12px]">
                  {m.provider}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-11 flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex rounded-full border border-[#e2e8f0] bg-white p-1 shadow-[0_4px_16px_-8px_rgba(15,23,42,0.12)]">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={cn(
                "min-w-[96px] rounded-full px-5 py-2.5 text-[13px] font-extrabold transition",
                !yearly ? "bg-[#0f172a] text-white" : "text-[#64748b]",
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={cn(
                "min-w-[96px] rounded-full px-5 py-2.5 text-[13px] font-extrabold transition",
                yearly ? "bg-[#0f172a] text-white" : "text-[#64748b]",
              )}
            >
              Yearly
            </button>
          </div>
          <span className="rounded-full bg-[#fce7f3] px-3 py-1.5 text-[12px] font-extrabold text-[#db2777]">
            {content.saveBadge}
          </span>
        </div>

        <div className="mt-10 grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {content.plans
            .filter((p) => p.visible)
            .map((plan) => {
              const config = configById.get(plan.id as BeyondAiPlanId);
              const popular = plan.popular ?? config?.popular;
              const monthly =
                Math.round(plan.priceMonthly * discount * 100) / 100;
              const priceLabel =
                plan.priceMonthly === 0
                  ? "$0"
                  : `$${monthly % 1 === 0 ? monthly : monthly.toFixed(0)}`;
              const corner = cornerByPlan[plan.id] ?? "cube";
              const coinVariant = plan.id === "pro" ? "gold" : "blue";

              const cardInner = (
                <article
                  className={cn(
                    "relative flex h-full flex-col rounded-[20px] p-5 sm:p-[22px]",
                    popular
                      ? "bg-[linear-gradient(168deg,#0c1222_0%,#15103a_48%,#0a0614_100%)] text-white"
                      : "border border-[#e5eaf3] bg-white",
                  )}
                >
                  <div className="absolute top-5 right-5">
                    <PlanCornerIcon type={corner} popular={popular} />
                  </div>

                  <span
                    className={cn(
                      "inline-flex w-fit rounded-md px-2 py-1 text-[9px] font-extrabold tracking-[0.06em] uppercase",
                      popular
                        ? "bg-[#7c3aed] text-white"
                        : plan.id === "pro-plus"
                          ? "bg-[#dbeafe] text-[#1d4ed8]"
                          : "bg-[#ede9fe] text-[#6d28d9]",
                    )}
                  >
                    {plan.badge}
                  </span>

                  <h3
                    className={cn(
                      "font-heading mt-4 pr-12 text-[1.75rem] font-extrabold tracking-[-0.03em]",
                      popular ? "text-white" : "text-[#0f172a]",
                    )}
                  >
                    {config?.shortName ?? plan.id}
                  </h3>
                  <p
                    className={cn(
                      "mt-1 text-[12px] leading-snug",
                      popular ? "text-white/60" : "text-[#94a3b8]",
                    )}
                  >
                    {plan.tagline}
                  </p>

                  <p className="mt-5 flex items-baseline gap-1">
                    <span
                      className={cn(
                        "text-[2.25rem] leading-none font-extrabold tracking-tight",
                        popular ? "text-white" : "text-[#0f172a]",
                      )}
                    >
                      {priceLabel}
                    </span>
                    <span
                      className={cn(
                        "text-[14px] font-semibold",
                        popular ? "text-white/55" : "text-[#94a3b8]",
                      )}
                    >
                      /month
                    </span>
                  </p>

                  <div
                    className={cn(
                      "mt-5 rounded-xl border px-3 py-3",
                      popular
                        ? "border-white/10 bg-white/[0.06]"
                        : "border-[#eef2ff] bg-[#f8fafc]",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <CoinStack
                        variant={coinVariant}
                        className="mt-0.5 h-9 w-11 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-[9px] font-extrabold tracking-[0.12em] uppercase",
                            popular ? "text-white/50" : "text-[#94a3b8]",
                          )}
                        >
                          AI credit
                        </p>
                        <p
                          className={cn(
                            "text-[13px] font-extrabold",
                            popular ? "text-white" : "text-[#1e1b4b]",
                          )}
                        >
                          ${plan.includedCreditUsd} included
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "mt-2.5 h-2 overflow-hidden rounded-full",
                        popular ? "bg-white/12" : "bg-[#e9e4ff]",
                      )}
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] via-[#6366f1] to-[#a855f7]"
                        style={{ width: `${plan.meterPct}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    href={beyondAiCheckoutPath(plan.id as BeyondAiPlanId)}
                    className={cn(
                      "mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-[13px] font-extrabold transition",
                      popular
                        ? "bg-white text-[#0f172a] hover:bg-[#f8fafc]"
                        : "bg-gradient-to-r from-[#2563eb] to-[#4f46e5] text-white hover:brightness-105",
                    )}
                  >
                    {plan.cta}
                    <ArrowRight className="size-4" strokeWidth={2.5} />
                  </Link>

                  <ul className="mt-5 flex flex-1 flex-col gap-2">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className={cn(
                          "flex gap-2 text-[12px] leading-snug",
                          popular ? "text-white/90" : "text-[#475569]",
                        )}
                      >
                        <Check
                          className={cn(
                            "mt-0.5 size-3.5 shrink-0",
                            popular ? "text-[#a78bfa]" : "text-[#3b82f6]",
                          )}
                          strokeWidth={2.5}
                        />
                        {f}
                      </li>
                    ))}
                    <li
                      className={cn(
                        "mt-1 flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] font-bold",
                        popular
                          ? "bg-emerald-400/15 text-emerald-200"
                          : "bg-[#ecfdf5] text-[#047857]",
                      )}
                    >
                      <Cloud className="size-4 shrink-0" strokeWidth={2} />
                      Free Deploy
                    </li>
                    <li
                      className={cn(
                        "flex gap-2 text-[12px]",
                        popular ? "text-white/70" : "text-[#64748b]",
                      )}
                    >
                      <Check
                        className="mt-0.5 size-3.5 shrink-0 opacity-50"
                        strokeWidth={2}
                      />
                      {plan.support}
                    </li>
                  </ul>
                </article>
              );

              if (popular) {
                return (
                  <div
                    key={plan.id}
                    className="rounded-[22px] bg-gradient-to-b from-[#c084fc] via-[#818cf8] to-[#38bdf8] p-[2px] shadow-[0_32px_64px_-24px_rgba(124,58,237,0.65)] xl:scale-[1.03]"
                  >
                    {cardInner}
                  </div>
                );
              }

              return (
                <div
                  key={plan.id}
                  className="shadow-[0_20px_48px_-28px_rgba(15,23,42,0.14)]"
                >
                  {cardInner}
                </div>
              );
            })}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="flex gap-5 rounded-[20px] border border-white bg-white/85 p-6 shadow-[0_16px_40px_-24px_rgba(47,28,106,0.18)] backdrop-blur-md">
            <ModelLogoStack className="shrink-0" />
            <div>
              <p className="text-[10px] font-extrabold tracking-[0.14em] text-[#6366f1] uppercase">
                AI models
              </p>
              <h3 className="font-heading mt-1 text-[1.15rem] leading-snug font-extrabold text-[#0f172a]">
                One credit balance. Multiple AI models.
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[#64748b]">
                Use your included AI credit across supported models and choose
                the right AI for every task. Usage estimates are shown before
                generation.
              </p>
            </div>
          </div>
          <div className="flex gap-5 rounded-[20px] border border-[#fde68a]/60 bg-gradient-to-br from-[#fffbeb] to-[#fff7ed] p-6 shadow-[0_16px_40px_-24px_rgba(245,158,11,0.2)]">
            <OnDemandCoins className="shrink-0 pt-1" />
            <div>
              <p className="text-[10px] font-extrabold tracking-[0.14em] text-[#ea580c] uppercase">
                On-demand
              </p>
              <h3 className="font-heading mt-1 text-[1.15rem] font-extrabold text-[#0f172a]">
                Need more AI?
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[#64748b]">
                When your included credit runs out, continue with optional
                on-demand usage. Additional usage is only charged after
                confirmation.
              </p>
              <button
                type="button"
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-full border border-[#e2e8f0] bg-white px-4 text-[13px] font-extrabold text-[#0f172a] shadow-sm"
              >
                Learn about On-Demand
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-1 rounded-[18px] border border-[#e8ecf4] bg-white px-3 py-5 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.1)] sm:gap-2 sm:px-6">
          {[
            {
              icon: Lightbulb,
              title: "Choose a plan",
              sub: "Get your AI credit",
            },
            { icon: Layers, title: "Use AI models", sub: "Build your website" },
            { icon: Pencil, title: "Customize", sub: "Edit and improve" },
            {
              icon: Globe,
              title: "Connect a domain",
              sub: "Free Deploy included",
            },
            { icon: Rocket, title: "Publish", sub: "Go live instantly" },
          ].map((step, i, arr) => {
            const Icon = step.icon;
            return (
              <span key={step.title} className="inline-flex items-center">
                <span className="flex min-w-[96px] flex-col items-center px-1 sm:min-w-[118px]">
                  <span className="flex size-8 items-center justify-center rounded-full bg-[#f4f0ff]">
                    <Icon className="size-4 text-[#673de6]" strokeWidth={2} />
                  </span>
                  <span className="mt-2 text-[11px] font-extrabold text-[#1e1b4b]">
                    {step.title}
                  </span>
                  <span className="mt-0.5 text-center text-[10px] leading-tight text-[#94a3b8]">
                    {step.sub}
                  </span>
                </span>
                {i < arr.length - 1 ? (
                  <ChevronRight className="mx-0.5 hidden size-4 text-[#cbd5e1] sm:block" />
                ) : null}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
