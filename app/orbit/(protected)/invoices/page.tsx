"use client";

import { useEffect, useState } from "react";

export default function OrbitInvoicesPage() {
  const [rows, setRows] = useState<
    Array<{
      id: string;
      invoiceNumber: string;
      status: string;
      total: string;
      currency: string;
      user?: { email: string | null };
      domainOrder?: { publicId: string; domain: string } | null;
    }>
  >([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("invoiceNumber", query.trim());
    void fetch(`/api/orbit/invoices?${params}`)
      .then((r) => r.json())
      .then((json) => setRows(json.rows ?? []));
  }, [query]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-[#2f1c6a]">Invoices</h1>
      <input
        className="w-full max-w-md rounded-xl border px-3 py-2 text-sm"
        placeholder="Search invoice number"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Domain</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b">
                <td className="px-4 py-3 font-mono text-xs">
                  {row.invoiceNumber}
                </td>
                <td className="px-4 py-3">{row.user?.email ?? "—"}</td>
                <td className="px-4 py-3">{row.domainOrder?.domain ?? "—"}</td>
                <td className="px-4 py-3">{row.status}</td>
                <td className="px-4 py-3">
                  {row.total} {row.currency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
