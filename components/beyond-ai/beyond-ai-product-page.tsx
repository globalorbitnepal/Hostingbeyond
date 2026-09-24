"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Globe,
  Server,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { ModelSelector } from "@/components/beyond-ai/model-selector";
import {
  beyondAiCheckoutPath,
  beyondAiPlansConfig,
  beyondAiWorkspacePath,
  type BeyondAiPlanConfig,
  type BeyondAiPlanId,
} from "@/config/beyond-ai-product";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

function formatUsd(n: number): string {
  if (n === 0) return "$0";
  return `$${n}`;
}

function HeroDemo({ reduce }: { reduce: boolean }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setPhase((p) => (p + 1) % 3), 4200);
    return () => clearInterval(t);
  }, [reduce]);

  const steps = [
    "Structure created",
    "Pages generated",
    "Responsive layout",
    "SEO optimized",
    "Ready to preview",
  ];

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/20 bg-[#0c0618]/80 p-5 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(103,61,230,0.35),transparent_55%)]"
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
          <span className="text-[13px] font-extrabold text-white">
            Beyond AI
          </span>
          <span className="rounded-full bg-[#673de6]/30 px-2 py-0.5 text-[10px] font-bold text-[#c7d7ff]">
            Workspace
          </span>
        </div>
        <p className="mt-4 text-[12px] font-bold text-white/50 uppercase">
          What do you want to build?
        </p>
        <p className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-[13px] leading-relaxed text-white/90">
          Create a premium hotel website with booking, gallery, rooms and SEO
          optimized pages.
        </p>
        <p className="mt-3 text-[11px] font-semibold text-white/45">
          Model: Claude
        </p>
        <div className="mt-4 flex gap-2">
          <span className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-[#673de6] to-[#7c3aed] text-[13px] font-extrabold text-white">
            Generate
          </span>
        </div>
        {phase >= 1 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 space-y-2 border-t border-white/10 pt-4"
          >
            <p className="text-[12px] font-bold text-[#a78bfa]">
              {phase === 1 ? "Generating website…" : "Generation complete"}
            </p>
            {steps.map((s, i) => (
              <p
                key={s}
                className={cn(
                  "flex items-center gap-2 text-[12px]",
                  phase === 2 || i < 3 ? "text-white/85" : "text-white/40",
                )}
              >
                <Check className="size-3.5 text-emerald-400" aria-hidden />
                {s}
              </p>
            ))}
            {phase === 2 ? (
              <button
                type="button"
                className="mt-2 inline-flex h-9 items-center rounded-full bg-white px-4 text-[12px] font-extrabold text-[#2f1c6a]"
              >
                Preview website
              </button>
            ) : null}
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

function PricingCards({
  yearly,
  onYearlyChange,
}: {
  yearly: boolean;
  onYearlyChange: (v: boolean) => void;
}) {
  return (
    <section id="beyond-ai-plans" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-heading text-[clamp(1.85rem,3.5vw,2.75rem)] font-extrabold tracking-[-0.04em] text-[#2f1c6a]">
          Choose how far you want to go.
        </h2>
        <p className="mt-3 text-[16px] text-[#64748b]">
          Your plan includes AI credit equal to your plan value — use it across
          models in one workspace.
        </p>
        <div className="mt-6 inline-flex rounded-full border border-[#e9e4ff] bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => onYearlyChange(false)}
            className={cn(
              "rounded-full px-5 py-2 text-[13px] font-extrabold",
              !yearly ? "bg-[#2f1c6a] text-white" : "text-[#64748b]",
            )}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => onYearlyChange(true)}
            className={cn(
              "rounded-full px-5 py-2 text-[13px] font-extrabold",
              yearly ? "bg-emerald-500 text-white" : "text-[#64748b]",
            )}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-4">
        {beyondAiPlansConfig.map((plan) => (
          <PlanCard key={plan.id} plan={plan} yearly={yearly} />
        ))}
      </div>

      <div className="mt-12 rounded-[24px] border border-[#e9e4ff] bg-white p-6 sm:p-8">
        <h3 className="font-heading text-center text-[1.35rem] font-extrabold text-[#2f1c6a]">
          Your plan. Your AI budget.
        </h3>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {beyondAiPlansConfig.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-[#eef2ff] bg-[#f8f5ff]/50 p-4 text-center"
            >
              <p className="text-[13px] font-extrabold text-[#673de6] uppercase">
                {p.shortName}
              </p>
              <p className="mt-2 text-[15px] font-extrabold text-[#2f1c6a]">
                {p.includedCreditUsd === 0
                  ? "Starter access"
                  : `${formatUsd(p.includedCreditUsd)} AI credit`}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-[13px] text-[#64748b]">
          Usage cost varies by model and task. Estimates are shown before you
          confirm each generation.
        </p>
      </div>
    </section>
  );
}

function PlanCard({
  plan,
  yearly,
}: {
  plan: BeyondAiPlanConfig;
  yearly: boolean;
}) {
  const price = yearly ? plan.priceYearly / 12 : plan.priceMonthly;
  const popular = plan.popular;
  return (
    <article
      className={cn(
        "flex flex-col rounded-[24px] border p-5",
        popular
          ? "border-[#7c3aed]/50 bg-[linear-gradient(180deg,#1a1038,#2f1c6a)] text-white shadow-xl lg:scale-[1.02]"
          : "border-[#e9e4ff] bg-white",
      )}
    >
      {plan.badge ? (
        <span
          className={cn(
            "self-start rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase",
            popular ? "bg-[#673de6] text-white" : "bg-[#f4f0ff] text-[#673de6]",
          )}
        >
          {plan.badge}
        </span>
      ) : null}
      <h3
        className={cn(
          "font-heading mt-3 text-[1.2rem] font-extrabold",
          popular ? "text-white" : "text-[#2f1c6a]",
        )}
      >
        {plan.shortName}
      </h3>
      <p
        className={cn(
          "mt-1 text-[13px]",
          popular ? "text-white/70" : "text-[#64748b]",
        )}
      >
        {plan.description}
      </p>
      <p className="mt-4 flex items-end gap-1">
        <span className="text-[2rem] leading-none font-extrabold">
          {formatUsd(Math.round(price * 100) / 100)}
        </span>
        <span className="pb-1 text-[13px] font-bold opacity-70">/mo</span>
      </p>
      <p
        className={cn(
          "mt-2 text-[12px] font-bold",
          popular ? "text-[#c7d7ff]" : "text-[#673de6]",
        )}
      >
        {plan.includedCreditUsd > 0
          ? `${formatUsd(plan.includedCreditUsd)} included AI credit`
          : "Starter AI access"}
      </p>
      <Link
        href={beyondAiCheckoutPath(plan.id as BeyondAiPlanId)}
        className={cn(
          "mt-5 inline-flex h-11 items-center justify-center rounded-full text-[13px] font-extrabold",
          popular
            ? "bg-white text-[#2f1c6a]"
            : "bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white",
        )}
      >
        Choose {plan.shortName}
      </Link>
      <ul className="mt-5 flex flex-1 flex-col gap-2 border-t border-white/10 pt-4">
        {plan.features.slice(0, 5).map((f) => (
          <li key={f} className="flex gap-2 text-[12px] leading-snug">
            <Check className="mt-0.5 size-3.5 shrink-0 text-[#a78bfa]" />
            {f}
          </li>
        ))}
      </ul>
    </article>
  );
}

export function BeyondAiProductPage() {
  const reduce = useReducedMotion();
  const [yearly, setYearly] = useState(false);
  const [creditUsed] = useState(14.8);
  const creditTotal = 20;

  return (
    <div className="bg-[#f4f7ff]">
      <section className="hb-band-purple relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20">
        <div className="hb-shell relative z-10 grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-[12px] font-extrabold tracking-[0.22em] text-white/60 uppercase">
              Beyond AI
            </p>
            <h1 className="font-heading mt-3 text-[clamp(2.2rem,4.8vw,3.5rem)] leading-[1.05] font-extrabold tracking-[-0.045em] text-white">
              Build with AI.
              <br />
              <span className="text-[#c7d7ff]">Host it here.</span>
            </h1>
            <p className="mt-4 max-w-lg text-[16px] leading-relaxed font-medium text-white/88 sm:text-[17px]">
              Create websites, write code, optimize content and launch your
              projects with leading AI models — all from one workspace on
              HostingBeyond.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={beyondAiWorkspacePath()}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[14px] font-extrabold text-[#2f1c6a] shadow-lg"
              >
                Start building
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#beyond-ai-plans"
                className="inline-flex h-12 items-center rounded-full border border-white/35 px-6 text-[14px] font-extrabold text-white hover:bg-white/10"
              >
                View plans
              </a>
            </div>
          </div>
          <HeroDemo reduce={Boolean(reduce)} />
        </div>
      </section>

      <section className="hb-shell py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-[clamp(1.75rem,3.2vw,2.5rem)] font-extrabold text-[#2f1c6a]">
            One workspace. Multiple AI models.
          </h2>
          <p className="mt-3 text-[16px] text-[#64748b]">
            Access a wide range of leading AI models from one workspace. Pick
            the model that fits each task.
          </p>
        </div>
        <div className="mt-10 rounded-[28px] border border-[#e9e4ff] bg-white p-6 shadow-sm sm:p-8">
          <ModelSelector showEstimate />
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-[#eef2ff] p-4">
              <p className="text-[12px] font-bold text-[#64748b] uppercase">
                AI credit
              </p>
              <p className="mt-2 text-[22px] font-extrabold text-[#2f1c6a]">
                ${creditUsed.toFixed(2)} / ${creditTotal.toFixed(2)} used
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eef2ff]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#673de6] to-[#7c3aed]"
                  style={{ width: `${(creditUsed / creditTotal) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-[13px] font-semibold text-emerald-600">
                Remaining: ${(creditTotal - creditUsed).toFixed(2)}
              </p>
            </div>
            <div className="rounded-2xl border border-[#eef2ff] p-4 lg:col-span-2">
              <p className="text-[12px] font-bold text-[#64748b] uppercase">
                Recent
              </p>
              <ul className="mt-3 space-y-2 text-[13px] text-[#334155]">
                <li>Hotel landing — Claude — $0.42</li>
                <li>SEO meta pack — Gemini — $0.18</li>
                <li>Booking module — OpenAI — $0.39</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="hb-band-cream border-y border-[#e9e4ff]/80 py-16 sm:py-20">
        <div className="hb-shell grid gap-8 lg:grid-cols-2">
          <div className="rounded-[28px] border border-[#e9e4ff] bg-white p-5 shadow-sm">
            <p className="text-[12px] font-bold text-[#673de6] uppercase">
              Prompt
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-[#334155]">
              Build a luxury trekking website with packages, itinerary, gallery,
              reviews and online booking.
            </p>
            <p className="mt-4 text-[13px] font-semibold text-[#673de6]">
              Creating your website…
            </p>
          </div>
          <div className="rounded-[28px] border border-[#2f1c6a]/10 bg-[#2f1c6a] p-5 text-white shadow-xl">
            <p className="text-[11px] font-bold text-white/50 uppercase">
              Live preview
            </p>
            <div className="mt-4 space-y-2 rounded-xl bg-white/10 p-4">
              <div className="h-3 w-2/3 rounded bg-white/30" />
              <div className="h-24 rounded-lg bg-gradient-to-br from-[#673de6]/40 to-[#2563eb]/30" />
              <div className="grid grid-cols-3 gap-2">
                <div className="h-8 rounded bg-white/15" />
                <div className="h-8 rounded bg-white/15" />
                <div className="h-8 rounded bg-white/15" />
              </div>
            </div>
          </div>
        </div>
        <h2 className="font-heading mt-12 text-center text-[clamp(1.75rem,3vw,2.35rem)] font-extrabold text-[#2f1c6a]">
          Describe it. Beyond AI builds it.
        </h2>
      </section>

      <section className="hb-shell py-16 sm:py-20">
        <h2 className="font-heading text-center text-[clamp(1.75rem,3vw,2.35rem)] font-extrabold text-[#2f1c6a]">
          From AI generation to live website.
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-[13px] font-extrabold text-[#673de6]">
          {[
            "Idea",
            "AI Generation",
            "Customize",
            "Preview",
            "Domain",
            "Hosting",
            "LIVE",
          ].map((step, i, arr) => (
            <span key={step} className="inline-flex items-center gap-2">
              {step}
              {i < arr.length - 1 ? (
                <ChevronRight className="size-4 text-[#94a3b8]" />
              ) : null}
            </span>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-[15px] text-[#64748b]">
          Your website does not stop at generation. Publish directly to
          HostingBeyond with SSL and hosting included on every plan.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href={beyondAiWorkspacePath()}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-6 text-[14px] font-extrabold text-white"
          >
            Build & publish
            <Zap className="size-4" />
          </Link>
        </div>
      </section>

      <section className="hb-band-purple py-16 sm:py-20">
        <div className="hb-shell grid items-center gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-[clamp(1.85rem,3.2vw,2.5rem)] font-extrabold text-white">
              Build with AI.
              <br />
              Host for free.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-white/80">
              Every Beyond AI plan includes HostingBeyond hosting so your
              generated site has a place to go live — SSL included, limits per
              plan.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/20 bg-white/10 p-5 backdrop-blur-md">
            <div className="space-y-3 text-[14px]">
              <p className="flex justify-between font-bold text-white">
                <span>Website</span>
                <span className="text-emerald-300">Live</span>
              </p>
              <p className="flex justify-between text-white/85">
                <span className="inline-flex items-center gap-2">
                  <Globe className="size-4" /> Domain
                </span>
                <span>yourbrand.com</span>
              </p>
              <p className="flex justify-between text-white/85">
                <span>SSL</span>
                <span className="text-emerald-300">Active</span>
              </p>
              <p className="flex justify-between text-white/85">
                <span className="inline-flex items-center gap-2">
                  <Server className="size-4" /> Hosting
                </span>
                <span className="text-emerald-300">Active</span>
              </p>
              <p className="flex justify-between text-white/85">
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="size-4" /> AI Builder
                </span>
                <span>Connected</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="hb-shell py-16">
        <div className="rounded-[28px] border border-amber-200/80 bg-amber-50/80 p-6 sm:p-8">
          <h3 className="font-heading text-[1.25rem] font-extrabold text-[#92400e]">
            Out of included AI credit?
          </h3>
          <p className="mt-2 text-[14px] text-[#78350f]">
            Continue with on-demand usage — we show estimated cost and ask for
            confirmation before each charge. Never billed silently.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-4 text-[13px]">
              <p>Current balance: $0.00</p>
              <p className="mt-1 font-bold">Est. next request: $0.42</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="h-10 rounded-full bg-[#673de6] px-5 text-[13px] font-extrabold text-white"
              >
                Enable on-demand
              </button>
              <button
                type="button"
                className="h-10 rounded-full border border-[#e9e4ff] px-5 text-[13px] font-bold text-[#64748b]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="hb-shell">
        <PricingCards yearly={yearly} onYearlyChange={setYearly} />
      </div>
    </div>
  );
}
