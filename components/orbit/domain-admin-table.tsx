"use client";

import { useMemo, useState } from "react";

import { daysUntil, formatDomainDate } from "@/lib/panel/domain-status";

type Row = {
  id: string;
  domain: string;
  status: string;
  registrarProvider: string;
  autoRenew: boolean;
  transferLock: boolean;
  expiresAt: string | null;
  ownerEmail: string | null;
  ownerName: string | null;
};

export function DomainAdminTable({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (row) =>
        row.domain.toLowerCase().includes(needle) ||
        (row.ownerEmail ?? "").toLowerCase().includes(needle) ||
        (row.ownerName ?? "").toLowerCase().includes(needle),
    );
  }, [rows, q]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-semibold text-slate-800">
          {filtered.length} of {rows.length} domains
        </p>
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search domain or customer…"
          className="h-9 w-full max-w-xs rounded-lg border border-slate-200 px-3 text-sm"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-bold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-2.5">Domain</th>
              <th className="px-4 py-2.5">Owner</th>
              <th className="px-4 py-2.5">Registrar</th>
              <th className="px-4 py-2.5">Expires</th>
              <th className="px-4 py-2.5">Flags</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No domains match this search.
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const days = daysUntil(row.expiresAt);
                return (
                  <tr
                    key={row.id}
                    className="border-t border-slate-100 hover:bg-violet-50/40"
                  >
                    <td className="px-4 py-2.5">
                      <p className="font-semibold text-slate-900">
                        {row.domain}
                      </p>
                      <p className="text-[11px] text-slate-500">{row.status}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      {row.ownerEmail ? (
                        <>
                          <p className="text-slate-800">
                            {row.ownerName ?? "—"}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {row.ownerEmail}
                          </p>
                        </>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">
                      {row.registrarProvider}
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="text-slate-800 tabular-nums">
                        {formatDomainDate(row.expiresAt)}
                      </p>
                      {days !== null ? (
                        <p
                          className={
                            days <= 14
                              ? "text-[11px] font-semibold text-rose-600"
                              : "text-[11px] text-slate-500"
                          }
                        >
                          {days < 0
                            ? `${Math.abs(days)} days ago`
                            : `${days} days left`}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        <span
                          className={
                            row.autoRenew
                              ? "rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700"
                              : "rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600"
                          }
                        >
                          {row.autoRenew ? "Auto-renew" : "Manual"}
                        </span>
                        <span
                          className={
                            row.transferLock
                              ? "rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700"
                              : "rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700"
                          }
                        >
                          {row.transferLock ? "Locked" : "Unlocked"}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
