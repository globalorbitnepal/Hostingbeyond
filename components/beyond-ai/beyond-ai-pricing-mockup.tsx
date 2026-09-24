"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Cloud,
  Coins,
  Crown,
  Layers,
  Lightbulb,
  Pencil,
  Rocket,
  Users,
  Zap,
} from "lucide-react";

import {
  beyondAiCheckoutPath,
  beyondAiModelsConfig,
  beyondAiPlansConfig,
  type BeyondAiPlanId,
} from "@/config/beyond-ai-product";
import { cn } from "@/lib/utils";

const planDisplay: Record<
  BeyondAiPlanId,
  {
    badge: string;
    tagline: string;
    meterPct: number;
    cta: string;
    features: string[];
    support: string;
    icon: "none" | "crown" | "users" | "zap";
  }
> = {
  free: {
    badge: "GET STARTED",
    tagline: "Start building with AI",
    meterPct: 52,
    cta: "Start Free",
    features: [
      "AI website builder",
      "Selected AI models",
      "Website preview",
      "Basic SEO tools",
    ],
    support: "Community support",
    icon: "none",
  },
  pro: {
    badge: "MOST POPULAR",
    tagline: "For creators building real websites",
    meterPct: 82,
    cta: "Choose Pro",
    features: [
      "Advanced AI website generation",
      "Multiple AI models",
      "AI coding assistance",
      "AI content & SEO tools",
      "Custom domain support",
    ],
    support: "Priority support",
    icon: "crown",
  },
  "pro-plus": {
    badge: "GROW FURTHER",
    tagline: "Serious projects, teams, and growing brands",
    meterPct: 74,
    cta: "Choose Pro+",
    features: [
      "Everything in Pro",
      "Larger AI projects",
      "Advanced coding & customization",
      "More model access",
      "Advanced SEO tools",
    ],
    support: "Priority support",
    icon: "users",
  },
  ultra: {
    badge: "PREMIUM",
    tagline: "Agencies and high-volume AI production",
    meterPct: 94,
    cta: "Choose Ultra",
    features: [
      "Everything in Pro+",
      "Highest AI usage allowance",
      "Advanced AI workspace",
      "Large project generation",
      "Multiple websites & domains",
    ],
    support: "Premium support",
    icon: "zap",
  },
};

const modelOrbStyles: Record<string, string> = {
  openai: "bg-[#10a37f]/15 text-[#0d8a6a] ring-[#10a37f]/30",
  gemini:
    "bg-gradient-to-br from-[#4285f4]/20 to-[#ea4335]/15 text-[#1a56db] ring-[#4285f4]/25",
  claude: "bg-[#d97757]/15 text-[#c45c3e] ring-[#d97757]/30",
  grok: "bg-slate-100 text-slate-800 ring-slate-200",
};

function PlanIcon({ type, dark }: { type: string; dark?: boolean }) {
  const cls = cn("size-9", dark ? "text-[#c7d7ff]" : "text-[#673de6]");
  if (type === "crown") return <Crown className={cls} strokeWidth={1.6} />;
  if (type === "users") return <Users className={cls} strokeWidth={1.6} />;
  if (type === "zap") return <Zap className={cls} strokeWidth={1.6} />;
  return null;
}

