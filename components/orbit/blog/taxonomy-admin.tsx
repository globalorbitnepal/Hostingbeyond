"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FolderTree, Pencil, Plus, Trash2, X } from "lucide-react";

import { slugifyTitle } from "@/lib/blog/slug";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  name: string;
  slug: string;
  description: string;
  seoTitle: string | null;
  seoDescription: string | null;
  noIndex: boolean;
  _count?: { posts: number };
};

type Kind = "categories" | "tags" | "authors";

type AuthorRow = {
  id: string;
  name: string;
  displayName: string | null;
  bio: string;
  role: string | null;
  avatarUrl: string | null;
};

const EMPTY_FORM = {
  id: "",
  name: "",
  slug: "",
  description: "",
  seoTitle: "",
  seoDescription: "",
  noIndex: false,
  bio: "",
  role: "",
  avatarUrl: "",
};

export function TaxonomyAdmin({ kind, title }: { kind: Kind; title: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [authors, setAuthors] = useState<AuthorRow[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const endpoint = `/api/orbit/blog/${kind}`;

  const load = useCallback(async () => {
    const res = await fetch(endpoint);
    const json = await res.json();
    if (kind === "authors") setAuthors(json.authors ?? []);
    else setRows(json[kind] ?? []);
  }, [endpoint, kind]);

  useEffect(() => {
    void load();
  }, [load]);

  const editing = Boolean(form.id);

  const reset = () => {
    setForm(EMPTY_FORM);
    setMsg("");
  };

  async function save() {
    if (!form.name.trim()) {
      setMsg("Name is required.");
      return;
    }
    setBusy(true);
    setMsg("");
    const body =
      kind === "authors"
        ? {
            id: form.id || undefined,
            name: form.name,
            displayName: form.name,
            bio: form.bio,
            role: form.role || null,
            avatarUrl: form.avatarUrl || null,
          }
        : {
            id: form.id || undefined,
            name: form.name,
            slug: form.slug || slugifyTitle(form.name),
            description: form.description,
            seoTitle: form.seoTitle || null,
            seoDescription: form.seoDescription || null,
            noIndex: form.noIndex,
          };
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMsg(json.error || "Save failed.");
      return;
    }
    reset();
    setOpen(false);
    await load();
  }

  async function remove(id: string, name: string) {
    if (
      !window.confirm(
        kind === "categories"
          ? `Delete “${name}”? Articles in it stay published but become uncategorised.`
          : `Delete “${name}”?`,
      )
    ) {
      return;
    }
    await fetch(`${endpoint}?id=${id}`, { method: "DELETE" });
    await load();
  }

  function startEdit(row: Row) {
    setForm({
      ...EMPTY_FORM,
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      seoTitle: row.seoTitle ?? "",
      seoDescription: row.seoDescription ?? "",
      noIndex: row.noIndex,
    });
    setOpen(true);
  }

  const authorList = useMemo(() => authors, [authors]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1d2327]">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {kind === "categories"
              ? "Topic groups for articles. Each category gets its own archive page and SEO fields."
              : kind === "tags"
                ? "Flexible labels for related content. Tags get their own archive pages."
                : "Bylines shown on articles, with photo, role and bio."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen((v) => !v);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#2271b1] px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="size-4" />
          Add{" "}
          {kind === "authors" ? "author" : kind === "tags" ? "tag" : "category"}
        </button>
      </div>

      {open ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-800">
              {editing ? "Edit" : "New"}{" "}
              {kind === "authors"
                ? "author"
                : kind === "tags"
                  ? "tag"
                  : "category"}
            </p>
            <button
              type="button"
              onClick={() => {
                reset();
                setOpen(false);
              }}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-slate-600">
              Name
              <input
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((f) => ({
                    ...f,
                    name,
                    slug:
                      kind === "authors" || f.slug
                        ? f.slug
                        : slugifyTitle(name),
                  }));
                }}
                placeholder="e.g. WordPress"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal"
              />
            </label>

            {kind !== "authors" ? (
              <label className="block text-xs font-semibold text-slate-600">
                Slug
                <input
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: e.target.value }))
                  }
                  onBlur={() =>
                    setForm((f) => ({
                      ...f,
                      slug: slugifyTitle(f.slug || f.name),
                    }))
                  }
                  placeholder="wordpress"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal"
                />
              </label>
            ) : (
              <label className="block text-xs font-semibold text-slate-600">
                Role
                <input
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                  placeholder="Content lead"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal"
                />
              </label>
            )}
          </div>

          {kind === "authors" ? (
            <>
              <label className="block text-xs font-semibold text-slate-600">
                Avatar URL
                <input
                  value={form.avatarUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, avatarUrl: e.target.value }))
                  }
                  placeholder="/uploads/avatar.jpg"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Bio
                <textarea
                  value={form.bio}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bio: e.target.value }))
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal"
                />
              </label>
            </>
          ) : (
            <>
              <label className="block text-xs font-semibold text-slate-600">
                Description
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={2}
                  placeholder="Shown on the archive page and used as the meta description fallback."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-slate-600">
                  SEO title
                  <input
                    value={form.seoTitle}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, seoTitle: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal"
                  />
                </label>
                <label className="block text-xs font-semibold text-slate-600">
                  SEO description
                  <input
                    value={form.seoDescription}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        seoDescription: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal"
                  />
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.noIndex}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, noIndex: e.target.checked }))
                  }
                />
                noindex this archive page
              </label>
            </>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void save()}
              className="rounded-lg bg-[#2271b1] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Saving…" : editing ? "Save changes" : "Create"}
            </button>
            {msg ? <p className="text-sm text-red-600">{msg}</p> : null}
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {(kind === "authors"
            ? authorList.map((a) => ({
                id: a.id,
                name: a.displayName || a.name,
                slug: a.role ?? "",
                description: a.bio,
                seoTitle: null,
                seoDescription: null,
                noIndex: false,
                _count: undefined,
              }))
            : rows
          ).map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-semibold text-[#1d2327]">
                  <FolderTree className="size-3.5 text-slate-400" />
                  {row.name}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {kind === "authors" ? row.slug || "Author" : `/${row.slug}`}
                  {kind === "categories" && row._count
                    ? ` · ${row._count.posts} article${row._count.posts === 1 ? "" : "s"}`
                    : ""}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {kind !== "authors" ? (
                  <Link
                    href={
                      kind === "categories"
                        ? `/resources/blog/category/${row.slug}`
                        : `/resources/blog/tag/${row.slug}`
                    }
                    target="_blank"
                    className="text-xs font-semibold text-[#2271b1] hover:underline"
                  >
                    View
                  </Link>
                ) : null}
                <button
                  type="button"
                  title="Edit"
                  onClick={() => startEdit(row)}
                  className={cn(
                    "rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#2271b1]",
                    kind === "authors" && "hidden",
                  )}
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  title="Delete"
                  onClick={() => void remove(row.id, row.name)}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
          {rows.length === 0 && authorList.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-slate-500">
              Nothing here yet.
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
