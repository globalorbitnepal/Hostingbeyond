"use client";

import { useState } from "react";
import Link from "next/link";

export function PanelDomainTransfer() {
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setReady("");
    try {
      const res = await fetch("/api/domains/transfer-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const data = (await res.json()) as {
        error?: string;
        result?: {
          domain?: string;
          eligible?: boolean;
          message?: string;
          checkoutHref?: string;
        };
      };
      if (!res.ok) {
        setError(data.error || "This domain cannot be transferred right now.");
        return;
      }
      if (!data.result?.eligible) {
        setError(
          data.result?.message ||
            "This domain cannot be transferred right now.",
        );
        return;
      }
      setReady(
        data.result.checkoutHref ||
          `/domain-transfer?domain=${encodeURIComponent(data.result.domain || domain)}`,
      );
    } catch {
      setError("Transfer check failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <section className="hb-panel-card p-6">
        <h2 className="font-heading text-xl font-bold">Transfer a domain</h2>
        <p className="mt-1 text-sm text-[var(--hb-p-muted)]">
          We check the name here. The auth code is collected only on the secure
          transfer checkout.
        </p>
        <form
          onSubmit={(event) => void onSubmit(event)}
          className="mt-4 space-y-3"
        >
          <input
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            placeholder="example.com"
            className="h-11 w-full rounded-xl border border-[var(--hb-p-border)] bg-transparent px-3 text-sm"
            required
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-[var(--hb-p-primary)] px-4 py-2 text-sm font-bold text-white"
          >
            {busy ? "Checking" : "Check transfer"}
          </button>
        </form>
        {error ? <p className="mt-3 text-sm text-amber-700">{error}</p> : null}
        {ready ? (
          <Link
            href={ready}
            className="mt-4 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white"
          >
            Continue transfer
          </Link>
        ) : null}
      </section>
    </div>
  );
}
