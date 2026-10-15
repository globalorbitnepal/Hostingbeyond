"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { routes } from "@/config/routes";

type LedgerEntry = {
  id: string;
  createdAt: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  balanceAfter: number | null;
  description: string;
  domainOrderPublicId: string | null;
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function ledgerAmountClass(type: string, status: string): string {
  if (status === "FAILED" || status === "REVERSED") {
    return "text-slate-500";
  }
  if (type === "CREDIT" || type === "RELEASE") return "text-emerald-700";
  if (type === "RESERVE") return "text-amber-700";
  return "text-slate-900";
}

function statusBadge(status: string): string {
  switch (status) {
    case "COMPLETED":
      return "Completed";
    case "PENDING":
      return "Pending";
    case "FAILED":
      return "Failed";
    case "REVERSED":
      return "Reversed";
    default:
      return status;
  }
}

export function BillingLedgerPanel() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/domains/wallet/ledger?limit=100");
        if (!res.ok) {
          if (!cancelled) setError("Could not load transactions.");
          return;
        }
        const json = (await res.json()) as { entries?: LedgerEntry[] };
        if (!cancelled) {
          setEntries(Array.isArray(json.entries) ? json.entries : []);
        }
      } catch {
        if (!cancelled) setError("Could not load transactions.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p className="mt-6 text-sm text-slate-500" role="status">
        Loading transaction history…
      </p>
    );
  }

  if (error) {
    return (
      <p className="mt-6 text-sm text-red-600" role="alert">
        {error}
      </p>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="mt-6 text-sm text-slate-600">
        No wallet transactions yet.{" "}
        <Link
          href={routes.accountWallet}
          className="font-semibold text-[#673de6]"
        >
          Add funds
        </Link>{" "}
        to register or renew domains.
      </p>
    );
  }

  return (
    <ul className="mt-6 divide-y divide-slate-100">
      {entries.map((row) => (
        <li key={row.id} className="flex flex-wrap justify-between gap-3 py-4">
          <div className="min-w-0">
            <p className="font-medium text-slate-900">{row.description}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {new Date(row.createdAt).toLocaleString()} ·{" "}
              {statusBadge(row.status)}
              {row.type === "RESERVE" ? " · Reserved" : ""}
            </p>
            {row.domainOrderPublicId ? (
              <Link
                href={`${routes.accountOrders}/${encodeURIComponent(row.domainOrderPublicId)}`}
                className="mt-1 inline-block text-xs font-semibold text-[#673de6]"
              >
                Order {row.domainOrderPublicId}
              </Link>
            ) : null}
          </div>
          <div className="text-right">
            <p
              className={`font-semibold tabular-nums ${ledgerAmountClass(row.type, row.status)}`}
            >
              {row.type === "CREDIT" || row.type === "RELEASE" ? "+" : "−"}
              {formatMoney(row.amount, row.currency)}
            </p>
            {row.balanceAfter != null ? (
              <p className="text-xs text-slate-500 tabular-nums">
                Balance {formatMoney(row.balanceAfter, row.currency)}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
