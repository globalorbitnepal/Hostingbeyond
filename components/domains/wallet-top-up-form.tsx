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
      <label className="hb-label !text-sm">
        Add funds
        <input
          type="number"
          min={5}
          max={10000}
          step={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="hb-input mt-1 h-11"
        />
      </label>
      {!paymentProviderConfigured ? (
        <p className="hb-muted text-xs">
          Payment provider integration is pending. No charge will be made until
          verified checkout is enabled.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="hb-btn hb-btn-primary h-11"
      >
        {loading ? "Please wait…" : "Continue to payment"}
      </button>
      {message ? (
        <p className="hb-soft hb-text-soft px-3 py-2 text-sm">{message}</p>
      ) : null}
    </form>
  );
}
