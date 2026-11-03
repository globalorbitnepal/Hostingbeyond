"use client";

import Link from "next/link";

import { formatPanelDateTime } from "@/lib/panel/domain-status";
import { useEffect, useState } from "react";

import { useLocale } from "@/components/locale/locale-provider";
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
    return "hb-muted";
  }
  if (type === "CREDIT" || type === "RELEASE") return "text-[var(--hb-p-ok)]";
  if (type === "RESERVE") return "text-[var(--hb-p-warn)]";
  return "hb-text";
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
  const { checkoutNote } = useLocale();
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
      <p className="hb-muted mt-6 text-sm" role="status">
        Loading transaction history…
      </p>
    );
  }

  if (error) {
    return (
      <p className="hb-pill hb-pill-danger mt-6 inline-flex" role="alert">
        {error}
      </p>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="hb-muted mt-6 text-sm">
        No wallet transactions yet.{" "}
        <Link href={routes.accountWallet} className="hb-link">
          Add funds
        </Link>{" "}
        to register or renew domains.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <p className="hb-muted mb-3 text-sm">
        Billing history is shown in USD, the ledger currency. {checkoutNote}
      </p>
      <ul className="space-y-2">
        {entries.map((row) => (
          <li
            key={row.id}
            className="hb-table-row flex flex-wrap justify-between gap-3 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="hb-text font-semibold">{row.description}</p>
              <p className="hb-muted mt-0.5 text-xs">
                {formatPanelDateTime(row.createdAt)} · {statusBadge(row.status)}
                {row.type === "RESERVE" ? " · Reserved" : ""}
              </p>
              {row.domainOrderPublicId ? (
                <Link
                  href={`${routes.accountOrders}/${encodeURIComponent(row.domainOrderPublicId)}`}
                  className="hb-link mt-1 inline-block text-xs"
                >
                  Order {row.domainOrderPublicId}
                </Link>
              ) : null}
            </div>
            <div className="text-right">
              <p
                className={`font-bold tabular-nums ${ledgerAmountClass(row.type, row.status)}`}
              >
                {row.type === "CREDIT" || row.type === "RELEASE" ? "+" : "−"}
                {formatMoney(row.amount, row.currency)}
              </p>
              {row.balanceAfter != null ? (
                <p className="hb-muted text-xs tabular-nums">
                  Balance {formatMoney(row.balanceAfter, row.currency)}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
