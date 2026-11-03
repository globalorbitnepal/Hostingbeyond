"use client";

import Link from "next/link";

import { formatDomainDate } from "@/lib/panel/domain-status";
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
    return <p className="hb-muted text-sm">Loading invoices…</p>;
  }
  if (error) {
    return <p className="hb-pill hb-pill-danger inline-flex">{error}</p>;
  }
  if (rows.length === 0) {
    return (
      <p className="hb-muted text-sm">
        No invoices yet. Invoices are issued when domain orders complete.
      </p>
    );
  }

  return (
    <ul className="mt-2 space-y-2">
      {rows.map((row) => (
        <li
          key={row.publicId}
          className="hb-table-row flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="hb-text font-bold">{row.invoiceNumber}</p>
            <p className="hb-muted text-xs">
              {row.issuedAt ? formatDomainDate(row.issuedAt) : "—"} ·{" "}
              {row.status}
              {row.tax !== "0.00" ? ` · Tax ${row.tax} ${row.currency}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hb-text text-sm font-bold tabular-nums">
              {row.total} {row.currency}
            </span>
            <Link
              href={`${routes.accountInvoices}/${row.publicId}`}
              className="hb-link text-sm"
            >
              View
            </Link>
            <a
              href={`/api/account/invoices/${row.publicId}/pdf`}
              className="hb-link text-sm"
            >
              PDF
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
