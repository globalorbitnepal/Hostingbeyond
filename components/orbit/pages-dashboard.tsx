"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  ExternalLink,
  FileText,
  Pencil,
  Search,
  Sparkles,
} from "lucide-react";

import type { StoredPageSeo } from "@/lib/orbit/page-seo";
import {
  ORBIT_PAGE_CATEGORY_LABELS,
  type OrbitPageCategory,
} from "@/lib/orbit/page-inventory";
import { cn } from "@/lib/utils";

type PageRow = {
  slug: string;
  label: string;
  path: string;
  category: Exclude<OrbitPageCategory, "all">;
  editorHref: string;
  note?: string;
  seoMode: "registry" | "content-editor";
  isPublished: boolean;
  isVisible: boolean;
  updatedAt: string | null;
  hasStoredSeo: boolean;
  hasCmsContent: boolean;
  seoScore: number;
  seoGrade: string;
};

const CATEGORY_TABS: { value: OrbitPageCategory; label: string }[] = [
  { value: "all", label: "All pages" },
  { value: "core", label: ORBIT_PAGE_CATEGORY_LABELS.core },
  { value: "domains", label: ORBIT_PAGE_CATEGORY_LABELS.domains },
  { value: "hosting", label: ORBIT_PAGE_CATEGORY_LABELS.hosting },
  { value: "cloud-vps", label: ORBIT_PAGE_CATEGORY_LABELS["cloud-vps"] },
  { value: "products", label: ORBIT_PAGE_CATEGORY_LABELS.products },
  { value: "company", label: ORBIT_PAGE_CATEGORY_LABELS.company },
  { value: "resources", label: ORBIT_PAGE_CATEGORY_LABELS.resources },
  { value: "legal", label: ORBIT_PAGE_CATEGORY_LABELS.legal },
  { value: "account", label: ORBIT_PAGE_CATEGORY_LABELS.account },
];

function scoreTone(score: number) {
  if (score >= 85) return "bg-emerald-100 text-emerald-800";
  if (score >= 60) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-700";
}

function statusLabel(page: PageRow) {
  if (page.isPublished && page.isVisible) return "Live";
  if (!page.isVisible) return "Hidden";
  return "Draft";
}

export function OrbitPagesDashboard() {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [category, setCategory] = useState<OrbitPageCategory>("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/orbit/pages");
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Could not load pages.");
      setLoading(false);
      return;
    }
    setPages(json.pages ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return pages.filter((page) => {
      if (category !== "all" && page.category !== category) return false;
      if (!needle) return true;
      return (
        page.label.toLowerCase().includes(needle) ||
        page.path.toLowerCase().includes(needle) ||
        page.slug.toLowerCase().includes(needle)
      );
    });
  }, [pages, category, q]);

  const stats = useMemo(() => {
    const live = pages.filter((p) => p.isPublished && p.isVisible).length;
    const customSeo = pages.filter((p) => p.hasStoredSeo).length;
    const avg =
      pages.length > 0
        ? Math.round(
            pages.reduce((sum, p) => sum + p.seoScore, 0) / pages.length,
          )
        : 0;
    return { total: pages.length, live, customSeo, avg };
  }, [pages]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pages</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Every public route on HostingBeyond — edit page content, SEO, and
            open the live URL. Saves revalidate cache tags and the public path
            so changes appear within seconds. This is the single SEO editor —
            the old bulk screen now redirects here.
          </p>
        </div>
        <a
          href="https://hosting.theglobalorbit.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-violet-200"
        >
          View site
          <ExternalLink className="size-4 opacity-60" />
        </a>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total pages", value: stats.total },
          { label: "Live", value: stats.live },
          { label: "Custom SEO saved", value: stats.customSeo },
          { label: "Avg. SEO score", value: stats.avg },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              {card.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-[#2f1c6a]">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setCategory(tab.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                category === tab.value
                  ? "bg-[#2f1c6a] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <label className="relative block w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, path, or slug…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-3 pl-10 text-sm"
          />
        </label>
      </div>

      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Page</th>
              <th className="hidden px-4 py-3 md:table-cell">URL</th>
              <th className="hidden px-4 py-3 lg:table-cell">Section</th>
              <th className="px-4 py-3">SEO</th>
              <th className="hidden px-4 py-3 sm:table-cell">Status</th>
              <th className="hidden px-4 py-3 xl:table-cell">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  Loading pages…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  No pages match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((page) => (
                <tr
                  key={page.slug}
                  className="border-t border-slate-100 hover:bg-violet-50/30"
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{page.label}</p>
                    <p className="text-xs text-slate-400 md:hidden">
                      {page.path}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-slate-500 md:table-cell">
                    {page.path}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      {ORBIT_PAGE_CATEGORY_LABELS[page.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold",
                        scoreTone(page.seoScore),
                      )}
                    >
                      <Sparkles className="size-3" />
                      {page.seoScore}
                      <span className="font-semibold opacity-70">
                        {page.seoGrade}
                      </span>
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        page.isPublished && page.isVisible
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600",
                      )}
                    >
                      {statusLabel(page)}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-500 xl:table-cell">
                    {page.updatedAt
                      ? new Date(page.updatedAt).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        href={`/orbit/pages/${page.slug}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#2f1c6a] px-2.5 py-1.5 text-xs font-semibold text-white"
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </Link>
                      <Link
                        href={page.editorHref}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        <FileText className="size-3.5" />
                        Content
                      </Link>
                      <a
                        href={page.path}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-[var(--hb-blue)]"
                      >
                        Live
                        <ArrowUpRight className="size-3.5" />
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

export type { PageRow, StoredPageSeo };
