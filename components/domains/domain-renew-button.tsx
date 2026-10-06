"use client";

import { useState } from "react";

export function DomainRenewButton({ domain }: { domain: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function renew() {
    if (loading) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/domains/checkout/renew", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": crypto.randomUUID(),
        },
        body: JSON.stringify({ domain }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        reconciliation?: boolean;
      };
      if (!res.ok || !json.ok) {
        setMessage(json.error ?? "Renewal could not be completed.");
        return;
      }
      if (json.reconciliation) {
        setMessage(
          "We're confirming your renewal with the registry. Your payment is safely held until we verify status.",
        );
        return;
      }
      setMessage("Renewal completed successfully.");
    } catch {
      setMessage("Renewal could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        disabled={loading}
        onClick={() => void renew()}
        className="text-xs font-bold text-[#673de6] hover:underline disabled:opacity-60"
      >
        {loading ? "Renewing…" : "Renew now"}
      </button>
      {message ? (
        <p className="mt-1 text-xs text-slate-600">{message}</p>
      ) : null}
    </div>
  );
}
