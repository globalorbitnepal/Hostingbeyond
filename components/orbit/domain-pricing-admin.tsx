"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, X } from "lucide-react";

type TldRow = {
  id: string;
  tld: string;
  supplierRegister: number | null;
  supplierRenew: number | null;
  supplierTransfer: number | null;
  supplierSyncedAt: string | null;
  supplierMaxRegisterYears: number | null;
  retailRegister: number;
  retailRenew: number;
  retailTransfer: number;
  retailRegisterByYear: Record<string, number> | null;
  retailRenewByYear: Record<string, number> | null;
  enabled: boolean;
};

type SupplierSyncMeta = {
  status: string | null;
  syncedAt: string | null;
  tldsReceived: number | null;
  tldsUpdated: number | null;
  tldsFailed: number | null;
};

function money(v: number | null) {
  if (v == null || !Number.isFinite(v)) return "N/A";
  return `$${v.toFixed(2)}`;
}

function formatSyncTime(iso: string | null) {
  if (!iso) return "Never";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function OrbitDomainPricingAdmin() {
  const [rows, setRows] = useState<TldRow[]>([]);
  const [supplierSync, setSupplierSync] = useState<SupplierSyncMeta | null>(
    null,
  );
  const [tldCount, setTldCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState<TldRow | null>(null);
  const [draft, setDraft] = useState<{
    retailRegister: string;
    retailRenew: string;
    retailTransfer: string;
    registerYears: Record<string, string>;
    renewYears: Record<string, string>;
    enabled: boolean;
  } | null>(null);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [bulkRegister, setBulkRegister] = useState("");
  const [bulkRenew, setBulkRenew] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/orbit/domain-pricing");
    const json = (await res.json()) as {
      rows?: TldRow[];
      supplierSync?: SupplierSyncMeta;
      tldCount?: number;
    };
    setRows(json.rows ?? []);
    setSupplierSync(json.supplierSync ?? null);
    setTldCount(json.tldCount ?? json.rows?.length ?? 0);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const maxYearsForEdit = editing?.supplierMaxRegisterYears ?? 5;

  const yearKeys = useMemo(() => {
    const max = Math.min(Math.max(maxYearsForEdit ?? 5, 1), 5);
    return Array.from({ length: max }, (_, i) => String(i + 1));
  }, [maxYearsForEdit]);

  function openEdit(row: TldRow) {
    setEditing(row);
    const reg: Record<string, string> = {};
    const ren: Record<string, string> = {};
    for (let y = 1; y <= 5; y++) {
      const key = String(y);
      reg[key] =
        row.retailRegisterByYear?.[key]?.toString() ??
        (y === 1 ? String(row.retailRegister) : "");
      ren[key] =
        row.retailRenewByYear?.[key]?.toString() ??
        (y === 1 ? String(row.retailRenew) : "");
    }
    setDraft({
      retailRegister: String(row.retailRegister),
      retailRenew: String(row.retailRenew),
      retailTransfer: String(row.retailTransfer),
      registerYears: reg,
      renewYears: ren,
      enabled: row.enabled,
    });
  }

  function closeEdit() {
    setEditing(null);
    setDraft(null);
  }

  async function refreshSupplier() {
    setRefreshing(true);
    setMessage("Refreshing supplier catalogue and prices from provider…");
    const res = await fetch(
      "/api/orbit/domain-pricing?action=refresh-supplier",
      { method: "POST" },
    );
    const json = (await res.json()) as {
      status?: string;
      tldsUpdated?: number;
      tldsReceived?: number;
      tldsFailed?: number;
      syncedAt?: string;
      error?: string;
    };
    if (!res.ok) {
      setMessage(json.error ?? "Refresh failed.");
    } else {
      setMessage(
        `Supplier sync ${json.status ?? "done"}: ${json.tldsUpdated ?? 0} TLDs updated (${json.tldsReceived ?? 0} received, ${json.tldsFailed ?? 0} failed). Last sync: ${formatSyncTime(json.syncedAt ?? null)}`,
      );
    }
    setRefreshing(false);
    void load();
  }

  async function saveEdit() {
    if (!editing || !draft) return;
    const registerByYear: Record<string, number> = {};
    const renewByYear: Record<string, number> = {};
    for (const key of yearKeys) {
      const rv = draft.registerYears[key];
      if (rv?.trim()) registerByYear[key] = Number(rv);
      const ry = draft.renewYears[key];
      if (ry?.trim()) renewByYear[key] = Number(ry);
    }
    const y1 = registerByYear["1"] ?? Number(draft.retailRegister);
    const r1 = renewByYear["1"] ?? Number(draft.retailRenew);
    await fetch("/api/orbit/domain-pricing", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tld: editing.tld,
        retailRegister: y1,
        retailRenew: r1,
        retailTransfer: Number(draft.retailTransfer),
        retailRegisterByYear: registerByYear,
        retailRenewByYear: renewByYear,
        enabled: draft.enabled,
      }),
    });
    setMessage(`Saved ${editing.tld}`);
    closeEdit();
    void load();
  }

  async function applyBulkRetail() {
    if (bulkSelected.size === 0) return;
    const bulk = [...bulkSelected].map((tld) => ({
      tld,
      ...(bulkRegister.trim() ? { retailRegister: Number(bulkRegister) } : {}),
      ...(bulkRenew.trim() ? { retailRenew: Number(bulkRenew) } : {}),
    }));
    await fetch("/api/orbit/domain-pricing", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bulk }),
    });
    setMessage(`Updated retail pricing for ${bulk.length} TLDs.`);
    setBulkSelected(new Set());
    setBulkRegister("");
    setBulkRenew("");
    void load();
  }

  function toggleBulk(tld: string) {
    setBulkSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tld)) next.delete(tld);
      else next.add(tld);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2f1c6a]">
            Domain pricing
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Supplier costs are provider-sourced (admin only). HostingBeyond
            retail prices are edited here and power customer search.
          </p>
          <p className="mt-2 text-xs font-semibold text-slate-500">
            TLD catalogue: {tldCount} extensions in Orbit
            {supplierSync?.status ? (
              <>
                {" "}
                · Last supplier sync: {formatSyncTime(supplierSync.syncedAt)} (
                {supplierSync.status})
              </>
            ) : null}
          </p>
        </div>
        <button
          type="button"
          disabled={refreshing}
          onClick={() => void refreshSupplier()}
          className="inline-flex items-center gap-2 rounded-xl bg-[#673de6] px-4 py-2 text-sm font-bold text-white disabled:opacity-70"
        >
          {refreshing ? <Loader2 className="size-4 animate-spin" /> : null}
          Refresh supplier prices
        </button>
      </div>

      {message ? (
        <p className="rounded-xl border border-[#c7b8ff] bg-[#f7f4ff] px-4 py-3 text-sm font-semibold text-[#4c1d95]">
          {message}
        </p>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">
          Bulk retail edit
        </p>
        <div className="mt-2 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="font-semibold text-slate-600">Reg. year 1</span>
            <input
              className="mt-1 block w-28 rounded-lg border px-2 py-1"
              value={bulkRegister}
              onChange={(e) => setBulkRegister(e.target.value)}
              placeholder="9.99"
            />
          </label>
          <label className="text-sm">
            <span className="font-semibold text-slate-600">Renew year 1</span>
            <input
              className="mt-1 block w-28 rounded-lg border px-2 py-1"
              value={bulkRenew}
              onChange={(e) => setBulkRenew(e.target.value)}
              placeholder="17.99"
            />
          </label>
          <button
            type="button"
            disabled={bulkSelected.size === 0}
            onClick={() => void applyBulkRetail()}
            className="rounded-lg bg-[#2f1c6a] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            Save {bulkSelected.size} selected
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Select TLDs in the table, set retail values, then save. Supplier
          prices are never changed by bulk edit.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
              <tr>
                <th className="px-3 py-3">Sel.</th>
                <th className="px-3 py-3">TLD</th>
                <th className="px-3 py-3">Supplier reg.</th>
                <th className="px-3 py-3">Supplier renew</th>
                <th className="px-3 py-3">Supplier transfer</th>
                <th className="px-3 py-3">Retail reg.</th>
                <th className="px-3 py-3">Retail renew</th>
                <th className="px-3 py-3">Retail transfer</th>
                <th className="px-3 py-3">Max years</th>
                <th className="px-3 py-3">Sync</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={bulkSelected.has(row.tld)}
                      onChange={() => toggleBulk(row.tld)}
                      aria-label={`Select ${row.tld}`}
                    />
                  </td>
                  <td className="px-3 py-2 font-bold">{row.tld}</td>
                  <td className="px-3 py-2 text-slate-600">
                    {money(row.supplierRegister)}
                  </td>
                  <td className="px-3 py-2 text-slate-600">
                    {money(row.supplierRenew)}
                  </td>
                  <td className="px-3 py-2 text-slate-600">
                    {money(row.supplierTransfer)}
                  </td>
                  <td className="px-3 py-2">{money(row.retailRegister)}</td>
                  <td className="px-3 py-2">{money(row.retailRenew)}</td>
                  <td className="px-3 py-2">{money(row.retailTransfer)}</td>
                  <td className="px-3 py-2 text-slate-600">
                    {row.supplierMaxRegisterYears ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-500">
                    {formatSyncTime(row.supplierSyncedAt)}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold"
                      onClick={() => openEdit(row)}
                    >
                      <Pencil className="size-3" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && draft ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pricing-edit-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <h2
                id="pricing-edit-title"
                className="text-lg font-extrabold text-[#2f1c6a]"
              >
                {editing.tld} pricing
              </h2>
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-lg p-1 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <section className="mt-4 rounded-xl bg-slate-50 p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase">
                Supplier (read-only)
              </h3>
              <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-slate-500">Registration</dt>
                  <dd className="font-semibold">
                    {money(editing.supplierRegister)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Renewal</dt>
                  <dd className="font-semibold">
                    {money(editing.supplierRenew)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Transfer</dt>
                  <dd className="font-semibold">
                    {money(editing.supplierTransfer)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Max registration years</dt>
                  <dd className="font-semibold">
                    {editing.supplierMaxRegisterYears ?? "Unknown"}
                  </dd>
                </div>
              </dl>
            </section>
            <section className="mt-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase">
                HostingBeyond retail
              </h3>
              <div className="mt-2 space-y-3">
                {yearKeys.map((key) => (
                  <div key={key} className="grid grid-cols-2 gap-3">
                    <label className="text-sm">
                      <span className="font-semibold text-slate-600">
                        Registration {key} yr
                      </span>
                      <input
                        className="mt-1 w-full rounded-lg border px-2 py-1"
                        value={draft.registerYears[key] ?? ""}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            registerYears: {
                              ...draft.registerYears,
                              [key]: e.target.value,
                            },
                          })
                        }
                      />
                    </label>
                    <label className="text-sm">
                      <span className="font-semibold text-slate-600">
                        Renewal {key} yr
                      </span>
                      <input
                        className="mt-1 w-full rounded-lg border px-2 py-1"
                        value={draft.renewYears[key] ?? ""}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            renewYears: {
                              ...draft.renewYears,
                              [key]: e.target.value,
                            },
                          })
                        }
                      />
                    </label>
                  </div>
                ))}
                <label className="block text-sm">
                  <span className="font-semibold text-slate-600">Transfer</span>
                  <input
                    className="mt-1 w-full rounded-lg border px-2 py-1"
                    value={draft.retailTransfer}
                    onChange={(e) =>
                      setDraft({ ...draft, retailTransfer: e.target.value })
                    }
                  />
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={draft.enabled}
                    onChange={(e) =>
                      setDraft({ ...draft, enabled: e.target.checked })
                    }
                  />
                  Enabled for customer search
                </label>
              </div>
            </section>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-xl border px-4 py-2 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveEdit()}
                className="rounded-xl bg-[#673de6] px-4 py-2 text-sm font-bold text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
