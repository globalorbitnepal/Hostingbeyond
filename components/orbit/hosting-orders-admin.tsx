"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Globe2, RefreshCw, Search, Server } from "lucide-react";

type SiteRow = {
  id: string;
  type: string;
  name: string;
  domain: string | null;
  status: string;
  createdAt: string;
};

type OrderRow = {
  id: string;
  status: string;
  productSlug: string;
  planKey: string;
  planName: string;
  productName: string;
  billingCycle: string;
  total: number;
  currency: string;
  paymentStatus: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; email: string; name: string | null } | null;
  sites: SiteRow[];
};

const STATUSES = [
  "DRAFT",
  "PENDING_PAYMENT",
  "PAID",
  "PROVISIONING",
  "ACTIVE",
  "CANCELLED",
  "FAILED",
  "EXPIRED",
] as const;

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_PAYMENT: "Pending payment",
  PAID: "Paid — awaiting activation",
  PROVISIONING: "Provisioning",
  ACTIVE: "Active",
  CANCELLED: "Cancelled",
  FAILED: "Failed",
  EXPIRED: "Expired",
};

// Mirrors ALLOWED_TRANSITIONS on the server so the picker only offers legal moves.
const NEXT_STATUS: Record<string, string[]> = {
  DRAFT: ["PENDING_PAYMENT", "CANCELLED", "EXPIRED"],
  PENDING_PAYMENT: ["PAID", "CANCELLED", "EXPIRED", "FAILED"],
  PAID: ["PROVISIONING", "CANCELLED", "FAILED"],
  PROVISIONING: ["ACTIVE", "FAILED", "CANCELLED"],
  ACTIVE: ["CANCELLED"],
  CANCELLED: [],
  FAILED: ["PENDING_PAYMENT", "CANCELLED"],
  EXPIRED: [],
};

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function OrbitHostingOrdersAdmin() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (status !== "ALL") params.set("status", status);
      const res = await fetch(`/api/orbit/hosting-orders?${params}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as { rows?: OrderRow[]; error?: string };
      if (!res.ok) {
        setError(json.error ?? "Could not load hosting orders.");
        return;
      }
      setRows(json.rows ?? []);
    } catch {
      setError("Network error while loading hosting orders.");
    } finally {
      setLoading(false);
    }
  }, [query, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = useMemo(() => {
    const active = rows.filter((row) => row.status === "ACTIVE").length;
    const pending = rows.filter(
      (row) => row.status === "PENDING_PAYMENT" || row.status === "PAID",
    ).length;
    const siteRequests = rows.reduce(
      (sum, row) => sum + row.sites.filter((s) => s.status !== "live").length,
      0,
    );
    return { active, pending, siteRequests };
  }, [rows]);

  async function moveStatus(row: OrderRow, next: string) {
    const note = window.prompt(
      `Move ${row.planName} to "${STATUS_LABEL[next] ?? next}"? Enter an internal note:`,
      "",
    );
    if (note === null) return;
    setBusyId(row.id);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/orbit/hosting-orders", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: row.id, status: next, note }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(
          res.status === 401
            ? "Your Orbit session expired — sign in again."
            : (json.error ?? "Status update failed."),
        );
        return;
      }
      setNotice(
        `${row.user?.email ?? "Customer"} — ${row.planName} is now ${STATUS_LABEL[next] ?? next}.`,
      );
      await load();
    } catch {
      setError("Network error while updating the order.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Active plans", value: totals.active },
          { label: "Awaiting payment / activation", value: totals.pending },
          { label: "Website requests queued", value: totals.siteRequests },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
            <p className="text-xs text-slate-500 uppercase">{stat.label}</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void load();
            }}
            placeholder="Search customer email or name"
            className="w-full rounded-xl border border-slate-200 py-2 pr-3 pl-9 text-sm"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          aria-label="Filter by status"
        >
          <option value="ALL">All statuses</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABEL[value]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-[#673de6] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
          Refresh
        </button>
      </div>

      {notice ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <ul className="space-y-3">
        {rows.length === 0 ? (
          <li className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500 shadow-sm">
            No hosting orders match this filter.
          </li>
        ) : (
          rows.map((row) => {
            const nextOptions = NEXT_STATUS[row.status] ?? [];
            return (
              <li
                key={row.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {row.planName}
                    </p>
                    <p className="truncate text-xs text-slate-600">
                      {row.user?.name?.trim() || "No name"} ·{" "}
                      {row.user?.email ?? "unknown customer"}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {row.productName} · {row.billingCycle} ·{" "}
                      {formatMoney(row.total, row.currency)} ·{" "}
                      {formatDate(row.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {STATUS_LABEL[row.status] ?? row.status}
                    </span>
                    {row.paymentStatus ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                        <CheckCircle2 className="size-3" />
                        {row.paymentStatus}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <Globe2 className="size-3.5" /> Websites
                    </p>
                    <ul className="mt-1 space-y-1 text-xs text-slate-700">
                      {row.sites.length === 0 ? (
                        <li className="text-slate-500">None requested.</li>
                      ) : (
                        row.sites.map((site) => (
                          <li
                            key={site.id}
                            className="flex justify-between gap-2"
                          >
                            <span className="truncate">
                              {site.name}
                              {site.domain ? ` · ${site.domain}` : ""}
                            </span>
                            <span className="shrink-0 text-slate-500">
                              {site.type} · {site.status}
                            </span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <Server className="size-3.5" /> Move status
                    </p>
                    {nextOptions.length === 0 ? (
                      <p className="mt-1 text-xs text-slate-500">
                        This order is in a final state.
                      </p>
                    ) : (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {nextOptions.map((next) => (
                          <button
                            key={next}
                            type="button"
                            disabled={busyId === row.id}
                            onClick={() => void moveStatus(row, next)}
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                          >
                            {STATUS_LABEL[next] ?? next}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
