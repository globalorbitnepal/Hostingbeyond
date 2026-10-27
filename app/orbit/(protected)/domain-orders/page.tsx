"use client";

import { useEffect, useState } from "react";

export default function OrbitDomainOrdersPage() {
  const [rows, setRows] = useState<
    Array<{
      publicId: string;
      domain: string;
      orderType: string;
      status: string;
      total: number;
      currency: string;
      errorMessageCustomer?: string | null;
      user?: { email: string | null };
    }>
  >([]);

  useEffect(() => {
    void fetch("/api/orbit/domain-orders")
      .then((r) => r.json())
      .then((json) => setRows(json.rows ?? []));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-[#2f1c6a]">Domain orders</h1>
      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Domain</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Retail total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.publicId} className="border-b">
                <td className="px-4 py-3 font-mono text-xs">{row.publicId}</td>
                <td className="px-4 py-3">{row.domain}</td>
                <td className="px-4 py-3">{row.orderType}</td>
                <td className="px-4 py-3">{row.user?.email ?? "—"}</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
