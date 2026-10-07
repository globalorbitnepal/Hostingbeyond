"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { RichTextEditor } from "@/components/orbit/blog/rich-text-editor";
import { slugifyTitle } from "@/lib/blog/slug";
import { readResponseError } from "@/lib/orbit/read-response-error";

type Category = { id: string; name: string; slug: string };
type Tag = { id: string; name: string };
type Author = { id: string; name: string; displayName: string | null };

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  status: string;
  featured: boolean;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  authorId: string | null;
  categoryId: string | null;
  scheduledAt: string | null;
  readingTimeOverride: number | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  focusKeyword: string | null;
  seoKeywords: string[];
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImageUrl: string | null;
  previewToken: string | null;
  tags: { tag: Tag }[];
};

function seoHint(len: number, min: number, max: number) {
  if (len < min) return "Too short";
  if (len > max) return "Too long";
  return "Good";
}

export function OrbitBlogPostEditor({ postId }: { postId?: string }) {
  const [loading, setLoading] = useState(Boolean(postId));
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "dirty"
  >("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    contentHtml: "",
    status: "DRAFT",
    featured: false,
    featuredImageUrl: "",
    featuredImageAlt: "",
    authorId: "",
    categoryId: "",
    tagIds: [] as string[],
    scheduledAt: "",
    readingTimeOverride: "",
    canonicalUrl: "",
    noIndex: false,
    seoTitle: "",
    seoDescription: "",
    focusKeyword: "",
    seoKeywords: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: "",
    twitterTitle: "",
    twitterDescription: "",
    twitterImageUrl: "",
    previewToken: "",
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadMeta = useCallback(async () => {
    const [c, t, a] = await Promise.all([
      fetch("/api/orbit/blog/categories").then((r) => r.json()),
      fetch("/api/orbit/blog/tags").then((r) => r.json()),
      fetch("/api/orbit/blog/authors").then((r) => r.json()),
    ]);
    setCategories(c.categories ?? []);
    setTags(t.tags ?? []);
    setAuthors(a.authors ?? []);
  }, []);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    if (!postId) return;
    void (async () => {
      const res = await fetch(`/api/orbit/blog/posts/${postId}`);
      const json = await res.json();
      if (!res.ok) {
        setStatusMsg(json.error || "Failed to load");
        setLoading(false);
        return;
      }
      const post = json.post as Post;
      setForm({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        contentHtml: post.contentHtml,
        status: post.status,
        featured: post.featured,
        featuredImageUrl: post.featuredImageUrl ?? "",
        featuredImageAlt: post.featuredImageAlt ?? "",
        authorId: post.authorId ?? "",
        categoryId: post.categoryId ?? "",
        tagIds: post.tags.map((x) => x.tag.id),
        scheduledAt: post.scheduledAt ? post.scheduledAt.slice(0, 16) : "",
        readingTimeOverride: post.readingTimeOverride?.toString() ?? "",
        canonicalUrl: post.canonicalUrl ?? "",
        noIndex: post.noIndex,
        seoTitle: post.seoTitle ?? "",
        seoDescription: post.seoDescription ?? "",
        focusKeyword: post.focusKeyword ?? "",
        seoKeywords: (post.seoKeywords ?? []).join(", "),
        ogTitle: post.ogTitle ?? "",
        ogDescription: post.ogDescription ?? "",
        ogImageUrl: post.ogImageUrl ?? "",
        twitterTitle: post.twitterTitle ?? "",
        twitterDescription: post.twitterDescription ?? "",
        twitterImageUrl: post.twitterImageUrl ?? "",
        previewToken: post.previewToken ?? "",
      });
      setLoading(false);
    })();
  }, [postId]);

  const payload = useMemo(
    () => ({
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      contentHtml: form.contentHtml,
      status: form.status as "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED",
      featured: form.featured,
      featuredImageUrl: form.featuredImageUrl || null,
      featuredImageAlt: form.featuredImageAlt || null,
      authorId: form.authorId || null,
      categoryId: form.categoryId || null,
      tagIds: form.tagIds,
      scheduledAt: form.scheduledAt || null,
      readingTimeOverride: form.readingTimeOverride
        ? Number(form.readingTimeOverride)
        : null,
      canonicalUrl: form.canonicalUrl || null,
      noIndex: form.noIndex,
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
      focusKeyword: form.focusKeyword || null,
      seoKeywords: form.seoKeywords
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      ogTitle: form.ogTitle || null,
      ogDescription: form.ogDescription || null,
      ogImageUrl: form.ogImageUrl || null,
      twitterTitle: form.twitterTitle || null,
      twitterDescription: form.twitterDescription || null,
      twitterImageUrl: form.twitterImageUrl || null,
    }),
    [form],
  );

  const save = useCallback(async () => {
    setSaveState("saving");
    const res = await fetch(
      postId ? `/api/orbit/blog/posts/${postId}` : "/api/orbit/blog/posts",
      {
        method: postId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const json = await res.json();
    if (!res.ok) {
      const parsed = await readResponseError(res, "Save failed");
      setStatusMsg(parsed.text);
      setSaveState("dirty");
      return;
    }
    setSaveState("saved");
    setStatusMsg("Saved");
    if (!postId && json.post?.id) {
      window.location.href = `/orbit/blog/${json.post.id}/edit`;
    } else if (json.post?.previewToken) {
      setForm((f) => ({ ...f, previewToken: json.post.previewToken }));
    }
  }, [payload, postId]);

  useEffect(() => {
    if (loading || !postId) return;
    setSaveState("dirty");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (form.title.trim()) void save();
    }, 5000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounced autosave on edit only
  }, [form.title, form.contentHtml, form.excerpt, loading, postId]);

  const checklist = useMemo(() => {
    const kw = form.focusKeyword.trim().toLowerCase();
    const content = form.contentHtml.toLowerCase();
    return [
      { ok: Boolean(form.seoTitle.trim()), label: "SEO title" },
      { ok: Boolean(form.seoDescription.trim()), label: "Meta description" },
      { ok: Boolean(form.focusKeyword.trim()), label: "Focus keyword" },
      { ok: Boolean(form.slug.trim()), label: "URL slug" },
      { ok: Boolean(form.featuredImageUrl.trim()), label: "Featured image" },
      { ok: form.contentHtml.includes("<h2"), label: "H2 structure" },
      { ok: !kw || content.includes(kw), label: "Keyword in content" },
      {
        ok: Boolean(form.canonicalUrl.trim() || form.slug),
        label: "Canonical",
      },
      {
        ok: Boolean(form.ogImageUrl.trim() || form.featuredImageUrl.trim()),
        label: "OG image",
      },
    ];
  }, [form]);

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <input
          value={form.title}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              title: e.target.value,
              slug: f.slug || slugifyTitle(e.target.value),
            }))
          }
          placeholder="Post title"
          className="w-full border-0 text-2xl font-bold outline-none"
        />
        <input
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="slug"
        />
        <textarea
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          rows={3}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Excerpt / dek"
        />
        <RichTextEditor
          value={form.contentHtml}
          onChange={(html) => setForm((f) => ({ ...f, contentHtml: html }))}
        />
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="font-bold">Publishing</h2>
          <p className="text-xs text-slate-500">
            {saveState === "saving"
              ? "Saving…"
              : saveState === "saved"
                ? "Saved"
                : "Unsaved changes"}
          </p>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          {form.status === "SCHEDULED" ? (
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) =>
                setForm((f) => ({ ...f, scheduledAt: e.target.value }))
              }
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          ) : null}
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                setForm((f) => ({ ...f, featured: e.target.checked }))
              }
            />
            Featured post
          </label>
          <button
            type="button"
            onClick={() => void save()}
            className="mt-4 w-full rounded-xl bg-[#673de6] py-2.5 text-sm font-semibold text-white"
          >
            Save now
          </button>
          {form.previewToken ? (
            <Link
              href={`/resources/blog/preview?token=${form.previewToken}`}
              target="_blank"
              className="mt-2 block text-center text-sm font-semibold text-[#673de6]"
            >
              Preview draft
            </Link>
          ) : null}
          {statusMsg ? (
            <p className="mt-2 text-xs text-slate-500">{statusMsg}</p>
          ) : null}
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="font-bold">Category & tags</h2>
          <select
            value={form.categoryId}
            onChange={(e) =>
              setForm((f) => ({ ...f, categoryId: e.target.value }))
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            multiple
            value={form.tagIds}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                tagIds: Array.from(e.target.selectedOptions).map(
                  (o) => o.value,
                ),
              }))
            }
            className="h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {tags.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={form.authorId}
            onChange={(e) =>
              setForm((f) => ({ ...f, authorId: e.target.value }))
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Default author</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.displayName || a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="font-bold">Featured image</h2>
          <input
            value={form.featuredImageUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, featuredImageUrl: e.target.value }))
            }
            placeholder="Image URL"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            value={form.featuredImageAlt}
            onChange={(e) =>
              setForm((f) => ({ ...f, featuredImageAlt: e.target.value }))
            }
            placeholder="Alt text"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <Link
            href="/orbit/media"
            className="text-xs font-semibold text-[#673de6]"
          >
            Open media library
          </Link>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="font-bold">SEO settings</h2>
          <input
            value={form.seoTitle}
            onChange={(e) =>
              setForm((f) => ({ ...f, seoTitle: e.target.value }))
            }
            placeholder="SEO title"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <p className="text-xs text-slate-500">
            {form.seoTitle.length} chars —{" "}
            {seoHint(form.seoTitle.length, 50, 60)}
          </p>
          <textarea
            value={form.seoDescription}
            onChange={(e) =>
              setForm((f) => ({ ...f, seoDescription: e.target.value }))
            }
            rows={3}
            placeholder="Meta description"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <p className="text-xs text-slate-500">
            {form.seoDescription.length} chars —{" "}
            {seoHint(form.seoDescription.length, 140, 160)}
          </p>
          <input
            value={form.focusKeyword}
            onChange={(e) =>
              setForm((f) => ({ ...f, focusKeyword: e.target.value }))
            }
            placeholder="Focus keyword"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            value={form.seoKeywords}
            onChange={(e) =>
              setForm((f) => ({ ...f, seoKeywords: e.target.value }))
            }
            placeholder="SEO keywords (comma-separated, internal)"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            value={form.canonicalUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, canonicalUrl: e.target.value }))
            }
            placeholder="Canonical URL (optional)"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.noIndex}
              onChange={(e) =>
                setForm((f) => ({ ...f, noIndex: e.target.checked }))
              }
            />
            noindex
          </label>
          <input
            value={form.ogTitle}
            onChange={(e) =>
              setForm((f) => ({ ...f, ogTitle: e.target.value }))
            }
            placeholder="OG title"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <textarea
            value={form.ogDescription}
            onChange={(e) =>
              setForm((f) => ({ ...f, ogDescription: e.target.value }))
            }
            rows={2}
            placeholder="OG description"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            value={form.ogImageUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, ogImageUrl: e.target.value }))
            }
            placeholder="OG image URL"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="font-bold">SEO readiness</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {checklist.map((item) => (
              <li
                key={item.label}
                className={item.ok ? "text-emerald-700" : "text-slate-500"}
              >
                {item.ok ? "✓" : "○"} {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
