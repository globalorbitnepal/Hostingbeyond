"use client";

import { useEffect, useState } from "react";

type Row = {
  id: string;
  publicId: string;
  customerName: string;
  customerEmail: string;
  domain: string | null;
  status: string;
  createdAt: string;
};

export function OrbitMigrationRequestsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    void fetch("/api/orbit/migration-requests")
      .then((r) => r.json())
      .then((json: { rows?: Row[] }) => setRows(json.rows ?? []));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-[#2f1c6a]">
        Migration requests
      </h1>
      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Domain</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b">
                <td className="px-4 py-3 font-mono text-xs">{row.publicId}</td>
                <td className="px-4 py-3">
                  {row.customerName}
                  <br />
                  <span className="text-slate-500">{row.customerEmail}</span>
                </td>
                <td className="px-4 py-3">{row.domain ?? "—"}</td>
                <td className="px-4 py-3">{row.status}</td>
                <td className="px-4 py-3">
                  {new Date(row.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
