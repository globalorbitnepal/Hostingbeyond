"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { StoredPageSeo } from "@/lib/orbit/page-seo";

type PageRow = {
  slug: string;
  label: string;
  path: string;
  editorHref: string;
  note?: string;
  seo: StoredPageSeo;
};

const FIELDS: Array<{
  key: keyof StoredPageSeo;
  label: string;
  rows?: number;
  hint?: string;
}> = [
  { key: "metaTitle", label: "Meta title" },
  {
    key: "metaDescription",
    label: "Meta description",
    rows: 3,
  },
  {
    key: "keywords",
    label: "Keywords",
    rows: 2,
    hint: "Comma-separated phrases (domain name search, buy domain, …).",
  },
  { key: "ogTitle", label: "Open Graph title" },
  {
    key: "ogDescription",
    label: "Open Graph description",
    rows: 2,
  },
  {
    key: "ogImage",
    label: "Open Graph image path",
    hint: "e.g. /images/domains/hero.jpg or /uploads/…",
  },
  { key: "twitterTitle", label: "Twitter / X title" },
  {
    key: "twitterDescription",
    label: "Twitter / X description",
    rows: 2,
  },
];

export default function OrbitSeoPage() {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [activeSlug, setActiveSlug] = useState("");
  const [draft, setDraft] = useState<StoredPageSeo>({});
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/orbit/page-seo");
      const json = await res.json();
      if (res.ok && Array.isArray(json.pages)) {
        setPages(json.pages);
        const first = json.pages[0] as PageRow | undefined;
        if (first) {
          setActiveSlug(first.slug);
          setDraft(first.seo);
        }
      }
      setLoading(false);
    })();
  }, []);

  const active = pages.find((page) => page.slug === activeSlug);

  function selectPage(page: PageRow) {
    setActiveSlug(page.slug);
    setDraft(page.seo);
    setStatus("");
  }

  function patchSeo(partial: Partial<StoredPageSeo>) {
    setDraft((current) => ({ ...current, ...partial }));
  }

  async function save() {
    if (!activeSlug) return;
    setStatus("Saving…");
    const res = await fetch("/api/orbit/page-seo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: activeSlug, seo: draft }),
    });
    if (!res.ok) {
      setStatus("Save failed — check your connection.");
      return;
    }
    setPages((current) =>
      current.map((page) =>
        page.slug === activeSlug ? { ...page, seo: draft } : page,
      ),
    );
    setStatus("Saved. Live metadata updates on next request.");
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading page SEO…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Page SEO</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Unique meta title, description, keywords and Open Graph fields per
            public page. Domain hero copy still lives in{" "}
            <Link href="/orbit/domains" className="text-[var(--hb-blue)]">
              Domains
            </Link>
            .
          </p>
        </div>
        <button
          type="button"
          onClick={() => void save()}
          className="rounded-xl bg-gradient-to-r from-[var(--hb-blue)] to-[var(--hb-purple)] px-4 py-2 text-sm font-semibold text-white"
        >
          Save {active?.label ?? "page"}
        </button>
      </div>

      {status ? (
        <p className="text-sm text-emerald-700" role="status">
          {status}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-2">
          {pages.map((page) => (
            <button
              key={page.slug}
              type="button"
              onClick={() => selectPage(page)}
              className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                page.slug === activeSlug
                  ? "bg-white text-[#2f1c6a] shadow-sm"
                  : "text-slate-600 hover:bg-white/80"
              }`}
            >
              {page.label}
              <span className="mt-0.5 block text-[11px] font-medium text-slate-400">
                {page.path}
              </span>
            </button>
          ))}
        </aside>

        <div className="space-y-4 rounded-2xl border border-slate-200 p-5">
          {active ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {active.label}
                  </h2>
                  <p className="text-sm text-slate-500">{active.path}</p>
                </div>
                <Link
                  href={active.editorHref}
                  className="text-sm font-semibold text-[var(--hb-blue)]"
                >
                  Edit page content →
                </Link>
              </div>
              {active.note ? (
                <p className="rounded-xl bg-violet-50 px-3 py-2 text-sm text-violet-900">
                  {active.note}
                </p>
              ) : null}

              <div className="grid gap-4">
                {FIELDS.map((field) => (
                  <label
                    key={field.key}
                    className="block text-xs font-bold tracking-wide text-slate-500 uppercase"
                  >
                    {field.label}
                    {field.rows ? (
                      <textarea
                        value={String(draft[field.key] ?? "")}
                        rows={field.rows}
                        onChange={(e) =>
                          patchSeo({ [field.key]: e.target.value })
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 normal-case"
                      />
                    ) : (
                      <input
                        value={String(draft[field.key] ?? "")}
                        onChange={(e) =>
                          patchSeo({ [field.key]: e.target.value })
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 normal-case"
                      />
                    )}
                    {field.hint ? (
                      <span className="mt-1 block text-[11px] font-normal text-slate-400 normal-case">
                        {field.hint}
                      </span>
                    ) : null}
                  </label>
                ))}

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={draft.noIndex === true}
                    onChange={(e) => patchSeo({ noIndex: e.target.checked })}
                  />
                  Hide from search engines (noindex)
                </label>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">Select a page.</p>
          )}
        </div>
      </div>
    </div>
  );
}
