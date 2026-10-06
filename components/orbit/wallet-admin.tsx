"use client";

import { useCallback, useState } from "react";

type CustomerRow = {
  id: string;
  email: string;
  name: string | null;
  balance: number;
  currency: string;
};

export function OrbitWalletAdmin() {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [selected, setSelected] = useState<CustomerRow | null>(null);
  const [detail, setDetail] = useState<{
    transactions: unknown[];
    payments: unknown[];
  } | null>(null);
  const [amount, setAmount] = useState("25");
  const [reason, setReason] = useState("");
  const [direction, setDirection] = useState<"credit" | "debit">("credit");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/orbit/wallets?q=${encodeURIComponent(query.trim())}`,
      );
      const json = (await res.json()) as { customers?: CustomerRow[] };
      setCustomers(json.customers ?? []);
    } finally {
      setLoading(false);
    }
  }, [query]);

  async function loadCustomer(customer: CustomerRow) {
    setSelected(customer);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/orbit/wallets?userId=${encodeURIComponent(customer.id)}`,
      );
      const json = (await res.json()) as {
        transactions?: unknown[];
        payments?: unknown[];
        user?: CustomerRow;
      };
      if (json.user) setSelected(json.user);
      setDetail({
        transactions: json.transactions ?? [],
        payments: json.payments ?? [],
      });
    } finally {
      setLoading(false);
    }
  }

  async function adjust() {
    if (!selected) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/orbit/wallets/adjust", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "adjust",
          userId: selected.id,
          direction,
          amount: Number(amount),
          reason,
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      const json = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setMessage(json.error ?? "Adjustment failed");
        return;
      }
      setMessage("Wallet updated.");
      setReason("");
      await loadCustomer(selected);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search customer email or name"
          className="min-w-[240px] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => void search()}
          disabled={loading}
          className="rounded-xl bg-[#673de6] px-4 py-2 text-sm font-semibold text-white"
        >
          Search
        </button>
      </div>

      {customers.length > 0 ? (
        <ul className="divide-y rounded-xl border border-slate-200 bg-white">
          {customers.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className="flex w-full justify-between px-4 py-3 text-left text-sm hover:bg-slate-50"
                onClick={() => void loadCustomer(c)}
              >
                <span>
                  {c.email}
                  {c.name ? ` · ${c.name}` : ""}
                </span>
                <span className="font-semibold">
                  {c.currency} {c.balance.toFixed(2)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {selected ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-900">{selected.email}</h2>
          <p className="text-sm text-slate-600">
            Balance: {selected.currency} {selected.balance.toFixed(2)}
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <select
              value={direction}
              onChange={(e) =>
                setDirection(e.target.value as "credit" | "debit")
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
            <input
              type="number"
              min={5}
              max={10000}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Audit reason (required)"
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows={2}
          />
          <button
            type="button"
            onClick={() => void adjust()}
            disabled={loading || !reason.trim()}
            className="mt-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Apply adjustment
          </button>
          {message ? (
            <p className="mt-2 text-sm text-slate-700">{message}</p>
          ) : null}
          {detail ? (
            <pre className="mt-4 max-h-64 overflow-auto rounded-lg bg-slate-50 p-3 text-xs">
              {JSON.stringify(detail, null, 2)}
            </pre>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
