"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { readResponseError } from "@/lib/orbit/read-response-error";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  status: string;
  canonicalPath: string;
  planCount: number;
  startingPrice: string;
  updatedAt: string;
};

export default function OrbitHostingProductsPage() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [status, setStatus] = useState("Loading…");

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/orbit/hosting-products");
        if (!res.ok) {
          const parsed = await readResponseError(res, "Load failed");
          throw new Error(parsed.text);
        }
        const json = (await res.json()) as { products?: ProductRow[] };
        setRows(json.products ?? []);
        setStatus("");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Load failed");
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Hosting Products</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage catalog products, pricing, and visibility. Legacy per-page
          editors remain under Web Hosting / Cloud for rich hero copy.
        </p>
        {status ? (
          <p className="mt-2 text-sm text-slate-600">{status}</p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[12px] font-bold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Plans</th>
              <th className="px-4 py-3">Starting price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">{row.name}</div>
                  <div className="text-[12px] text-slate-500">{row.slug}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{row.category}</td>
                <td className="px-4 py-3">{row.planCount}</td>
                <td className="px-4 py-3 font-medium">{row.startingPrice}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      row.status === "ACTIVE"
                        ? "rounded-full bg-emerald-50 px-2 py-0.5 text-[12px] font-semibold text-emerald-700"
                        : "rounded-full bg-slate-100 px-2 py-0.5 text-[12px] font-semibold text-slate-600"
                    }
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[12px] text-slate-500">
                  {new Date(row.updatedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/orbit/hosting-products/${row.id}`}
                      className="rounded-lg bg-violet-600 px-3 py-1.5 text-[12px] font-semibold text-white"
                    >
                      Edit
                    </Link>
                    <a
                      href={row.canonicalPath}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-slate-700"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
