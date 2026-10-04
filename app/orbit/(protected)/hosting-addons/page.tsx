"use client";

import { useEffect, useState } from "react";

type AddonRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  type: string;
  active: boolean;
  displayOrder: number;
  billingMode: string;
  pricingReference: string;
  eligibility: unknown;
};

export default function OrbitHostingAddonsPage() {
  const [rows, setRows] = useState<AddonRow[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void fetch("/api/orbit/hosting-addons")
      .then((r) => r.json())
      .then((j: { addons?: AddonRow[] }) => setRows(j.addons ?? []))
      .catch(() => setMessage("Could not load add-ons."));
  }, []);

  async function toggleActive(row: AddonRow) {
    setMessage("Saving…");
    const res = await fetch("/api/orbit/hosting-addons", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: row.id, active: !row.active }),
    });
    if (!res.ok) {
      setMessage("Save failed.");
      return;
    }
    const json = (await res.json()) as { addon?: AddonRow };
    if (json.addon) {
      setRows((prev) =>
        prev.map((r) => (r.id === json.addon!.id ? json.addon! : r)),
      );
    }
    setMessage("Saved");
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Hosting add-ons</h1>
        <p className="mt-1 text-sm text-slate-600">
          Activate or deactivate checkout add-ons. Pricing is resolved from each
          add-on&apos;s pricing reference (e.g. CMS Business Email plans). Do
          not delete rows referenced by orders — use inactive status.
        </p>
      </div>
      {message ? (
        <p className="text-sm text-slate-500" role="status">
          {message}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Billing</th>
              <th className="px-4 py-3">Price ref</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {row.name}
                  <p className="text-xs font-normal text-slate-500">
                    {row.slug}
                  </p>
                </td>
                <td className="px-4 py-3">{row.type}</td>
                <td className="px-4 py-3">{row.billingMode}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {row.pricingReference}
                </td>
                <td className="px-4 py-3">{row.displayOrder}</td>
                <td className="px-4 py-3">{row.active ? "Yes" : "No"}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                    onClick={() => void toggleActive(row)}
                  >
                    {row.active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
