"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Info } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { getPlanConfig, type BeyondAiPlanId } from "@/config/beyond-ai-product";
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
  const plan = getPlanConfig(planId);
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("US");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user?.email) setEmail(data.user.email);
      })
      .catch(() => undefined);
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("Processing…");
    const res = await fetch("/api/beyond-ai/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId: plan.id,
        billingInterval: "monthly",
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (data.code === "auth_required") {
        window.location.href = `${routes.login}?next=${encodeURIComponent(
          `${routes.beyondAi}/checkout?plan=${plan.id}`,
        )}`;
        return;
      }
      setStatus("");
      setError(
        data.error ?? "Checkout unavailable. Try again or contact support.",
      );
      return;
    }
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
      return;
    }
    setStatus("");
    setError("Unexpected response from checkout.");
  };

  const shortName = plan.shortName;

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
            Order summary
          </p>
          <h1 className="font-heading mt-1 text-[clamp(1.85rem,3.5vw,2.5rem)] font-extrabold tracking-tight">
            Beyond AI {shortName}
          </h1>
          <p className="mt-2 text-[1.5rem] font-extrabold text-white">
            {formatMoney(plan.priceMonthly)}
            <span className="text-[14px] font-semibold text-white/60">
              {" "}
              / month
            </span>
          </p>

          <p className="mt-6 text-[13px] font-bold tracking-wide text-white/50 uppercase">
            Included
          </p>
          <ul className="mt-4 space-y-3">
            {plan.includedCreditUsd > 0 ? (
              <li className="flex gap-3 text-[14px] text-white/90">
                <Check className="mt-0.5 size-4 shrink-0 text-[#a78bfa]" />
                {formatMoney(plan.includedCreditUsd)} AI credit
              </li>
            ) : null}
            {plan.features.slice(0, 5).map((f) => (
              <li key={f} className="flex gap-3 text-[14px] text-white/85">
                <Check className="mt-0.5 size-4 shrink-0 text-[#a78bfa]" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex flex-1 flex-col bg-[#f8f9fc] px-6 py-8 sm:px-10 lg:px-14 lg:py-12">
        <h2 className="text-[1.35rem] font-extrabold text-[#0f172a]">
          Payment
        </h2>
        <p className="mt-1 text-[14px] text-[#64748b]">
          {email || "Sign in when you pay to attach your workspace."}
        </p>

        <form onSubmit={onSubmit} className="mt-8 flex flex-1 flex-col">
          <p className="text-[15px] font-extrabold text-[#0f172a]">
            Billing information
          </p>
          <div
            className="mt-3 flex gap-2 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] px-3 py-2.5 text-[12px] leading-snug text-[#1e40af]"
            role="note"
          >
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            Tax rates depend on your billing address.
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-[12px] font-bold text-[#64748b]">
                Country / Region *
              </span>
              <select
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-[14px]"
              >
                <option value="US">United States</option>
                <option value="NP">Nepal</option>
                <option value="IN">India</option>
                <option value="GB">United Kingdom</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[12px] font-bold text-[#64748b]">
                State *
              </span>
              <input
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-[14px]"
              />
            </label>
            <label className="block">
              <span className="text-[12px] font-bold text-[#64748b]">
                City *
              </span>
              <input
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-[14px]"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-[12px] font-bold text-[#64748b]">
                Address *
              </span>
              <input
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-[14px]"
              />
            </label>
          </div>

          <div className="mt-8 rounded-xl border border-[#e2e8f0] bg-white p-4">
            <p className="text-[13px] font-extrabold">Total</p>
            <p className="mt-2 text-[1.5rem] font-extrabold text-[#0f172a]">
              {formatMoney(plan.priceMonthly)}
            </p>
          </div>

          {error ? (
            <p className="mt-4 text-[13px] font-semibold text-red-600">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={Boolean(status)}
            className={cn(
              "mt-6 flex h-12 w-full items-center justify-center rounded-lg text-[15px] font-extrabold text-white",
              "bg-gradient-to-r from-[#673de6] to-[#7c3aed] hover:brightness-105 disabled:opacity-60",
            )}
          >
            {plan.priceMonthly === 0
              ? "Activate free plan"
              : `Pay ${formatMoney(plan.priceMonthly)}`}
          </button>
          {status ? (
            <p className="mt-2 text-center text-[13px] text-[#673de6]">
              {status}
            </p>
          ) : null}
          <p className="mt-4 text-[11px] text-[#94a3b8]">
            Payments use your configured gateway when STRIPE_SECRET_KEY is set.
            No charge is made until payment succeeds.
          </p>
        </form>
      </main>
    </div>
  );
}
