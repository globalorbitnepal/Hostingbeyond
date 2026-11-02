"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Save,
} from "lucide-react";

import { OrbitPageSeoPanel } from "@/components/orbit/page-seo-panel";
import type { StoredPageSeo } from "@/lib/orbit/page-seo";
import { scorePageSeo } from "@/lib/orbit/page-seo-score";
import {
  ORBIT_PAGE_CATEGORY_LABELS,
  type OrbitPageCategory,
} from "@/lib/orbit/page-inventory";

type PageDetail = {
  slug: string;
  label: string;
  path: string;
  category: Exclude<OrbitPageCategory, "all">;
  editorHref: string;
  note?: string;
  seoMode: "registry" | "content-editor";
  seo: StoredPageSeo;
  seoScore: number;
  updatedAt: string | null;
};

export function OrbitPageDetailEditor({ slug }: { slug: string }) {
  const [page, setPage] = useState<PageDetail | null>(null);
  const [draft, setDraft] = useState<StoredPageSeo>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/orbit/pages");
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Could not load page.");
      setLoading(false);
      return;
    }
    const row = (json.pages as PageDetail[] | undefined)?.find(
      (item) => item.slug === slug,
    );
    if (!row) {
      setError("Unknown page.");
      setLoading(false);
      return;
    }
    setPage(row);
    setDraft(row.seo);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const scored = useMemo(() => {
    if (!page) return null;
    return scorePageSeo(draft, page.path);
  }, [draft, page]);

  async function save() {
    if (!page) return;
    setSaving(true);
    setStatus("Saving…");

    if (page.seoMode === "content-editor") {
      const contentPath =
        page.slug === "about"
          ? "/api/orbit/content/about"
          : page.slug === "contact"
            ? "/api/orbit/content/contact"
            : null;
      if (contentPath) {
        const contentRes = await fetch(contentPath);
        const contentJson = await contentRes.json();
        if (contentRes.ok && contentJson.content) {
          const next = {
            ...contentJson.content,
            seoTitle: draft.metaTitle ?? contentJson.content.seoTitle,
            seoDescription:
              draft.metaDescription ?? contentJson.content.seoDescription,
          };
          await fetch(contentPath, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: next }),
          });
        }
      }
    }

    const res = await fetch("/api/orbit/page-seo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: page.slug, seo: draft }),
    });
    if (!res.ok) {
      setStatus("Save failed — check your connection.");
      setSaving(false);
      return;
    }

    setStatus("Saved — live site updates within seconds.");
    setSaving(false);
    void load();
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading page…</p>;
  }

  if (error || !page) {
    return (
      <div className="space-y-4">
        <Link
          href="/orbit/pages"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--hb-blue)]"
        >
          <ArrowLeft className="size-4" />
          All pages
        </Link>
        <p className="text-sm text-red-700">{error || "Page not found."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/orbit/pages"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--hb-blue)]"
          >
            <ArrowLeft className="size-4" />
            All pages
          </Link>
          <div>
            <p className="text-xs font-semibold tracking-wide text-violet-600 uppercase">
              {ORBIT_PAGE_CATEGORY_LABELS[page.category]}
            </p>
            <h1 className="text-2xl font-bold text-slate-900">{page.label}</h1>
            <p className="mt-1 font-mono text-sm text-slate-500">{page.path}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={page.editorHref}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800"
          >
            Edit page content →
          </Link>
          <a
            href={page.path}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Preview live
            <ExternalLink className="size-4 opacity-60" />
          </a>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--hb-blue)] to-[var(--hb-purple)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Save className="size-4" />
            {saving ? "Saving…" : "Save SEO"}
          </button>
        </div>
      </div>

      {status ? (
        <p
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
          role="status"
        >
          <CheckCircle2 className="size-4 shrink-0" />
          {status}
        </p>
      ) : null}

      {page.note ? (
        <p className="rounded-2xl border border-violet-100 bg-violet-50/80 px-4 py-3 text-sm text-violet-900">
          {page.note}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <OrbitPageSeoPanel
          draft={draft}
          onChange={setDraft}
          seoMode={page.seoMode}
        />
        <aside className="space-y-4">
          {scored ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
                SEO score
              </p>
              <p className="mt-2 text-4xl font-extrabold text-[#2f1c6a]">
                {scored.score}
                <span className="ml-2 text-lg font-bold text-slate-400">
                  {scored.grade}
                </span>
              </p>
              <ul className="mt-4 space-y-2">
                {scored.checks.map((check) => (
                  <li
                    key={check.id}
                    className="flex items-start justify-between gap-2 text-xs"
                  >
                    <span
                      className={
                        check.passed ? "text-emerald-700" : "text-slate-600"
                      }
                    >
                      {check.label}
                    </span>
                    <span className="shrink-0 font-semibold text-slate-400">
                      {check.points}/{check.maxPoints}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Instant publish</p>
            <p className="mt-1">
              Saving runs cache revalidation on{" "}
              <code className="text-xs">orbit-content</code> and this page path
              so visitors see changes on the next request — usually within a few
              seconds.
            </p>
            {page.updatedAt ? (
              <p className="mt-3 text-xs text-slate-400">
                Last CMS update: {new Date(page.updatedAt).toLocaleString()}
              </p>
            ) : null}
            <a
              href={page.path}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--hb-blue)]"
            >
              Open {page.path}
              <ArrowUpRight className="size-4" />
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
