"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Search, X } from "lucide-react";

import {
  PROPOSED_MARGIN_TARGETS,
  grossMarginPercent,
  recommendRetailPrice,
} from "@/lib/domains/pricing-margin-policy";

type TldRow = {
  id: string;
  tld: string;
  supplierRegister: number | null;
  supplierRenew: number | null;
  supplierTransfer: number | null;
  supplierSyncedAt: string | null;
  supplierMaxRegisterYears: number | null;
  namesiloRegister: number | null;
  namesiloRenew: number | null;
  namesiloTransfer: number | null;
  namesiloSyncedAt: string | null;
  namesiloPriceStatus: string | null;
  lifecycleProvider: string | null;
  retailPriceLocked: boolean;
  retailRegister: number;
  retailRenew: number;
  retailTransfer: number;
  retailRegisterByYear: Record<string, number> | null;
  retailRenewByYear: Record<string, number> | null;
  enabled: boolean;
  supplierCurrency?: string;
  retailCurrency?: string;
  metrics?: {
    register: OperationGrossMetrics;
    renew: OperationGrossMetrics;
    transfer: OperationGrossMetrics;
    currencyNote: string;
  };
};

type OperationGrossMetrics = {
  grossProfitUsd: number | null;
  grossMarginPercent: number | null;
  markupPercent: number | null;
  belowSupplierCost: boolean;
  supplierCostUsd: number | null;
  retailPriceUsd: number;
  supplierKind: string;
  basis: string;
  incomplete: boolean;
};

