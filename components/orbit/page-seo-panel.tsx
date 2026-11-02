"use client";

import type { StoredPageSeo } from "@/lib/orbit/page-seo";

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
    label: "Focus keywords",
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

export function OrbitPageSeoPanel({
  draft,
  onChange,
  seoMode,
}: {
  draft: StoredPageSeo;
  onChange: (next: StoredPageSeo) => void;
  seoMode: "registry" | "content-editor";
}) {
  function patch(partial: Partial<StoredPageSeo>) {
    onChange({ ...draft, ...partial });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900">SEO & social</h2>
        <p className="mt-1 text-sm text-slate-500">
          Meta title, description, keywords, Open Graph and Twitter cards for
          search and social previews.
        </p>
      </div>

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
                onChange={(e) => patch({ [field.key]: e.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 normal-case"
              />
            ) : (
              <input
                value={String(draft[field.key] ?? "")}
                onChange={(e) => patch({ [field.key]: e.target.value })}
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
            onChange={(e) => patch({ noIndex: e.target.checked })}
          />
          Hide from search engines (noindex)
        </label>
      </div>

      {seoMode === "content-editor" ? (
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Meta title and description also sync to the{" "}
          <strong>{seoMode === "content-editor" ? "page content" : ""}</strong>{" "}
          record so the live About/Contact page updates immediately.
        </p>
      ) : null}
    </div>
  );
}
