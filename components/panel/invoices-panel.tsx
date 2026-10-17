"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { routes } from "@/config/routes";

type InvoiceRow = {
  publicId: string;
  invoiceNumber: string;
  status: string;
  currency: string;
  total: string;
  tax: string;
  taxTreatment: string;
  issuedAt: string | null;
  paidAt: string | null;
};

export function InvoicesPanel() {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/invoices?limit=50");
      if (!res.ok) {
        setError("Could not load invoices.");
        setRows([]);
        return;
      }
      const json = await res.json();
      setRows(json.invoices ?? []);
    } catch {
      setError("Could not load invoices.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading invoices…</p>;
  }
  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }
  if (rows.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No invoices yet. Invoices are issued when domain orders complete.
      </p>
    );
  }

  return (
    <ul className="mt-6 divide-y divide-slate-100">
      {rows.map((row) => (
        <li
          key={row.publicId}
          className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-semibold text-slate-900">{row.invoiceNumber}</p>
            <p className="text-xs text-slate-500">
              {row.issuedAt ? new Date(row.issuedAt).toLocaleDateString() : "—"}{" "}
              · {row.status}
              {row.tax !== "0.00" ? ` · Tax ${row.tax} ${row.currency}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-800">
              {row.total} {row.currency}
            </span>
            <Link
              href={`${routes.accountInvoices}/${row.publicId}`}
              className="text-sm font-semibold text-[#673de6]"
            >
              View
            </Link>
            <a
              href={`/api/account/invoices/${row.publicId}/pdf`}
              className="text-sm font-semibold text-[#673de6]"
            >
              PDF
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
