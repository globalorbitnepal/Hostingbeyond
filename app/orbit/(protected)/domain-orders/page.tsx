"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";

type DomainOrderRow = {
  publicId: string;
  domain: string;
  orderType: string;
  status: string;
  total: number;
  currency: string;
  errorMessageCustomer?: string | null;
  user?: { email: string | null };
};

export default function OrbitDomainOrdersPage() {
  const [rows, setRows] = useState<DomainOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orbit/domain-orders");
      if (!res.ok) throw new Error("Could not load domain orders.");
      const json = (await res.json()) as { rows?: DomainOrderRow[] };
      setRows(json.rows ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load domain orders.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      [
        row.publicId,
        row.domain,
        row.orderType,
        row.status,
        row.user?.email ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [rows, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-[#2f1c6a]">
          Domain orders
        </h1>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
        >
          <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <label className="relative block w-full max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search order, domain, or customer…"
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-3 pl-10 text-sm"
        />
      </label>

      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Domain</th>
              <th className="hidden px-4 py-3 md:table-cell">Type</th>
              <th className="hidden px-4 py-3 sm:table-cell">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Retail total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  Loading domain orders…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  {rows.length === 0 ? "No domain orders yet." : "No matches."}
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.publicId} className="border-b">
                  <td className="px-4 py-3 font-mono text-xs">
                    {row.publicId}
                  </td>
                  <td className="px-4 py-3">{row.domain}</td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    {row.orderType}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    {row.user?.email ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {row.status}
                    {row.errorMessageCustomer
                      ? ` · ${row.errorMessageCustomer}`
                      : ""}
                  </td>
                  <td className="px-4 py-3">
                    {row.currency} {Number(row.total).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
