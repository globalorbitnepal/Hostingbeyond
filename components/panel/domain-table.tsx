"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Globe, RefreshCw, Search } from "lucide-react";

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
                "rounded-full px-3 py-1.5 text-xs font-bold transition",
                filter === tab.id
                  ? "text-white shadow-sm"
                  : "hb-muted hover:bg-[var(--hb-p-primary)]/10",
              )}
              style={
                filter === tab.id
                  ? {
                      background:
                        "linear-gradient(135deg, var(--hb-p-primary-strong), var(--hb-p-accent))",
                    }
                  : undefined
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
        <label className="relative block w-full sm:max-w-xs">
          <Search className="hb-faint pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search your domains…"
            className="hb-input !rounded-full !py-2 pr-3 pl-9"
          />
        </label>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="hb-muted text-[11px] font-bold tracking-wide uppercase">
            <tr className="border-b border-[var(--hb-p-border)]">
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
                <td colSpan={6} className="hb-muted px-4 py-10 text-center">
                  No domains match this filter.
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const health = domainHealth(row.status, row.expiresAt);
                const tone = healthTone(health);
                const days = daysUntil(row.expiresAt);
                const href = `/account/my-domains/${encodeURIComponent(row.domain)}`;
                return (
                  <tr
                    key={row.domain}
                    className="border-b border-[var(--hb-p-border)] transition last:border-0 hover:bg-[var(--hb-p-primary)]/5"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          aria-hidden
                          className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-[var(--hb-p-primary)]"
                          style={{
                            background:
                              "color-mix(in srgb, var(--hb-p-primary) 14%, transparent)",
                          }}
                        >
                          <Globe className="size-3.5" />
                        </span>
                        <Link href={href} className="hb-text font-bold">
                          {row.domain}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("hb-pill", tone.pillClass)}>
                        {tone.label}
                      </span>
                      <p className="hb-faint mt-0.5 text-[11px]">
                        {domainStatusLabel(row.status)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="hb-text font-semibold tabular-nums">
                        {formatDomainDate(row.expiresAt)}
                      </p>
                      <p className="hb-muted text-[11px]">
                        {expiryCopy(row.expiresAt)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
                          row.autoRenew ? "hb-pill-ok" : "hb-pill-neutral",
                        )}
                      >
                        <RefreshCw className="size-3" />
                        {row.autoRenew ? "On" : "Off"}
                      </span>
                    </td>
                    <td className="hb-text-soft px-4 py-3 tabular-nums">
                      {row.renewalPrice != null
                        ? formatMoney(row.renewalPrice, row.currency)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {days !== null && days <= 45 ? (
                          <Link
                            href={href}
                            className="hb-btn hb-btn-primary hb-btn-sm"
                          >
                            Renew
                          </Link>
                        ) : null}
                        <Link
                          href={href}
                          className="hb-btn hb-btn-ghost hb-btn-sm"
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
      <ul className="md:hidden">
        {filtered.length === 0 ? (
          <li className="hb-muted px-4 py-10 text-center text-sm">
            No domains match this filter.
          </li>
        ) : (
          filtered.map((row) => {
            const health = domainHealth(row.status, row.expiresAt);
            const tone = healthTone(health);
            const days = daysUntil(row.expiresAt);
            const href = `/account/my-domains/${encodeURIComponent(row.domain)}`;
            return (
              <li
                key={row.domain}
                className="border-b border-[var(--hb-p-border)] px-4 py-3 last:border-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="hb-text truncate text-sm font-bold">
                      {row.domain}
                    </p>
                    <p className="hb-muted mt-0.5 text-xs">
                      {expiryCopy(row.expiresAt)}
                    </p>
                  </div>
                  <span className={cn("hb-pill shrink-0", tone.pillClass)}>
                    {tone.label}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Link href={href} className="hb-btn hb-btn-ghost hb-btn-sm">
                    Manage
                  </Link>
                  {days !== null && days <= 45 ? (
                    <Link
                      href={href}
                      className="hb-btn hb-btn-primary hb-btn-sm"
                    >
                      Renew
                    </Link>
                  ) : null}
                  <span className="hb-muted ml-auto text-xs">
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

      <div className="hb-muted flex items-center justify-between border-t border-[var(--hb-p-border)] px-4 py-2.5 text-xs">
        <span>
          {filtered.length} of {rows.length} domain
          {rows.length === 1 ? "" : "s"}
        </span>
        <span>Renewal prices include one year</span>
      </div>
    </div>
  );
}
