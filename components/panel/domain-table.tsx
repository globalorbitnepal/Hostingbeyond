"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, Globe, RefreshCw, Search } from "lucide-react";

import {
  daysUntil,
  domainHealth,
  domainStatusLabel,
  expiryCopy,
  formatDomainDate,
  healthTone,
} from "@/lib/panel/domain-status";
import { cn } from "@/lib/utils";

export type DomainTableRow = {
  domain: string;
  status: string;
  registeredAt: string | null;
  expiresAt: string | null;
  autoRenew: boolean;
  renewalPrice: number | null;
  currency: string;
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "expiring", label: "Expiring soon" },
  { id: "expired", label: "Expired" },
  { id: "pending", label: "Setting up" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function DomainTable({ rows }: { rows: DomainTableRow[] }) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((row) => {
      if (needle && !row.domain.toLowerCase().includes(needle)) return false;
      const health = domainHealth(row.status, row.expiresAt);
      if (filter === "expiring")
        return health === "expiring" || health === "critical";
      if (filter === "expired") return health === "expired";
      if (filter === "pending") return health === "pending";
      return true;
    });
  }, [rows, filter, q]);

  return (
    <div className="hb-panel-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[var(--hb-p-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                filter === tab.id
                  ? "bg-[var(--hb-p-primary)] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <label className="relative block w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search your domains…"
            className="w-full rounded-xl border border-[var(--hb-p-border)] bg-white py-2 pr-3 pl-9 text-sm"
          />
        </label>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-[11px] font-bold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Domain</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Auto-renew</th>
              <th className="px-4 py-3">Renewal</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  No domains match this filter.
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const health = domainHealth(row.status, row.expiresAt);
                const tone = healthTone(health);
                const days = daysUntil(row.expiresAt);
                return (
                  <tr
                    key={row.domain}
                    className="border-t border-slate-100 hover:bg-violet-50/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-[var(--hb-p-primary)]/10 text-[var(--hb-p-primary)]">
                          <Globe className="size-3.5" />
                        </span>
                        <Link
                          href={`/account/my-domains/${encodeURIComponent(row.domain)}`}
                          className="font-semibold text-slate-900 hover:text-[var(--hb-p-primary)]"
                        >
                          {row.domain}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                          tone.pill,
                        )}
                      >
                        {tone.label}
                      </span>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {domainStatusLabel(row.status)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 tabular-nums">
                        {formatDomainDate(row.expiresAt)}
                      </p>
                      <p className={cn("text-[11px]", tone.text)}>
                        {expiryCopy(row.expiresAt)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          row.autoRenew
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600",
                        )}
                      >
                        <RefreshCw className="size-3" />
                        {row.autoRenew ? "On" : "Off"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 tabular-nums">
                      {row.renewalPrice != null
                        ? formatMoney(row.renewalPrice, row.currency)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {days !== null && days <= 45 ? (
                          <Link
                            href={`/account/my-domains/${encodeURIComponent(row.domain)}`}
                            className="rounded-lg bg-[var(--hb-p-primary)] px-2.5 py-1.5 text-xs font-bold text-white transition hover:brightness-110"
                          >
                            Renew
                          </Link>
                        ) : null}
                        <Link
                          href={`/account/my-domains/${encodeURIComponent(row.domain)}`}
                          className="rounded-lg border border-[var(--hb-p-border)] px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[var(--hb-p-primary)]/40 hover:text-[var(--hb-p-primary)]"
                        >
                          Manage
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-slate-100 md:hidden">
        {filtered.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-slate-500">
            No domains match this filter.
          </li>
        ) : (
          filtered.map((row) => {
            const health = domainHealth(row.status, row.expiresAt);
            const tone = healthTone(health);
            const days = daysUntil(row.expiresAt);
            return (
              <li key={row.domain} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {row.domain}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {expiryCopy(row.expiresAt)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                      tone.pill,
                    )}
                  >
                    {tone.label}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/account/my-domains/${encodeURIComponent(row.domain)}`}
                    className="rounded-lg border border-[var(--hb-p-border)] px-3 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    Manage
                  </Link>
                  {days !== null && days <= 45 ? (
                    <Link
                      href={`/account/my-domains/${encodeURIComponent(row.domain)}`}
                      className="rounded-lg bg-[var(--hb-p-primary)] px-3 py-1.5 text-xs font-bold text-white"
                    >
                      Renew
                    </Link>
                  ) : null}
                  <span className="ml-auto text-xs text-slate-500">
                    {row.renewalPrice != null
                      ? formatMoney(row.renewalPrice, row.currency)
                      : ""}
                  </span>
                </div>
              </li>
            );
          })
        )}
      </ul>

      <div className="flex items-center justify-between border-t border-[var(--hb-p-border)] px-4 py-2.5 text-xs text-slate-500">
        <span>
          {filtered.length} of {rows.length} domain
          {rows.length === 1 ? "" : "s"}
        </span>
        <span className="inline-flex items-center gap-1">
          Prices in USD
          <ChevronDown className="size-3" />
        </span>
      </div>
    </div>
  );
}
