"use client";

import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { AiModelStrip } from "@/components/beyond-ai/ai-model-strip";
import { Logo } from "@/components/shared/logo";
import {
  beyondAiCheckoutHref,
  beyondAiPlans,
  type BeyondAiPlanId,
} from "@/config/beyond-ai-plans";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

function formatUsd(amount: number): string {
  if (amount === 0) return "$0";
  return `$${amount}`;
}

export function BeyondAiPricingView({ logoPath }: { logoPath?: string }) {
  const reduce = useReducedMotion();

  return (
    <div className="min-h-dvh bg-[#f4f7ff]">
      <header className="border-b border-[#e9e4ff]/80 bg-white/80 backdrop-blur-xl">
        <div className="hb-shell flex h-[4.25rem] items-center justify-between gap-4">
          <Logo href={routes.home} src={logoPath} />
          <Link
            href={routes.login}
            className="text-[14px] font-bold text-[#2f1c6a] hover:text-[#673de6]"
          >
            Sign in
          </Link>
        </div>
      </header>

      <section className="hb-band-purple relative overflow-hidden py-12 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.14),transparent_55%)]"
        />
        <div className="hb-shell relative z-10 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3.5 py-1 text-[11px] font-bold tracking-[0.2em] text-white uppercase">
            <Sparkles className="size-3.5" aria-hidden />
            Beyond AI
          </p>
          <h1 className="font-heading mx-auto mt-4 max-w-3xl text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-white">
            One balance.{" "}
            <span className="text-[#c7d7ff]">Every top AI model.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed font-medium text-white/88 sm:text-[17px]">
            Pay monthly → get the same dollar balance for AI generation. Pick
            models, build your site, publish live —{" "}
            <span className="font-extrabold text-white">hosting is free</span>{" "}
            on HostingBeyond. Need more? Top up on demand anytime.
          </p>
          <AiModelStrip className="mt-8" />
        </div>
      </section>

      <section className="hb-shell relative z-20 -mt-6 pt-4 pb-16 sm:pb-20">
        <div className="grid gap-4 lg:grid-cols-4 lg:gap-3 xl:gap-4">
          {beyondAiPlans.map((plan, index) => {
            const popular = plan.popular;
            return (
              <motion.article
                key={plan.id}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.06, duration: 0.45 }}
                className={cn(
                  "relative flex flex-col rounded-[26px] border p-5 sm:p-6",
                  popular
                    ? "border-[#7c3aed]/50 bg-[linear-gradient(180deg,#1a1038_0%,#2f1c6a_48%,#1e1245_100%)] text-white shadow-[0_32px_60px_-24px_rgba(47,28,106,0.65)] lg:scale-[1.02]"
                    : "border-[#e9e4ff] bg-white shadow-[0_22px_44px_-24px_rgba(47,28,106,0.2)]",
                )}
              >
                {plan.badge ? (
                  <span
                    className={cn(
                      "self-start rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wide uppercase",
                      popular
                        ? "bg-[#673de6] text-white"
                        : "bg-[#f4f0ff] text-[#673de6]",
                    )}
                  >
                    {plan.badge}
                  </span>
                ) : null}
                <h2
                  className={cn(
                    "font-heading mt-4 text-[1.35rem] font-extrabold tracking-tight",
                    popular ? "text-white" : "text-[#2f1c6a]",
                  )}
                >
                  {plan.name}
                </h2>
                <div className="mt-3 flex items-end gap-2">
                  {plan.compareAt ? (
                    <span
                      className={cn(
                        "text-[15px] font-semibold line-through",
                        popular ? "text-white/50" : "text-[#94a3b8]",
                      )}
                    >
                      ${plan.compareAt}
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "text-[2.35rem] leading-none font-extrabold tracking-tight",
                      popular ? "text-white" : "text-[#673de6]",
                    )}
                  >
                    {formatUsd(plan.priceMonthly)}
                  </span>
                  <span
                    className={cn(
                      "pb-1 text-[13px] font-bold",
                      popular ? "text-white/70" : "text-[#64748b]",
                    )}
                  >
                    /mo
                  </span>
                </div>
                <p
                  className={cn(
                    "mt-2 text-[13px] leading-snug font-semibold",
                    popular ? "text-[#c7d7ff]" : "text-[#673de6]",
                  )}
                >
                  {plan.creditNote}
                </p>
                <p
                  className={cn(
                    "mt-1 text-[12px]",
                    popular ? "text-white/65" : "text-[#64748b]",
                  )}
                >
                  {plan.hostingNote}
                </p>

                <Link
                  href={beyondAiCheckoutHref(plan.id as BeyondAiPlanId)}
                  className={cn(
                    "mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14px] font-extrabold transition",
                    popular
                      ? "bg-white text-[#2f1c6a] hover:bg-[#f4f0ff]"
                      : "bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white shadow-lg hover:brightness-105",
                  )}
                >
                  {plan.priceMonthly === 0 ? "Start free" : "Choose plan"}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>

                <ul className="mt-6 flex flex-1 flex-col gap-2.5 border-t border-white/10 pt-5">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={cn(
                        "flex gap-2.5 text-[13px] leading-snug",
                        popular ? "text-white/90" : "text-[#334155]",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 inline-flex size-[18px] shrink-0 items-center justify-center rounded-full",
                          popular
                            ? "bg-[#673de6] text-white"
                            : "bg-[#673de6]/10 text-[#673de6]",
                        )}
                      >
                        <Check className="size-2.5" strokeWidth={3.2} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-10 rounded-[24px] border border-[#e9e4ff] bg-white/90 p-6 text-center sm:p-8">
          <p className="text-[15px] font-medium text-[#475569]">
            <span className="font-extrabold text-[#2f1c6a]">
              On-demand credits
            </span>{" "}
            — when your monthly balance runs out, add more from the panel
            without changing plans. Unused hosting stays free.
          </p>
        </div>
      </section>
    </div>
  );
}