export function BeyondAiPricingMockup() {
  const [yearly, setYearly] = useState(false);
  const discount = yearly ? 0.8 : 1;

  return (
    <section
      id="beyond-ai-plans"
      className="relative scroll-mt-4 overflow-hidden bg-[#f6f8fc] pt-14 pb-8 sm:pt-16"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-[radial-gradient(ellipse_at_30%_100%,rgba(167,139,250,0.35),transparent_55%),radial-gradient(ellipse_at_70%_90%,rgba(59,130,246,0.28),transparent_50%)]"
      />

      <div className="hb-shell relative z-10">
        <p className="text-center text-[11px] font-extrabold tracking-[0.28em] text-[#673de6]/80 uppercase">
          Beyond AI
        </p>
        <h2 className="font-heading mt-3 text-center text-[clamp(2rem,4.2vw,3.15rem)] font-extrabold tracking-[-0.04em]">
          <span className="bg-gradient-to-r from-[#1e3a8a] via-[#673de6] to-[#c026d3] bg-clip-text text-transparent">
            Choose your AI workspace.
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-[15px] leading-relaxed text-[#64748b] sm:text-[16px]">
          Every plan includes AI credit to build, create and launch with
          powerful AI models — plus{" "}
          <span className="font-extrabold text-[#2f1c6a]">Free Deploy</span>.
        </p>

        <div className="mt-10 flex flex-wrap items-end justify-center gap-6 sm:gap-10">
          {beyondAiModelsConfig
            .filter((m) => m.featured)
            .map((m) => (
              <div key={m.id} className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex size-14 items-center justify-center rounded-full text-[13px] font-extrabold ring-2",
                    modelOrbStyles[m.id] ?? "bg-[#f4f0ff] text-[#673de6]",
                  )}
                >
                  {m.id === "openai" ? "GPT" : m.shortLabel.slice(0, 2)}
                </div>
                <p className="text-[13px] font-extrabold text-[#2f1c6a]">
                  {m.id === "openai" ? "ChatGPT" : m.shortLabel}
                </p>
                <p className="text-[11px] font-medium text-[#94a3b8]">
                  {m.provider}
                </p>
              </div>
            ))}
          <div className="flex flex-col items-center gap-2">
            <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-[13px] font-extrabold text-white ring-2 ring-[#7c3aed]/30">
              +
            </div>
            <p className="text-[13px] font-extrabold text-[#2f1c6a]">More</p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex rounded-full border border-[#e2e8f0] bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={cn(
                "rounded-full px-5 py-2 text-[13px] font-extrabold transition",
                !yearly ? "bg-[#1e3a8a] text-white" : "text-[#64748b]",
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={cn(
                "rounded-full px-5 py-2 text-[13px] font-extrabold transition",
                yearly ? "bg-[#1e3a8a] text-white" : "text-[#64748b]",
              )}
            >
              Yearly
            </button>
          </div>
          {yearly ? (
            <span className="rounded-full bg-[#fce7f3] px-3 py-1 text-[12px] font-extrabold text-[#db2777]">
              Save 20%
            </span>
          ) : null}
        </div>

        <div className="mt-10 grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
          {beyondAiPlansConfig.map((plan) => {
            const meta = planDisplay[plan.id];
            const popular = plan.popular;
            const monthly =
              Math.round(plan.priceMonthly * discount * 100) / 100;
            const priceLabel =
              plan.priceMonthly === 0
                ? "$0"
                : `$${monthly % 1 === 0 ? monthly : monthly.toFixed(0)}`;

            return (
              <article
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-[22px] border p-5 shadow-[0_20px_50px_-28px_rgba(47,28,106,0.25)]",
                  popular
                    ? "border-[#a855f7]/60 bg-[linear-gradient(165deg,#0f172a_0%,#1e1b4b_55%,#0c0618_100%)] text-white shadow-[0_28px_60px_-20px_rgba(103,61,230,0.55)] ring-1 ring-[#c084fc]/50 xl:scale-[1.02]"
                    : "border-[#e8ecf4] bg-white",
                )}
              >
                {meta.icon !== "none" ? (
                  <PlanIcon type={meta.icon} dark={popular} />
                ) : null}
                <span
                  className={cn(
                    "mt-2 inline-flex w-fit rounded-full px-2.5 py-1 text-[9px] font-extrabold tracking-wide uppercase",
                    popular
                      ? "bg-[#7c3aed] text-white"
                      : plan.id === "pro-plus"
                        ? "bg-[#dbeafe] text-[#1d4ed8]"
                        : "bg-[#ede9fe] text-[#6d28d9]",
                  )}
                >
                  {meta.badge}
                </span>
                <h3
                  className={cn(
                    "font-heading mt-3 text-[1.65rem] font-extrabold tracking-tight",
                    popular ? "text-white" : "text-[#0f172a]",
                  )}
                >
                  {plan.shortName}
                </h3>
                <p
                  className={cn(
                    "mt-1 text-[12px]",
                    popular ? "text-white/65" : "text-[#94a3b8]",
                  )}
                >
                  {meta.tagline}
                </p>
                <p className="mt-4 flex items-baseline gap-1">
                  <span
                    className={cn(
                      "text-[2.1rem] leading-none font-extrabold",
                      popular ? "text-white" : "text-[#0f172a]",
                    )}
                  >
                    {priceLabel}
                  </span>
                  <span
                    className={cn(
                      "text-[13px] font-semibold",
                      popular ? "text-white/60" : "text-[#94a3b8]",
                    )}
                  >
                    /month
                  </span>
                </p>

                <div
                  className={cn(
                    "mt-4 rounded-xl border p-3",
                    popular
                      ? "border-white/10 bg-white/5"
                      : "border-[#eef2ff] bg-[#f8fafc]",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        "text-[10px] font-extrabold tracking-wide uppercase",
                        popular ? "text-white/55" : "text-[#94a3b8]",
                      )}
                    >
                      AI credit
                    </p>
                    <Coins
                      className={cn(
                        "size-4",
                        popular ? "text-amber-300" : "text-[#673de6]",
                      )}
                    />
                  </div>
                  <p
                    className={cn(
                      "mt-1 text-[13px] font-extrabold",
                      popular ? "text-white" : "text-[#2f1c6a]",
                    )}
                  >
                    ${plan.includedCreditUsd} included
                  </p>
                  <div
                    className={cn(
                      "mt-2 h-2 overflow-hidden rounded-full",
                      popular ? "bg-white/15" : "bg-[#e9e4ff]",
                    )}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] to-[#a855f7]"
                      style={{ width: `${meta.meterPct}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={beyondAiCheckoutPath(plan.id)}
                  className={cn(
                    "mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-[13px] font-extrabold transition",
                    popular
                      ? "bg-white text-[#0f172a] hover:bg-[#f4f0ff]"
                      : "bg-gradient-to-r from-[#3b82f6] to-[#7c3aed] text-white hover:brightness-105",
                  )}
                >
                  {meta.cta}
                  <ArrowRight className="size-4" />
                </Link>

                <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                  {meta.features.map((f) => (
                    <li
                      key={f}
                      className={cn(
                        "flex gap-2 text-[12px] leading-snug",
                        popular ? "text-white/88" : "text-[#475569]",
                      )}
                    >
                      <Check
                        className={cn(
                          "mt-0.5 size-3.5 shrink-0",
                          popular ? "text-[#a78bfa]" : "text-[#3b82f6]",
                        )}
                      />
                      {f}
                    </li>
                  ))}
                  <li
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2 py-2 text-[12px] font-bold",
                      popular
                        ? "bg-emerald-500/15 text-emerald-200"
                        : "bg-[#ecfdf5] text-[#047857]",
                    )}
                  >
                    <Cloud className="size-4 shrink-0" />
                    Free Deploy
                  </li>
                  <li
                    className={cn(
                      "flex gap-2 text-[12px]",
                      popular ? "text-white/75" : "text-[#64748b]",
                    )}
                  >
                    <Check className="mt-0.5 size-3.5 shrink-0 opacity-60" />
                    {meta.support}
                  </li>
                </ul>
              </article>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[20px] border border-white/80 bg-white/75 p-6 shadow-[0_16px_40px_-24px_rgba(47,28,106,0.2)] backdrop-blur-md">
            <div className="flex gap-4">
              <div className="flex -space-x-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="size-10 rounded-xl border border-white bg-gradient-to-br from-[#c4b5fd] to-[#93c5fd] shadow-md"
                    style={{ transform: `rotate(${i * 6 - 6}deg)` }}
                  />
                ))}
              </div>
              <div>
                <h3 className="font-heading text-[1.1rem] font-extrabold text-[#0f172a]">
                  One credit balance. Multiple AI models.
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[#64748b]">
                  Use your included AI credit across supported models and choose
                  the right AI for every task. Usage estimates are shown before
                  generation.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-[20px] border border-white/80 bg-white/75 p-6 shadow-[0_16px_40px_-24px_rgba(47,28,106,0.2)] backdrop-blur-md">
            <p className="text-[10px] font-extrabold tracking-wide text-[#ea580c] uppercase">
              On-demand
            </p>
            <div className="mt-3 flex gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200 to-amber-400 shadow-inner">
                <Coins className="size-6 text-amber-900" />
              </div>
              <div>
                <h3 className="font-heading text-[1.1rem] font-extrabold text-[#0f172a]">
                  Need more AI?
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[#64748b]">
                  When your included credit runs out, continue with optional
                  on-demand usage. Additional usage is only charged after
                  confirmation.
                </p>
                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-1 text-[13px] font-extrabold text-[#673de6]"
                >
                  Learn about On-Demand
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 rounded-[18px] border border-[#e8ecf4] bg-white/90 px-4 py-4 text-center shadow-sm sm:gap-3 sm:px-6">
          {[
            {
              icon: Lightbulb,
              title: "Choose a plan",
              sub: "Get your AI credit",
            },
            { icon: Layers, title: "Use AI models", sub: "Build your website" },
            { icon: Pencil, title: "Customize", sub: "Edit and improve" },
            {
              icon: Cloud,
              title: "Connect a domain",
              sub: "Free Deploy included",
            },
            { icon: Rocket, title: "Publish", sub: "Go live instantly" },
          ].map((step, i, arr) => {
            const Icon = step.icon;
            return (
              <span key={step.title} className="inline-flex items-center gap-2">
                <span className="flex min-w-[100px] flex-col items-center sm:min-w-[120px]">
                  <Icon className="size-4 text-[#673de6]" />
                  <span className="mt-1 text-[11px] font-extrabold text-[#2f1c6a]">
                    {step.title}
                  </span>
                  <span className="text-[10px] text-[#94a3b8]">{step.sub}</span>
                </span>
                {i < arr.length - 1 ? (
                  <ChevronRight className="hidden size-4 text-[#cbd5e1] sm:block" />
                ) : null}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
