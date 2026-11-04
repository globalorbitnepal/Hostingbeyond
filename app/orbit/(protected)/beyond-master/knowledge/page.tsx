"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BEYOND_MASTER_KNOWLEDGE_CATEGORIES } from "@/lib/beyond-master/knowledge/categories";

type Article = {
  id: string;
  slug: string;
  category: string;
  title: string;
  body: string;
  keywords: string[];
  published: boolean;
  sourceNote: string;
  updatedAt: string;
};

type Builtin = {
  slug: string;
  category: string;
  title: string;
  body: string;
  published: boolean;
  source: "builtin";
};

type Counts = {
  total: number;
  published: number;
  unpublished: number;
  categories: number;
};

type Queue = {
  available: true;
  counts: Counts;
  articles: Article[];
  builtins: Builtin[];
  total: number;
  page: number;
  pageSize: number;
};

type Draft = {
  id: string | null;
  title: string;
  slug: string;
  category: string;
  body: string;
  keywords: string;
  sourceNote: string;
  published: boolean;
};

const EMPTY: Draft = {
  id: null,
  title: "",
  slug: "",
  category: "support",
  body: "",
  keywords: "",
  sourceNote: "",
  published: false,
};

export default function OrbitBeyondMasterKnowledgePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [published, setPublished] = useState("");
  const [page, setPage] = useState(1);
  const [queue, setQueue] = useState<Queue | null>(null);
  const [builtins, setBuiltins] = useState<Builtin[]>([]);
  const [migration, setMigration] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [preview, setPreview] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (query.trim()) params.set("q", query.trim());
    if (category) params.set("category", category);
    if (published) params.set("published", published);
    void (async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/orbit/beyond-master/knowledge?${params.toString()}`,
        );
        const payload = (await response.json().catch(() => null)) as {
          available?: boolean;
          message?: string;
          error?: string;
          counts?: Counts;
          articles?: Article[];
          builtins?: Builtin[];
          total?: number;
          page?: number;
          pageSize?: number;
        } | null;
        if (cancelled) return;
        setBuiltins(payload?.builtins ?? []);
        if (payload?.available === false && payload.message) {
          setMigration(payload.message);
          setQueue(null);
          setError("");
          return;
        }
        if (
          !response.ok ||
          !payload ||
          payload.available !== true ||
          !payload.counts ||
          !payload.articles
        ) {
          setError(payload?.error || "Knowledge articles could not be loaded.");
          setQueue(null);
          setMigration("");
          return;
        }
        setQueue(payload as Queue);
        setMigration("");
        setError("");
      } catch {
        if (!cancelled) setError("Knowledge articles could not be loaded.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query, category, published, page, reload]);

  function openCreate() {
    setNotice("");
    setPreview(null);
    setDraft(EMPTY);
  }

  function openEdit(article: Article) {
    setNotice("");
    setPreview(null);
    setDraft({
      id: article.id,
      title: article.title,
      slug: article.slug,
      category: article.category,
      body: article.body,
      keywords: article.keywords.join(", "),
      sourceNote: article.sourceNote,
      published: article.published,
    });
  }

  async function save(nextPublished = draft?.published ?? false) {
    if (!draft) return;
    if (
      nextPublished &&
      !draft.published &&
      !window.confirm("Publish this article for Beyond Master AI retrieval?")
    )
      return;
    if (
      !nextPublished &&
      draft.published &&
      draft.id &&
      !window.confirm(
        "Unpublish this article? It will leave future AI retrieval.",
      )
    )
      return;
    setBusy(true);
    setNotice("");
    const payload = {
      title: draft.title,
      slug: draft.slug,
      category: draft.category,
      body: draft.body,
      keywords: draft.keywords
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      sourceNote: draft.sourceNote,
      published: nextPublished,
    };
    const response = await fetch(
      draft.id
        ? `/api/orbit/beyond-master/knowledge/${encodeURIComponent(draft.id)}`
        : "/api/orbit/beyond-master/knowledge",
      {
        method: draft.id ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const body = (await response.json().catch(() => null)) as {
      article?: Article;
      error?: string;
    } | null;
    setBusy(false);
    if (!response.ok || !body?.article) {
      setNotice(body?.error || "The article could not be saved.");
      return;
    }
    setDraft({
      id: body.article.id,
      title: body.article.title,
      slug: body.article.slug,
      category: body.article.category,
      body: body.article.body,
      keywords: body.article.keywords.join(", "),
      sourceNote: body.article.sourceNote,
      published: body.article.published,
    });
    setPreview(null);
    setNotice(
      body.article.published
        ? "Article saved and published."
        : "Article saved as unpublished.",
    );
    setReload((current) => current + 1);
  }

  const pages = queue
    ? Math.max(1, Math.ceil(queue.total / queue.pageSize))
    : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Knowledge base
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Beyond Master AI articles. Only published database articles are
            retrieved. Built-in fallback articles stay in the application code.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/orbit/beyond-master"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
          >
            Overview
          </Link>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
          >
            Create article
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading articles…</p>
      ) : null}
      {migration ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {migration}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="text-sm font-medium text-slate-800">{notice}</p>
      ) : null}

      {queue ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Count label="Total" value={queue.counts.total} />
          <Count label="Published" value={queue.counts.published} />
          <Count label="Unpublished" value={queue.counts.unpublished} />
          <Count label="Categories" value={queue.counts.categories} />
        </div>
      ) : null}

      <form
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Search title or slug
          <input
            value={query}
            onChange={(event) => {
              setPage(1);
              setQuery(event.target.value);
            }}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
          />
        </label>
        <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Category
          <select
            value={category}
            onChange={(event) => {
              setPage(1);
              setCategory(event.target.value);
            }}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
          >
            <option value="">Any</option>
            {BEYOND_MASTER_KNOWLEDGE_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Status
          <select
            value={published}
            onChange={(event) => {
              setPage(1);
              setPublished(event.target.value);
            }}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
          >
            <option value="">Any</option>
            <option value="true">Published</option>
            <option value="false">Unpublished</option>
          </select>
        </label>
      </form>

      {queue && queue.articles.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
          No database articles match these filters.
        </p>
      ) : null}

      {queue && queue.articles.length > 0 ? (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-3 py-3">Title</th>
                  <th className="px-3 py-3">Slug</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {queue.articles.map((article) => (
                  <tr key={article.id} className="border-t border-slate-100">
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        className="font-semibold text-sky-700"
                        onClick={() => openEdit(article)}
                      >
                        {article.title}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{article.slug}</td>
                    <td className="px-3 py-3 text-slate-600">
                      {article.category}
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge published={article.published} />
                    </td>
                    <td className="px-3 py-3 text-slate-500">
                      {formatWhen(article.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">
            {queue.articles.map((article) => (
              <button
                key={article.id}
                type="button"
                onClick={() => openEdit(article)}
                className="block w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"
              >
                <span className="font-semibold text-slate-900">
                  {article.title}
                </span>
                <span className="mt-1 block text-sm text-slate-500">
                  {article.slug} · {article.category}
                </span>
                <span className="mt-2 block">
                  <StatusBadge published={article.published} />
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm">
            <p className="text-slate-500">
              Page {queue.page} of {pages} · {queue.total} matching
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 disabled:opacity-40"
                disabled={page >= pages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : null}

      {draft ? (
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            {draft.id ? "Edit article" : "New article"}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <Field
              label="Title"
              value={draft.title}
              onChange={(title) =>
                setDraft({
                  ...draft,
                  title,
                  slug: draft.id ? draft.slug : slugify(title),
                })
              }
            />
            <Field
              label="Slug"
              value={draft.slug}
              onChange={(slug) => setDraft({ ...draft, slug })}
            />
            <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Category
              <select
                value={draft.category}
                onChange={(event) =>
                  setDraft({ ...draft, category: event.target.value })
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
              >
                {BEYOND_MASTER_KNOWLEDGE_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="Keywords"
              value={draft.keywords}
              onChange={(keywords) => setDraft({ ...draft, keywords })}
            />
          </div>
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Content
            <textarea
              value={draft.body}
              onChange={(event) =>
                setDraft({ ...draft, body: event.target.value })
              }
              rows={8}
              maxLength={4000}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
            />
          </label>
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Internal source note
            <textarea
              value={draft.sourceNote}
              onChange={(event) =>
                setDraft({ ...draft, sourceNote: event.target.value })
              }
              rows={2}
              maxLength={500}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
            />
          </label>
          <p className="text-sm text-slate-500">
            Language is not a separate field. The current article status is{" "}
            {draft.published ? "published" : "unpublished"}.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void save(draft.published)}
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Save
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void save(true)}
              className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900 disabled:opacity-40"
            >
              Publish
            </button>
            <button
              type="button"
              disabled={busy || !draft.id}
              onClick={() => void save(false)}
              className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950 disabled:opacity-40"
            >
              Unpublish
            </button>
            <button
              type="button"
              onClick={() => setPreview(draft)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              Preview
            </button>
          </div>
        </section>
      ) : null}

      {preview ? (
        <section className="space-y-3 rounded-2xl border border-sky-200 bg-sky-50 p-4">
          <p className="text-xs font-semibold tracking-wide text-sky-800 uppercase">
            Preview only · not saved
          </p>
          <h2 className="text-xl font-bold text-slate-900">
            {preview.title || "Untitled"}
          </h2>
          <p className="text-sm text-slate-600">
            {preview.category} ·{" "}
            {preview.published ? "published" : "unpublished"}
          </p>
          {preview.sourceNote ? (
            <p className="text-sm text-slate-600">
              Source note: {preview.sourceNote}
            </p>
          ) : null}
          <p className="text-sm whitespace-pre-wrap text-slate-800">
            {preview.body}
          </p>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">
          Built-in fallback articles
        </h2>
        <p className="text-sm text-slate-500">
          These stay in the application. A database article with the same slug
          overrides one while that database article is published.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {builtins.map((article) => (
            <article
              key={article.slug}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900">
                  {article.title}
                </h3>
                <StatusBadge published={article.published} />
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {article.slug} · {article.category}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-semibold ${published ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}
    >
      {published ? "Published" : "Unpublished"}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
      />
    </label>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}
