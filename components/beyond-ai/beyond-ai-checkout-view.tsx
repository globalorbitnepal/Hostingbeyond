"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Info } from "lucide-react";

import { AiModelStrip } from "@/components/beyond-ai/ai-model-strip";
import { Logo } from "@/components/shared/logo";
import { getBeyondAiPlan } from "@/config/beyond-ai-plans";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export function BeyondAiCheckoutView({
  planId,
  logoPath,
}: {
  planId: string | undefined;
  logoPath?: string;
}) {
  const plan = getBeyondAiPlan(planId);
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("US");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user?.email) setEmail(data.user.email);
      })
      .catch(() => undefined);
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStatus("Redirecting to secure checkout…");
    const params = new URLSearchParams({
      plan: plan.id,
      redirect: "beyond-ai",
    });
    window.location.href = `${routes.signup}?${params.toString()}`;
  };

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="relative flex flex-col bg-[linear-gradient(165deg,#0c0618_0%,#2f1c6a_42%,#1a0f3d_100%)] px-6 py-8 text-white sm:px-10 lg:min-h-dvh lg:w-[42%] lg:px-12 lg:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_100%,rgba(103,61,230,0.45),transparent_55%)]"
        />
        <div className="relative z-10 flex flex-1 flex-col">
          <Link
            href={routes.beyondAi}
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-white/70 hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </Link>
          <div className="mt-6 [&_img]:h-[40px] [&_img]:max-w-[min(100%,280px)] [&_img]:brightness-0 [&_img]:invert">
            <Logo href={routes.home} src={logoPath} />
          </div>

          <p className="mt-10 text-[15px] font-medium text-white/70">
            Subscribe to
          </p>
          <h1 className="font-heading mt-1 text-[clamp(1.85rem,3.5vw,2.5rem)] font-extrabold tracking-tight">
            Start a{" "}
            <span className="bg-gradient-to-r from-[#c7d7ff] to-[#a78bfa] bg-clip-text text-transparent">
              {plan.name.replace("Beyond AI ", "")}
            </span>
          </h1>

          <p className="mt-6 text-[13px] font-bold tracking-wide text-white/50 uppercase">
            Included with this plan
          </p>
          <ul className="mt-4 space-y-3">
            <li className="flex gap-3 text-[14px] leading-snug text-white/90">
              <Check className="mt-0.5 size-4 shrink-0 text-[#a78bfa]" />
              <span>
                <strong className="font-extrabold text-white">
                  {formatMoney(plan.creditBalance)}
                </strong>{" "}
                monthly AI model balance — use any model in the strip below
              </span>
            </li>
            {plan.features.slice(0, 3).map((f) => (
              <li
                key={f}
                className="flex gap-3 text-[14px] leading-snug text-white/85"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-[#a78bfa]" />
                {f}
              </li>
            ))}
          </ul>

          <AiModelStrip tone="dark" className="mt-8 !justify-start" />

          <p className="mt-auto pt-10 text-[13px] leading-relaxed text-white/55">
            {plan.hostingNote}. Build in Beyond AI, publish in one click — your
            balance is shared across models until you top up on demand.
          </p>
        </div>
      </aside>

      <main className="flex flex-1 flex-col bg-[#f8f9fc] px-6 py-8 sm:px-10 lg:px-14 lg:py-12">
        <h2 className="text-[1.35rem] font-extrabold text-[#0f172a]">
          Subscribe to {plan.name}
        </h2>

        <div className="mt-6">
          <p className="text-[12px] font-bold tracking-wide text-[#64748b] uppercase">
            Your account
          </p>
          <p className="mt-1 text-[14px] text-[#334155]">
            {email || "Sign in during checkout or create an account"}
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 flex flex-1 flex-col">
          <p className="text-[15px] font-extrabold text-[#0f172a]">
            Billing address
          </p>
          <div
            className="mt-3 flex gap-2 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] px-3 py-2.5 text-[12px] leading-snug text-[#1e40af]"
            role="note"
          >
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            Tax rates are based on your billing address. Enter accurate details
            for invoices and compliance.
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-[12px] font-bold text-[#64748b]">
                Country / Region <span className="text-red-500">*</span>
              </span>
              <select
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-[14px] text-[#0f172a] outline-none focus:ring-2 focus:ring-[#673de6]/30"
              >
                <option value="US">United States</option>
                <option value="NP">Nepal</option>
                <option value="IN">India</option>
                <option value="GB">United Kingdom</option>
                <option value="AE">United Arab Emirates</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[12px] font-bold text-[#64748b]">
                State / Province <span className="text-red-500">*</span>
              </span>
              <input
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-[14px] outline-none focus:ring-2 focus:ring-[#673de6]/30"
              />
            </label>
            <label className="block">
              <span className="text-[12px] font-bold text-[#64748b]">
                City <span className="text-red-500">*</span>
              </span>
              <input
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-[14px] outline-none focus:ring-2 focus:ring-[#673de6]/30"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-[12px] font-bold text-[#64748b]">
                Address <span className="text-red-500">*</span>
              </span>
              <input
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-[14px] outline-none focus:ring-2 focus:ring-[#673de6]/30"
              />
            </label>
          </div>

          <div className="mt-8 rounded-xl border border-[#e2e8f0] bg-white p-4 sm:p-5">
            <p className="text-[13px] font-extrabold text-[#0f172a]">
              Overview{" "}
              <span className="font-medium text-[#64748b]">(Price in USD)</span>
            </p>
            <div className="mt-4 flex items-start justify-between gap-4 border-b border-[#f1f5f9] pb-4">
              <div>
                <p className="font-extrabold text-[#0f172a]">{plan.name}</p>
                <p className="text-[13px] text-[#64748b]">Billed monthly</p>
              </div>
              <p className="text-[15px] font-extrabold text-[#0f172a]">
                {formatMoney(plan.priceMonthly)}
              </p>
            </div>
            <div className="mt-3 flex justify-between text-[14px]">
              <span className="font-semibold text-[#64748b]">
                Pre-tax total
              </span>
              <span className="font-extrabold text-[#0f172a]">
                {formatMoney(plan.priceMonthly)}
              </span>
            </div>
            <p className="mt-2 text-[12px] text-[#64748b]">
              Includes {formatMoney(plan.creditBalance)} AI balance · Hosting
              included
            </p>
          </div>

          <button
            type="submit"
            className={cn(
              "mt-6 flex h-12 w-full items-center justify-center rounded-lg text-[15px] font-extrabold text-white shadow-[0_12px_28px_-8px_rgba(103,61,230,0.55)]",
              "bg-gradient-to-r from-[#673de6] to-[#7c3aed] hover:brightness-105",
            )}
          >
            {plan.priceMonthly === 0 ? "Activate free plan" : "Checkout"}
          </button>
          {status ? (
            <p className="mt-2 text-center text-[13px] font-medium text-[#673de6]">
              {status}
            </p>
          ) : null}
          <p className="mt-4 text-[11px] leading-relaxed text-[#94a3b8]">
            By continuing you agree to HostingBeyond terms. Payments are
            processed securely via Stripe. On-demand credit packs are available
            anytime from your account.
          </p>
        </form>
      </main>
    </div>
  );
}
