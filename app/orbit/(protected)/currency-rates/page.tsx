"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";

import { usdToLocalRate, type CurrencyCode } from "@/config/pricing";
import { readResponseError } from "@/lib/orbit/read-response-error";

type RatesPayload = {
  defaults: Record<CurrencyCode, number>;
  overrides: Partial<Record<CurrencyCode, number>>;
};

const CURRENCY_CODES = Object.keys(usdToLocalRate) as CurrencyCode[];

function effectiveRate(
  code: CurrencyCode,
  overrides: Partial<Record<CurrencyCode, number>>,
  defaults: Record<CurrencyCode, number>,
): number {
  const o = overrides[code];
  if (o != null && Number.isFinite(o) && o > 0) return o;
  return defaults[code] ?? 1;
}

export default function OrbitCurrencyRatesPage() {
  const [data, setData] = useState<RatesPayload | null>(null);
  const [draft, setDraft] = useState<Partial<Record<CurrencyCode, string>>>({});
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/orbit/currency-rates");
      const json = (await res.json()) as RatesPayload;
      if (res.ok) {
        setData(json);
        const initial: Partial<Record<CurrencyCode, string>> = {};
        for (const code of CURRENCY_CODES) {
          const v = json.overrides[code];
          if (v != null) initial[code] = String(v);
        }
        setDraft(initial);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CURRENCY_CODES;
    return CURRENCY_CODES.filter((code) => code.toLowerCase().includes(q));
  }, [query]);

  async function save() {
    if (!data) return;
    setBusy(true);
    setStatus("");
    const overrides: Partial<Record<CurrencyCode, number>> = {};
    for (const code of CURRENCY_CODES) {
      const raw = draft[code]?.trim();
      if (!raw) continue;
      const n = Number(raw);
      if (!Number.isFinite(n) || n <= 0) continue;
      overrides[code] = n;
    }
    const res = await fetch("/api/orbit/currency-rates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ overrides }),
    });
    setBusy(false);
    if (!res.ok) {
      const parsed = await readResponseError(res, "Save failed");
      setStatus(parsed.text);
      return;
    }
    const json = (await res.json()) as {
      overrides?: RatesPayload["overrides"];
    };
    setData({ ...data, overrides: json.overrides ?? overrides });
    setStatus("Rates saved — public catalog prices update immediately");
  }

  async function refreshMarket() {
    setBusy(true);
    setStatus("");
    const res = await fetch("/api/orbit/currency-rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "refresh-market" }),
    });
    setBusy(false);
    if (!res.ok) {
      const parsed = await readResponseError(res, "Refresh failed");
      setStatus(parsed.text);
      return;
    }
    const json = (await res.json()) as {
      overrides?: Partial<Record<CurrencyCode, number>>;
      refreshedAt?: string;
    };
    const overrides = json.overrides ?? {};
    setData((prev) =>
      prev ? { ...prev, overrides } : { defaults: usdToLocalRate, overrides },
    );
    const nextDraft: Partial<Record<CurrencyCode, string>> = {};
    for (const code of CURRENCY_CODES) {
      const v = overrides[code];
      if (v != null) nextDraft[code] = String(v);
    }
    setDraft(nextDraft);
    setStatus(
      json.refreshedAt
        ? `Live market rates loaded (${new Date(json.refreshedAt).toLocaleString()}) — INR/NPR pins kept`
        : "Live market rates loaded",
    );
  }

  if (!data) {
    return <p className="text-sm text-slate-500">Loading currency book…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Currency &amp; FX</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Set how many units of each currency equal <strong>1 USD</strong> on
            the public site (domains, hosting cards, mega menus). Checkout and
            wallet stay USD. Nepal visitors (NPR) and India (INR) use these
            rates when their country is selected.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void refreshMarket()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className="size-4" aria-hidden />
            Load live market rates
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void save()}
            className="rounded-xl bg-gradient-to-r from-[var(--hb-blue)] to-[var(--hb-purple)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Save overrides
          </button>
        </div>
      </div>

      {status ? <p className="text-sm text-emerald-700">{status}</p> : null}

      <label className="relative block max-w-md">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter currency code…"
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pr-3 pl-10 text-sm"
        />
      </label>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="max-h-[min(70vh,720px)] overflow-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 text-xs font-bold tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">Currency</th>
                <th className="px-4 py-3">Built-in default</th>
                <th className="px-4 py-3">Live override (per 1 USD)</th>
                <th className="px-4 py-3">Effective on site</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((code) => {
                const def = data.defaults[code];
                const eff = effectiveRate(code, data.overrides, data.defaults);
                const hasOverride = data.overrides[code] != null;
                return (
                  <tr
                    key={code}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-4 py-2.5 font-bold text-slate-900">
                      {code}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 tabular-nums">
                      {def}
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="number"
                        step="any"
                        min={0}
                        placeholder={String(def)}
                        value={draft[code] ?? ""}
                        onChange={(e) =>
                          setDraft({ ...draft, [code]: e.target.value })
                        }
                        className="w-full max-w-[140px] rounded-lg border border-slate-200 px-2.5 py-1.5 tabular-nums"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-slate-800 tabular-nums">
                      {eff}
                      {hasOverride ? (
                        <span className="ml-2 text-[11px] font-medium text-indigo-600">
                          custom
                        </span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