function formatGrossSummary(m: OperationGrossMetrics | undefined): string {
  if (!m || m.incomplete) return "N/A";
  const parts = [
    m.grossProfitUsd != null ? `$${m.grossProfitUsd.toFixed(2)} gross` : null,
    m.grossMarginPercent != null
      ? `${m.grossMarginPercent.toFixed(1)}% margin`
      : null,
    m.markupPercent != null ? `${m.markupPercent.toFixed(1)}% markup` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "N/A";
}

type SupplierSyncMeta = {
  status: string | null;
  syncedAt: string | null;
  tldsReceived: number | null;
  tldsUpdated: number | null;
  tldsFailed: number | null;
};

type NameSiloSyncMeta = {
  status: "SUCCESS" | "FAILED" | null;
  syncedAt: string | null;
  apiTldCount: number | null;
  tldsUpdated: number | null;
  tldsMissingOnApi: number | null;
  error: string | null;
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
  const [namesiloSync, setNamesiloSync] = useState<NameSiloSyncMeta | null>(
    null,
  );
  const [tldCount, setTldCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [namesiloRefreshing, setNamesiloRefreshing] = useState(false);
  const [editing, setEditing] = useState<TldRow | null>(null);
  const [draft, setDraft] = useState<{
    retailRegister: string;
    retailRenew: string;
    retailTransfer: string;
    registerYears: Record<string, string>;
    renewYears: Record<string, string>;
    enabled: boolean;
    retailPriceLocked: boolean;
    lifecycleProvider: string;
  } | null>(null);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [bulkRegister, setBulkRegister] = useState("");
  const [bulkRenew, setBulkRenew] = useState("");
  const [bulkPreviewOpen, setBulkPreviewOpen] = useState(false);
  const [bulkPreviewLoading, setBulkPreviewLoading] = useState(false);
  const [bulkPreviewLines, setBulkPreviewLines] = useState<
    Array<{
      tld: string;
      rowUpdatedAt: string;
      retailPriceLocked: boolean;
      skipped: boolean;
      skipReason?: string;
      current: { register: number; renew: number; transfer: number };
      proposed: { register?: number; renew?: number; transfer?: number };
      supplier: {
        register: { amount: number | null; kind: string };
      };
      analysis: {
        register?: {
          grossProfit: number | null;
          grossMarginPercent: number | null;
          belowSupplierCost: boolean;
          belowMarginTarget: boolean;
        };
      };
      warnings: string[];
    }>
  >([]);
  const [tldQuery, setTldQuery] = useState("");
  const [supplierFilter, setSupplierFilter] = useState<
    | "all"
    | "synced"
    | "never"
    | "noReg"
    | "noRenew"
    | "noTransfer"
    | "nsMissing"
    | "nsUnverified"
    | "lowMargin"
  >("all");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/orbit/domain-pricing", { cache: "no-store" });
    const json = (await res.json()) as {
      rows?: TldRow[];
      supplierSync?: SupplierSyncMeta;
      namesiloSync?: NameSiloSyncMeta;
      tldCount?: number;
    };
    setRows(json.rows ?? []);
    setSupplierSync(json.supplierSync ?? null);
    setNamesiloSync(json.namesiloSync ?? null);
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

  const filteredRows = useMemo(() => {
    const q = tldQuery.trim().toLowerCase().replace(/^\./, "");
    return rows.filter((row) => {
      const bare = row.tld.toLowerCase().replace(/^\./, "");
      if (q && !bare.includes(q) && !row.tld.toLowerCase().includes(q)) {
        return false;
      }
      if (supplierFilter === "synced" && !row.supplierSyncedAt) return false;
      if (supplierFilter === "never" && row.supplierSyncedAt) return false;
      if (supplierFilter === "noReg" && row.supplierRegister != null) {
        return false;
      }
      if (supplierFilter === "noRenew" && row.supplierRenew != null) {
        return false;
      }
      if (supplierFilter === "noTransfer" && row.supplierTransfer != null) {
        return false;
      }
      if (
        supplierFilter === "nsMissing" &&
        row.namesiloPriceStatus !== "missing"
      ) {
        return false;
      }
      if (
        supplierFilter === "nsUnverified" &&
        row.namesiloPriceStatus !== "unverified" &&
        row.namesiloPriceStatus !== "missing"
      ) {
        return false;
      }
      if (supplierFilter === "lowMargin") {
        const m = row.metrics?.register;
        if (!m || m.incomplete) return false;
        if (m.belowSupplierCost) return true;
        return m.grossMarginPercent != null && m.grossMarginPercent < 10;
      }
      return true;
    });
  }, [rows, tldQuery, supplierFilter]);

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
      retailPriceLocked: row.retailPriceLocked,
      lifecycleProvider: row.lifecycleProvider ?? "",
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

  async function previewNameSiloSync() {
    setNamesiloRefreshing(true);
    setMessage("Fetching NameSilo account prices (preview only)…");
    const res = await fetch(
      "/api/orbit/domain-pricing/namesilo?action=preview-sync",
    );
    const json = (await res.json()) as {
      error?: string;
      apiTldCount?: number;
      fetchedAt?: string;
      rows?: Array<{ tld: string; retailWarnings: string[] }>;
    };
    if (!res.ok) {
      setMessage(json.error ?? "NameSilo preview failed.");
    } else {
      const warned =
        json.rows?.filter((r) => r.retailWarnings.length > 0).length ?? 0;
      setMessage(
        `NameSilo preview: ${json.apiTldCount ?? 0} API TLDs @ ${formatSyncTime(json.fetchedAt ?? null)}. ${warned} catalogue rows have retail below NameSilo cost. Apply sync only updates NameSilo supplier columns — not retail.`,
      );
    }
    setNamesiloRefreshing(false);
    void load();
  }

  async function applyNameSiloSync() {
    if (
      !window.confirm(
        "Apply NameSilo supplier costs to Orbit? Retail prices are not changed unless you edit them separately.",
      )
    ) {
      return;
    }
    setNamesiloRefreshing(true);
    const res = await fetch(
      "/api/orbit/domain-pricing/namesilo?action=apply-supplier-sync",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      },
    );
    const json = (await res.json()) as {
      error?: string;
      tldsUpdated?: number;
      tldsUnchanged?: number;
      tldsMissingOnApi?: number;
      tldsVerified?: number;
      tldsPartial?: number;
      tldsInvalidOnApi?: number;
      apiTldCount?: number;
      syncedAt?: string;
    };
    setMessage(
      res.ok
        ? `NameSilo sync OK @ ${formatSyncTime(json.syncedAt ?? null)}: API ${json.apiTldCount ?? "?"} TLDs · updated ${json.tldsUpdated ?? 0} · unchanged ${json.tldsUnchanged ?? 0} · verified ${json.tldsVerified ?? 0} · partial ${json.tldsPartial ?? 0} · missing on API ${json.tldsMissingOnApi ?? 0} · invalid fields ${json.tldsInvalidOnApi ?? 0}. Retail unchanged.`
        : (json.error ?? "NameSilo sync failed."),
    );
    setNamesiloRefreshing(false);
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
        retailPriceLocked: draft.retailPriceLocked,
        lifecycleProvider: draft.lifecycleProvider.trim()
          ? draft.lifecycleProvider.trim()
          : null,
      }),
    });
    setMessage(`Saved ${editing.tld}`);
    closeEdit();
    void load();
  }

  function buildBulkItems() {
    return [...bulkSelected].map((tld) => ({
      tld,
      ...(bulkRegister.trim() ? { retailRegister: Number(bulkRegister) } : {}),
      ...(bulkRenew.trim() ? { retailRenew: Number(bulkRenew) } : {}),
    }));
  }

  async function previewBulkRetail() {
    if (bulkSelected.size === 0) return;
    const items = buildBulkItems();
    if (items.every((i) => !("retailRegister" in i) && !("retailRenew" in i))) {
      setMessage("Set at least one retail field to preview.");
      return;
    }
    setBulkPreviewLoading(true);
    const res = await fetch(
      "/api/orbit/domain-pricing/bulk-retail?action=preview",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items }),
      },
    );
    const json = (await res.json()) as {
      error?: string;
      preview?: typeof bulkPreviewLines;
    };
    setBulkPreviewLoading(false);
    if (!res.ok) {
      setMessage(json.error ?? "Bulk preview failed.");
      return;
    }
    setBulkPreviewLines(json.preview ?? []);
    setBulkPreviewOpen(true);
  }

  async function applyBulkRetailConfirmed() {
    const items = bulkPreviewLines
      .filter((line) => !line.skipped)
      .map((line) => ({
        tld: line.tld,
        rowUpdatedAt: line.rowUpdatedAt,
        ...(line.proposed.register !== undefined
          ? { retailRegister: line.proposed.register }
          : {}),
        ...(line.proposed.renew !== undefined
          ? { retailRenew: line.proposed.renew }
          : {}),
        ...(line.proposed.transfer !== undefined
          ? { retailTransfer: line.proposed.transfer }
          : {}),
      }));
    if (items.length === 0) {
      setMessage("No rows to apply (all skipped or locked).");
      setBulkPreviewOpen(false);
      return;
    }
    if (
      !window.confirm(
        `Apply retail changes to ${items.length} TLD(s)? This cannot use a stale preview.`,
      )
    ) {
      return;
    }
    const res = await fetch(
      "/api/orbit/domain-pricing/bulk-retail?action=apply",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirm: true, items }),
      },
    );
    const json = (await res.json()) as { error?: string; updated?: string[] };
    setBulkPreviewOpen(false);
    if (!res.ok) {
      setMessage(json.error ?? "Bulk apply failed.");
      return;
    }
    setMessage(`Updated retail pricing for ${json.updated?.length ?? 0} TLDs.`);
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

  function proposedSlot(cost: number | null, targetPercent: number) {
    if (cost == null || !Number.isFinite(cost)) return null;
    const rec = recommendRetailPrice(cost, targetPercent);
    return rec.ok ? rec : null;
  }

  function exportPricingCsv() {
    const header = [
      "tld",
      "retail_register",
      "retail_renew",
      "retail_transfer",
      "dna_register",
      "dna_renew",
      "dna_transfer",
      "namesilo_register",
      "namesilo_renew",
      "namesilo_transfer",
      "namesilo_status",
      "namesilo_synced_at",
      "proposed_register",
      "proposed_renew",
      "proposed_transfer",
      "margin_register_pct",
      "margin_renew_pct",
      "margin_transfer_pct",
      "retail_locked",
      "lifecycle_provider",
    ];
    const lines = [header.join(",")];
    for (const row of rows) {
      const pReg = proposedSlot(
        row.namesiloRegister,
        PROPOSED_MARGIN_TARGETS.registrationGrossPercent,
      );
      const pRen = proposedSlot(
        row.namesiloRenew,
        PROPOSED_MARGIN_TARGETS.renewalGrossPercent,
      );
      const pTr = proposedSlot(
        row.namesiloTransfer,
        PROPOSED_MARGIN_TARGETS.transferGrossPercent,
      );
      const costReg = row.namesiloRegister ?? row.supplierRegister;
      const costRen = row.namesiloRenew ?? row.supplierRenew;
      const costTr = row.namesiloTransfer ?? row.supplierTransfer;
      const mReg =
        costReg != null
          ? grossMarginPercent(row.retailRegister, costReg)
          : null;
      const mRen =
        costRen != null ? grossMarginPercent(row.retailRenew, costRen) : null;
      const mTr =
        costTr != null ? grossMarginPercent(row.retailTransfer, costTr) : null;
      lines.push(
        [
          row.tld,
          row.retailRegister,
          row.retailRenew,
          row.retailTransfer,
          row.supplierRegister ?? "",
          row.supplierRenew ?? "",
          row.supplierTransfer ?? "",
          row.namesiloRegister ?? "",
          row.namesiloRenew ?? "",
          row.namesiloTransfer ?? "",
          row.namesiloPriceStatus ?? "",
          row.namesiloSyncedAt ?? "",
          pReg?.recommended ?? "",
          pRen?.recommended ?? "",
          pTr?.recommended ?? "",
          mReg != null ? mReg.toFixed(2) : "",
          mRen != null ? mRen.toFixed(2) : "",
          mTr != null ? mTr.toFixed(2) : "",
          row.retailPriceLocked ? "yes" : "no",
          row.lifecycleProvider ?? "",
        ].join(","),
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `namesilo-pricing-worklist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage(
      `Exported ${rows.length} TLD rows to CSV (retail + supplier + proposed).`,
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2f1c6a]">
            Domain pricing
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Supplier registration, renewal, and transfer costs (DNA catalogue
            and NameSilo account costs) are shown separately from customer
            retail prices. Estimated gross profit uses USD catalogue fields only
            — not net profit; taxes and payment fees are excluded.
          </p>
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950">
            NameSilo supplier synchronization updates supplier costs only.
            Customer retail prices require separate review and approval.
          </p>
          <p className="mt-2 text-xs font-semibold text-slate-500">
            TLD catalogue: {tldCount} extensions in Orbit
            {supplierSync?.status ? (
              <>
                {" "}
                · DNA supplier: {formatSyncTime(supplierSync.syncedAt)} (
                {supplierSync.status})
              </>
            ) : null}
            {namesiloSync?.status ? (
              <>
                {" "}
                · NameSilo: {formatSyncTime(namesiloSync.syncedAt)} (
                {namesiloSync.status}
                {namesiloSync.error ? ` — ${namesiloSync.error}` : ""})
              </>
            ) : (
              <> · NameSilo: never synced in this environment</>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={refreshing}
            onClick={() => void refreshSupplier()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#673de6] px-4 py-2 text-sm font-bold text-white disabled:opacity-70"
          >
            {refreshing ? <Loader2 className="size-4 animate-spin" /> : null}
            Refresh DNA supplier
          </button>
          <button
            type="button"
            disabled={namesiloRefreshing}
            onClick={() => void previewNameSiloSync()}
            className="inline-flex items-center gap-2 rounded-xl border border-[#673de6] bg-white px-4 py-2 text-sm font-bold text-[#673de6] disabled:opacity-70"
          >
            {namesiloRefreshing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Preview NameSilo costs
          </button>
          <button
            type="button"
            disabled={namesiloRefreshing}
            onClick={() => void applyNameSiloSync()}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-70"
          >
            Apply NameSilo supplier sync
          </button>
          <button
            type="button"
            disabled={loading || rows.length === 0}
            onClick={() => exportPricingCsv()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-70"
          >
            Export worklist CSV
          </button>
        </div>
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
            disabled={bulkSelected.size === 0 || bulkPreviewLoading}
            onClick={() => void previewBulkRetail()}
            className="rounded-lg bg-[#2f1c6a] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            Preview {bulkSelected.size} selected
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Select TLDs, set retail values, preview margins and warnings, then
          confirm apply. Supplier prices are never changed by bulk edit.
        </p>
      </div>

      {bulkPreviewOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-extrabold text-[#2f1c6a]">
              Bulk retail preview
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Review supplier cost, margin, and locks before applying.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="py-2 pr-2">TLD</th>
                    <th className="py-2 pr-2">Current reg</th>
                    <th className="py-2 pr-2">Proposed reg</th>
                    <th className="py-2 pr-2">Supplier</th>
                    <th className="py-2 pr-2">Margin %</th>
                    <th className="py-2 pr-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkPreviewLines.map((line) => (
                    <tr key={line.tld} className="border-b">
                      <td className="py-2 font-bold">{line.tld}</td>
                      <td>{money(line.current.register)}</td>
                      <td>
                        {line.proposed.register != null
                          ? money(line.proposed.register)
                          : "—"}
                      </td>
                      <td>
                        {line.supplier.register.kind}:{" "}
                        {money(line.supplier.register.amount)}
                      </td>
                      <td>
                        {line.analysis.register?.grossMarginPercent != null
                          ? `${line.analysis.register.grossMarginPercent.toFixed(1)}%`
                          : "—"}
                      </td>
                      <td>
                        {line.skipped
                          ? (line.skipReason ?? "skipped")
                          : line.warnings.length
                            ? line.warnings.join(", ")
                            : "ok"}
                        {line.retailPriceLocked ? " · locked" : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border px-4 py-2 text-sm font-bold"
                onClick={() => setBulkPreviewOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl bg-[#673de6] px-4 py-2 text-sm font-bold text-white"
                onClick={() => void applyBulkRetailConfirmed()}
              >
                Confirm apply
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="min-w-[12rem] flex-1 text-sm">
              <span className="font-semibold text-slate-600">Search TLD</span>
              <div className="relative mt-1">
                <Search
                  className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  type="search"
                  value={tldQuery}
                  onChange={(e) => setTldQuery(e.target.value)}
                  placeholder=".com, ai, in…"
                  className="w-full rounded-lg border border-slate-200 py-2 pr-8 pl-9 text-sm"
                  autoComplete="off"
                />
                {tldQuery ? (
                  <button
                    type="button"
                    onClick={() => setTldQuery("")}
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
                    aria-label="Clear TLD search"
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
              </div>
            </label>
            <label className="text-sm">
              <span className="font-semibold text-slate-600">
                Supplier filter
              </span>
              <select
                className="mt-1 block min-w-[11rem] rounded-lg border border-slate-200 px-2 py-2 text-sm"
                value={supplierFilter}
                onChange={(e) =>
                  setSupplierFilter(e.target.value as typeof supplierFilter)
                }
              >
                <option value="all">All TLDs</option>
                <option value="synced">Synced</option>
                <option value="never">Never synced</option>
                <option value="noReg">Missing supplier reg.</option>
                <option value="noRenew">Missing supplier renew</option>
                <option value="noTransfer">Missing supplier transfer</option>
                <option value="nsMissing">NameSilo price missing</option>
                <option value="nsUnverified">NameSilo unverified</option>
                <option value="lowMargin">
                  Low reg. margin (&lt;10% or below cost)
                </option>
              </select>
            </label>
            <p className="text-xs font-semibold text-slate-500 sm:ml-auto">
              Showing {filteredRows.length} of {rows.length}
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="px-3 py-3">Sel.</th>
                  <th className="px-3 py-3">TLD</th>
                  <th className="px-3 py-3">DNA supplier reg. cost</th>
                  <th className="px-3 py-3">NameSilo supplier reg. cost</th>
                  <th className="px-3 py-3">NameSilo cost status</th>
                  <th className="px-3 py-3">Reg. gross profit</th>
                  <th className="px-3 py-3">Reg. gross margin</th>
                  <th className="px-3 py-3">Lifecycle / lock</th>
                  <th className="px-3 py-3">Retail reg. price</th>
                  <th className="px-3 py-3">Retail renew price</th>
                  <th className="px-3 py-3">Retail transfer price</th>
                  <th className="px-3 py-3">Max years</th>
                  <th className="px-3 py-3">DNA sync</th>
                  <th className="px-3 py-3">NS sync</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
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
                      {money(row.namesiloRegister)}
                    </td>
                    <td className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                      {row.namesiloPriceStatus ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">
                      {row.metrics?.register.incomplete
                        ? "—"
                        : money(row.metrics?.register.grossProfitUsd ?? null)}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">
                      {row.metrics?.register.incomplete
                        ? "—"
                        : row.metrics?.register.belowSupplierCost
                          ? `${row.metrics.register.grossMarginPercent?.toFixed(0) ?? "?"}% ⚠`
                          : `${row.metrics?.register.grossMarginPercent?.toFixed(0) ?? "—"}%`}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">
                      {row.lifecycleProvider ?? "dna-default"}
                      {row.retailPriceLocked ? " · locked" : ""}
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
                    <td className="px-3 py-2 text-xs text-slate-500">
                      {formatSyncTime(row.namesiloSyncedAt)}
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
                Supplier costs (read-only, USD)
              </h3>
              <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-slate-500">
                    DNA supplier registration cost
                  </dt>
                  <dd className="font-semibold">
                    {money(editing.supplierRegister)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">DNA supplier renewal cost</dt>
                  <dd className="font-semibold">
                    {money(editing.supplierRenew)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">DNA supplier transfer cost</dt>
                  <dd className="font-semibold">
                    {money(editing.supplierTransfer)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">NameSilo reg.</dt>
                  <dd className="font-semibold">
                    {money(editing.namesiloRegister)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">NameSilo renew</dt>
                  <dd className="font-semibold">
                    {money(editing.namesiloRenew)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">NameSilo transfer</dt>
                  <dd className="font-semibold">
                    {money(editing.namesiloTransfer)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">NS last sync</dt>
                  <dd className="text-xs font-semibold">
                    {formatSyncTime(editing.namesiloSyncedAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">NameSilo status</dt>
                  <dd className="text-xs font-semibold uppercase">
                    {editing.namesiloPriceStatus ?? "—"}
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
            <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase">
                Estimated gross profit (current retail vs authoritative supplier
                cost)
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {editing.metrics?.currencyNote ??
                  "USD catalogue fields; excludes taxes and payment fees."}
              </p>
              <dl className="mt-2 space-y-2 text-xs">
                {(
                  [
                    ["Registration", editing.metrics?.register],
                    ["Renewal", editing.metrics?.renew],
                    ["Transfer", editing.metrics?.transfer],
                  ] as const
                ).map(([label, m]) => (
                  <div key={label}>
                    <dt className="font-semibold text-slate-600">{label}</dt>
                    <dd className="text-slate-700">{formatGrossSummary(m)}</dd>
                    {m && !m.incomplete ? (
                      <dd className="text-[10px] text-slate-500">{m.basis}</dd>
                    ) : null}
                  </div>
                ))}
              </dl>
            </section>
            <section className="mt-4 rounded-xl border border-[#e8e0ff] bg-[#faf8ff] p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase">
                Proposed retail (15% / 15% / 10% — not applied automatically)
              </h3>
              <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
                {(["register", "renew", "transfer"] as const).map((op) => {
                  const cost =
                    op === "register"
                      ? editing.namesiloRegister
                      : op === "renew"
                        ? editing.namesiloRenew
                        : editing.namesiloTransfer;
                  const target =
                    op === "transfer"
                      ? PROPOSED_MARGIN_TARGETS.transferGrossPercent
                      : op === "renew"
                        ? PROPOSED_MARGIN_TARGETS.renewalGrossPercent
                        : PROPOSED_MARGIN_TARGETS.registrationGrossPercent;
                  const slot = proposedSlot(cost, target);
                  return (
                    <div key={op}>
                      <dt className="text-slate-500 capitalize">{op}</dt>
                      <dd className="font-semibold">
                        {slot ? money(slot.recommended) : "N/A"}
                        {slot
                          ? ` (${slot.grossMarginPercent.toFixed(1)}%)`
                          : ""}
                      </dd>
                    </div>
                  );
                })}
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
                <label className="block text-sm">
                  <span className="font-semibold text-slate-600">
                    Lifecycle provider (new reg.)
                  </span>
                  <select
                    className="mt-1 w-full rounded-lg border px-2 py-1"
                    value={draft.lifecycleProvider}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        lifecycleProvider: e.target.value,
                      })
                    }
                  >
                    <option value="">DNA default (legacy)</option>
                    <option value="namesilo">NameSilo (after approval)</option>
                    <option value="domain-name-api">DNA explicit</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={draft.retailPriceLocked}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        retailPriceLocked: e.target.checked,
                      })
                    }
                  />
                  Lock retail prices during supplier sync
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
