"use client";

import { useCallback, useEffect, useState } from "react";

type Row = {
  id: string;
  domain: string;
  orderType: string;
  status: string;
  total: number;
  currency: string;
  providerOrderId: string | null;
  createdAt: string;
  updatedAt: string;
  customer: { email: string | null; name: string | null } | null;
};

type Snapshot = {
  checkedAt: string;
  providerStatus: string | null;
  expiresAt: string | null;
  domainExistsAtProvider: boolean;
  errorCode?: string;
};

export default function DomainReconciliationAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [snapshots, setSnapshots] = useState<Record<string, Snapshot>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/orbit/domain-reconciliation");
    const json = (await res.json()) as { rows?: Row[] };
    setRows(json.rows ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function check(orderId: string) {
    setBusy(orderId);
    setMessage(null);
    const res = await fetch("/api/orbit/domain-reconciliation", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderId, action: "check" }),
    });
    const json = (await res.json()) as { snapshot?: Snapshot; error?: string };
    setBusy(null);
    if (json.snapshot) {
      setSnapshots((prev) => ({ ...prev, [orderId]: json.snapshot! }));
    } else {
      setMessage(json.error ?? "Check failed.");
    }
  }

  async function act(orderId: string, action: "finalize" | "rollback") {
    const snapshot = snapshots[orderId];
    if (!snapshot) {
      setMessage("Check provider status first.");
      return;
    }
    setBusy(`${action}:${orderId}`);
    setMessage(null);
    const res = await fetch("/api/orbit/domain-reconciliation", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderId, action, snapshot }),
    });
    const json = (await res.json()) as { error?: string };
    setBusy(null);
    if (!res.ok) {
      setMessage(json.error ?? "Action failed.");
      return;
    }
    setMessage(`Order ${action} completed.`);
    await load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-[#2f1c6a]">
        Domain reconciliation
      </h1>
      <p className="text-sm text-slate-600">
        Orders awaiting provider confirmation. Finalize only when the registry
        shows the domain registered. Rollback only when registration did not
        complete.
      </p>
      {message ? (
        <p className="rounded-xl bg-violet-50 px-4 py-2 text-sm text-violet-900">
          {message}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Domain</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Operation</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Last check</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const snap = snapshots[row.id];
              return (
                <tr key={row.id} className="border-b align-top">
                  <td className="px-4 py-3 font-medium">{row.domain}</td>
                  <td className="px-4 py-3">{row.customer?.email ?? "—"}</td>
                  <td className="px-4 py-3">{row.orderType}</td>
                  <td className="px-4 py-3">
                    {row.currency} {row.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(row.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {snap
                      ? `${new Date(snap.checkedAt).toLocaleString()} · ${
                          snap.providerStatus ?? snap.errorCode ?? "unknown"
                        }`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy !== null}
                        onClick={() => void check(row.id)}
                        className="rounded-lg border px-2 py-1 text-xs font-bold"
                      >
                        Check provider
                      </button>
                      <button
                        type="button"
                        disabled={
                          busy !== null || !snap?.domainExistsAtProvider
                        }
                        onClick={() => void act(row.id, "finalize")}
                        className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-bold text-white disabled:opacity-50"
                      >
                        Finalize
                      </button>
                      <button
                        type="button"
                        disabled={
                          busy !== null || !snap || snap.domainExistsAtProvider
                        }
                        onClick={() => void act(row.id, "rollback")}
                        className="rounded-lg bg-red-600 px-2 py-1 text-xs font-bold text-white disabled:opacity-50"
                      >
                        Rollback
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">
            No orders need reconciliation.
          </p>
        ) : null}
      </div>
    </div>
  );
}
