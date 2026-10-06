"use client";

import { useState } from "react";

export function WalletTopUpForm({
  paymentProviderConfigured,
}: {
  paymentProviderConfigured: boolean;
}) {
  const [amount, setAmount] = useState("25");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/domains/wallet/top-up", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": crypto.randomUUID(),
        },
        body: JSON.stringify({ amount: Number(amount) }),
      });
      const json = (await res.json()) as {
        message?: string;
        ok?: boolean;
        checkoutUrl?: string;
      };
      if (json.ok && json.checkoutUrl) {
        window.location.assign(json.checkoutUrl);
        return;
      }
      setMessage(
        json.message ??
          "Wallet top-up is not available yet. Payment integration is pending.",
      );
    } catch {
      setMessage("Could not start top-up. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-3">
      <label className="block text-sm font-semibold text-slate-800">
        Add funds
        <input
          type="number"
          min={5}
          max={10000}
          step={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
      </label>
      {!paymentProviderConfigured ? (
        <p className="text-xs text-slate-500">
          Payment provider integration is pending. No charge will be made until
          verified checkout is enabled.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-11 items-center rounded-full bg-gradient-to-r from-[#673de6] to-[#2563eb] px-5 text-sm font-bold text-white disabled:opacity-60"
      >
        {loading ? "Please wait…" : "Continue to payment"}
      </button>
      {message ? (
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      ) : null}
    </form>
  );
}
