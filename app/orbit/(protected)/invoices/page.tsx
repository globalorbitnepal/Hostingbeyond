"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  status: string;
  total: string;
  currency: string;
  user?: { email: string | null };
  domainOrder?: { publicId: string; domain: string } | null;
};

export default function OrbitInvoicesPage() {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (needle: string) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (needle.trim()) params.set("invoiceNumber", needle.trim());
      const res = await fetch(`/api/orbit/invoices?${params}`);
      if (!res.ok) throw new Error("Could not load invoices.");
      const json = (await res.json()) as { rows?: InvoiceRow[] };
      setRows(json.rows ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load invoices.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(query);
  }, [load, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-[#2f1c6a]">Invoices</h1>
        <button
          type="button"
          onClick={() => void load(query)}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
        >
          <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <label className="relative block w-full max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full rounded-xl border py-2 pr-3 pl-10 text-sm"
          placeholder="Search invoice number"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Customer</th>
              <th className="hidden px-4 py-3 md:table-cell">Domain</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  Loading invoices…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  No invoices found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="px-4 py-3 font-mono text-xs">
                    {row.invoiceNumber}
                  </td>
                  <td className="px-4 py-3">{row.user?.email ?? "—"}</td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    {row.domainOrder?.domain ?? "—"}
                  </td>
                  <td className="px-4 py-3">{row.status}</td>
                  <td className="px-4 py-3">
                    {row.total} {row.currency}
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
