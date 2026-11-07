"use client";

import { useEffect, useState } from "react";

type Payload = {
  monthKey: string;
  paidBudgetEnabled?: boolean;
  capCents: number;
  warnCents: number;
  criticalCents: number;
  spentCents: number;
  reservedCents: number;
  committedCents: number;
  remainingCents: number;
  disclaimer: string;
  topCustomers: {
    customerUserId: string;
    email: string | null;
    name: string | null;
    spentCents: number;
  }[];
};

function usd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function OrbitBeyondMasterAiBudgetPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/orbit/beyond-master/ai-budget", {
          cache: "no-store",
        });
        const payload = (await res.json()) as
          (Payload & { error?: string }) | null;
        if (cancelled) return;
        if (!res.ok || !payload || "error" in payload) {
          setError(payload?.error ?? "Could not load budget.");
          setData(null);
          return;
        }
        setData(payload);
        setError("");
      } catch {
        if (!cancelled) setError("Could not load budget.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">
        AI Agent — monthly budget (application cap)
      </h1>
      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {data ? (
        <>
          <p className="text-sm text-slate-600">
            {data.paidBudgetEnabled === false
              ? `Month ${data.monthKey}: Google AI Studio free plan is active. $0.00 billed.`
              : `Month ${data.monthKey}: committed ${usd(data.committedCents)} of ${usd(data.capCents)} cap · remaining ${usd(data.remainingCents)}. Warn at ${usd(data.warnCents)}, critical at ${usd(data.criticalCents)}.`}
          </p>
          <p className="text-sm text-amber-900">{data.disclaimer}</p>
          <h2 className="text-sm font-semibold text-slate-900">
            Top customers (paid ledger)
          </h2>
          <ul className="text-sm text-slate-700">
            {data.topCustomers.length === 0 ? (
              <li>No per-customer spend recorded this month.</li>
            ) : (
              data.topCustomers.map((row) => (
                <li key={row.customerUserId}>
                  {row.email ?? row.name ?? row.customerUserId}:{" "}
                  {usd(row.spentCents)}
                </li>
              ))
            )}
          </ul>
        </>
      ) : !error ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : null}
    </div>
  );
}
