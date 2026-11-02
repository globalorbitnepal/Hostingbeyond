"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { readResponseError } from "@/lib/orbit/read-response-error";
import { cn } from "@/lib/utils";

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

const CATEGORY_LABELS: Record<string, string> = {
  WEBSITE: "Website",
  DEVELOPER: "Developer",
  VPS: "VPS",
  BUSINESS: "Business",
};

export default function OrbitHostingProductsPage() {
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [q, setQ] = useState(() => searchParams.get("search")?.trim() ?? "");

  useEffect(() => {
    const fromUrl = searchParams.get("search")?.trim();
    if (fromUrl) setQ(fromUrl);
  }, [searchParams]);

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

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((row) => {
      if (category !== "ALL" && row.category !== category) return false;
      if (statusFilter !== "ALL" && row.status !== statusFilter) return false;
      if (!needle) return true;
      return (
        row.name.toLowerCase().includes(needle) ||
        row.slug.toLowerCase().includes(needle) ||
        row.canonicalPath.toLowerCase().includes(needle)
      );
    });
  }, [rows, category, statusFilter, q]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Hosting Plans</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          The single source of truth for every hosting plan price and
          specification shown on the public site and used at checkout. Rich hero
          copy lives in the per-page editors under Web Hosting / Cloud.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: "ALL", label: "All categories" },
            ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
              value,
              label,
            })),
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setCategory(tab.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                category === tab.value
                  ? "bg-[#2f1c6a] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            aria-label="Filter by status"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <label className="relative block w-full max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search product or path…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm"
            />
          </label>
        </div>
      </div>

      {status ? <p className="text-sm text-slate-600">{status}</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[12px] font-bold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Plans</th>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No products match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">
                      {row.name}
                    </div>
                    <div className="font-mono text-[12px] text-slate-500">
                      {row.canonicalPath}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {CATEGORY_LABELS[row.category] ?? row.category}
                  </td>
                  <td className="px-4 py-3">{row.planCount}</td>
                  <td className="px-4 py-3 font-medium">{row.startingPrice}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[12px] font-semibold",
                        row.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600",
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-slate-500">
                    {new Date(row.updatedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        href={`/orbit/hosting-products/${row.id}`}
                        className="rounded-lg bg-violet-600 px-3 py-1.5 text-[12px] font-semibold text-white"
                      >
                        Edit plans
                      </Link>
                      <a
                        href={row.canonicalPath}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-slate-700"
                      >
                        View
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
