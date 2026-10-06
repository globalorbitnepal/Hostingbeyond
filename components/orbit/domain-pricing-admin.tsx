"use client";

import { useEffect, useState } from "react";

type TldRow = {
  id: string;
  tld: string;
  supplierRegister: string | null;
  supplierRenew: string | null;
  supplierTransfer: string | null;
  retailRegister: string;
  retailRenew: string;
  retailTransfer: string;
  enabled: boolean;
};

export function OrbitDomainPricingAdmin() {
  const [rows, setRows] = useState<TldRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/orbit/domain-pricing");
    const json = (await res.json()) as { rows?: TldRow[] };
    setRows(json.rows ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function refreshSupplier() {
    setMessage("Refreshing supplier prices…");
    const res = await fetch(
      "/api/orbit/domain-pricing?action=refresh-supplier",
      {
        method: "POST",
      },
    );
    const json = (await res.json()) as { updated?: number; error?: string };
    setMessage(
      json.updated != null
        ? `Updated ${json.updated} TLD supplier prices.`
        : (json.error ?? "Refresh failed."),
    );
    void load();
  }

  async function saveRow(row: TldRow) {
    await fetch("/api/orbit/domain-pricing", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tld: row.tld,
        retailRegister: Number(row.retailRegister),
        retailRenew: Number(row.retailRenew),
        retailTransfer: Number(row.retailTransfer),
        enabled: row.enabled,
      }),
    });
    setMessage(`Saved ${row.tld}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2f1c6a]">
            Domain pricing
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            HostingBeyond retail prices (customer-facing). Supplier costs are
            admin-only.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refreshSupplier()}
          className="rounded-xl bg-[#673de6] px-4 py-2 text-sm font-bold text-white"
        >
          Refresh supplier prices
        </button>
      </div>
      {message ? (
        <p className="rounded-xl border border-[#c7b8ff] bg-[#f7f4ff] px-4 py-3 text-sm font-semibold text-[#4c1d95]">
          {message}
        </p>
      ) : null}
      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs font-bold text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">TLD</th>
                <th className="px-4 py-3">Supplier reg.</th>
                <th className="px-4 py-3">Retail reg.</th>
                <th className="px-4 py-3">Retail renew</th>
                <th className="px-4 py-3">Retail transfer</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-bold">{row.tld}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {row.supplierRegister ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className="w-24 rounded-lg border px-2 py-1"
                      value={row.retailRegister}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((r) =>
                            r.id === row.id
                              ? { ...r, retailRegister: e.target.value }
                              : r,
                          ),
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className="w-24 rounded-lg border px-2 py-1"
                      value={row.retailRenew}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((r) =>
                            r.id === row.id
                              ? { ...r, retailRenew: e.target.value }
                              : r,
                          ),
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className="w-24 rounded-lg border px-2 py-1"
                      value={row.retailTransfer}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((r) =>
                            r.id === row.id
                              ? { ...r, retailTransfer: e.target.value }
                              : r,
                          ),
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="rounded-lg border px-3 py-1 font-semibold"
                      onClick={() => void saveRow(row)}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
