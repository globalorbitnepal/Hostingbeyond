"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EditorAccordion } from "@/components/orbit/blog/editor-accordion";
import { MediaPickerModal } from "@/components/orbit/blog/media-picker-modal";
import { RichTextEditor } from "@/components/orbit/blog/rich-text-editor";
import { siteConfig } from "@/config/site";
import { GUIDE_TYPE_OPTIONS } from "@/lib/blog/guide-type";
import { editorContentStats } from "@/lib/blog/editor-stats";
import { slugifyTitle } from "@/lib/blog/slug";
import { readResponseError } from "@/lib/orbit/read-response-error";

type Category = { id: string; name: string; slug: string };
type Tag = { id: string; name: string };
type Author = {
  id: string;
  name: string;
  displayName: string | null;
  avatarUrl?: string | null;
  role?: string | null;
};

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
  updatedAt: string;
  publishedAt: string | null;
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
  contentType: "BLOG" | "TIP";
  guideType: string | null;
  tags: { tag: Tag }[];
};

function seoHint(len: number, min: number, max: number) {
  if (len < min) return "Too short";
  if (len > max) return "Too long";
  return "Good";
}

export function OrbitBlogPostEditor({
  postId,
  defaultContentType = "BLOG",
}: {
  postId?: string;
  defaultContentType?: "BLOG" | "TIP";
}) {
  const [loading, setLoading] = useState(Boolean(postId));
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "dirty"
  >("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [slugEdit, setSlugEdit] = useState(false);
  const [slugLocked, setSlugLocked] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [seoTab, setSeoTab] = useState<"basic" | "social" | "advanced">(
    "basic",
  );
  const [tagInput, setTagInput] = useState("");
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
    updatedAt: "",
    publishedAt: "",
    contentType: defaultContentType,
    guideType: "",
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef("");

  const stats = useMemo(
    () => editorContentStats(form.contentHtml),
    [form.contentHtml],
  );

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
      setSlugLocked(true);
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
        updatedAt: post.updatedAt,
        publishedAt: post.publishedAt ?? "",
        contentType: (post.contentType === "TIP" ? "TIP" : "BLOG") as
          "BLOG" | "TIP",
        guideType: post.guideType ?? "",
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
      contentType: form.contentType as "BLOG" | "TIP",
      guideType: form.guideType
        ? (form.guideType as import("@prisma/client").BlogGuideType)
        : null,
    }),
    [form],
  );

  const save = useCallback(
    async (opts?: { autosave?: boolean; statusOverride?: string }) => {
      const body = {
        ...payload,
        status: (opts?.statusOverride ??
          payload.status) as typeof payload.status,
        autosave: opts?.autosave,
      };
      const fingerprint = JSON.stringify(body);
      if (opts?.autosave && fingerprint === lastSavedRef.current) return;

      setSaveState("saving");
      const res = await fetch(
        postId ? `/api/orbit/blog/posts/${postId}` : "/api/orbit/blog/posts",
        {
          method: postId ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const json = await res.json();
      if (!res.ok) {
        const parsed = await readResponseError(res, "Save failed");
        setStatusMsg(parsed.text);
        setSaveState("dirty");
        return;
      }
      lastSavedRef.current = fingerprint;
      setSaveState("saved");
      setSavedAt(new Date());
      if (!postId && json.post?.id) {
        window.location.href = `/orbit/blog/${json.post.id}/edit`;
        return;
      }
      if (json.post?.previewToken) {
        setForm((f) => ({
          ...f,
          previewToken: json.post.previewToken,
          slug: json.post.slug,
          updatedAt: json.post.updatedAt,
        }));
      }
    },
    [payload, postId],
  );

  useEffect(() => {
    if (loading || !postId) return;
    setSaveState("dirty");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (form.title.trim()) void save({ autosave: true });
    }, 4500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    form.title,
    form.contentHtml,
    form.excerpt,
    form.slug,
    form.seoTitle,
    form.seoDescription,
    loading,
    postId,
    save,
  ]);

  const checklist = useMemo(() => {
    const kw = form.focusKeyword.trim().toLowerCase();
    const title = form.title.toLowerCase();
    const slug = form.slug.toLowerCase();
    const excerpt = form.excerpt.toLowerCase();
    const content = form.contentHtml.toLowerCase();
    const hasInternal =
      content.includes('href="/') || content.includes('href="/');
    return [
      { ok: Boolean(form.seoTitle.trim()), label: "SEO title", warn: false },
      {
        ok: Boolean(form.seoDescription.trim()),
        label: "Meta description",
        warn: false,
      },
      {
        ok: Boolean(form.focusKeyword.trim()),
        label: "Focus keyword",
        warn: false,
      },
      {
        ok: !kw || title.includes(kw),
        label: "Keyword in title",
        warn: Boolean(kw) && !title.includes(kw),
      },
      {
        ok: !kw || slug.includes(kw.replace(/\s+/g, "-")),
        label: "Keyword in slug",
        warn: false,
      },
      {
        ok: !kw || excerpt.includes(kw),
        label: "Keyword in excerpt",
        warn: Boolean(kw) && !excerpt.includes(kw),
      },
      {
        ok: form.contentHtml.includes("<h2"),
        label: "H2 structure",
        warn: !form.contentHtml.includes("<h2"),
      },
      {
        ok: Boolean(form.featuredImageUrl.trim()),
        label: "Featured image",
        warn: !form.featuredImageUrl.trim(),
      },
      {
        ok: Boolean(form.featuredImageAlt.trim()),
        label: "Featured image alt",
        warn: Boolean(form.featuredImageUrl) && !form.featuredImageAlt.trim(),
      },
      { ok: hasInternal, label: "Internal links", warn: !hasInternal },
      {
        ok: stats.words >= 300,
        label: "Sufficient content length",
        warn: stats.words < 300,
      },
      {
        ok: form.seoTitle.length <= 65,
        label: "SEO title length",
        warn: form.seoTitle.length > 60,
      },
      {
        ok: form.seoDescription.length <= 170,
        label: "Meta description length",
        warn: form.seoDescription.length > 160,
      },
    ];
  }, [form, stats.words]);

  const previewHref = form.previewToken
    ? `/resources/blog/preview?token=${form.previewToken}`
    : null;

  const publishLabel = form.status === "PUBLISHED" ? "Update post" : "Publish";

  if (loading) {
    return <p className="text-sm text-slate-500">Loading editor…</p>;
  }

  return (
    <div className="-mx-4 -mt-2 min-h-[calc(100dvh-4rem)] bg-[#f0f0f1] lg:-mx-6">
      <div className="sticky top-0 z-30 border-b border-violet-100/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-3">
          <Link
            href="/orbit/blog"
            className="text-sm font-semibold text-[#673de6]"
          >
            ← Blog
          </Link>
          <p className="text-sm text-slate-500">
            {postId
              ? "Edit content"
              : form.contentType === "TIP"
                ? "New tip / guide"
                : "New blog post"}
          </p>
          <p className="ml-auto text-xs text-slate-500">
            {saveState === "saving"
              ? "Saving…"
              : saveState === "saved" && savedAt
                ? `Saved ${savedAt.toLocaleTimeString()}`
                : saveState === "dirty"
                  ? "Unsaved changes"
                  : ""}
          </p>
          {previewHref ? (
            <Link
              href={previewHref}
              target="_blank"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Preview
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => void save({ statusOverride: "DRAFT" })}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() => {
              setForm((f) => ({ ...f, status: "PUBLISHED" }));
              void save({ statusOverride: "PUBLISHED" });
            }}
            className="rounded-full bg-gradient-to-r from-[#7c3aed] to-[#2563eb] px-5 py-2 text-sm font-semibold text-white shadow-md"
          >
            {publishLabel}
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1600px] gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="mx-auto w-full max-w-[920px] space-y-4">
          <div className="rounded-sm border border-[#c3c4c7] bg-white px-4 py-4 shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
            <label className="text-[11px] font-semibold tracking-wide text-[#646970] uppercase">
              Title <span className="text-[#d63638]">*</span>
            </label>
            <textarea
              value={form.title}
              rows={2}
              onChange={(e) => {
                const title = e.target.value;
                setForm((f) => ({
                  ...f,
                  title,
                  slug: slugLocked ? f.slug : slugifyTitle(title),
                }));
              }}
              placeholder="Add title"
              className="mt-2 w-full resize-none border-0 bg-transparent text-[clamp(1.75rem,4vw,2.25rem)] leading-tight font-semibold text-[#1d2327] outline-none placeholder:text-[#a7aaad]"
            />
          </div>

          <div className="rounded-sm border border-[#c3c4c7] bg-white px-4 py-3 text-sm text-[#646970] shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
            <span className="font-medium text-slate-600">
              SEO-friendly URL:
            </span>
            <br />
            <span className="break-all">
              {siteConfig.url.replace(/\/$/, "")}/resources/blog/
              {form.slug || "your-slug"}
            </span>
            <button
              type="button"
              className="ml-2 text-sm font-semibold text-[#673de6]"
              onClick={() => setSlugEdit((v) => !v)}
            >
              {slugEdit ? "Hide" : "Edit slug"}
            </button>
            {slugEdit ? (
              <input
                value={form.slug}
                onChange={(e) => {
                  setSlugLocked(true);
                  setForm((f) => ({ ...f, slug: e.target.value }));
                }}
                className="mt-2 w-full rounded border border-[#8c8f94] bg-white px-3 py-2 text-sm text-[#2c3338]"
              />
            ) : null}
          </div>

          <div className="rounded-sm border border-[#c3c4c7] bg-white px-4 py-4 shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
            <label className="text-[11px] font-semibold tracking-wide text-[#646970] uppercase">
              Excerpt
            </label>
            <p className="mt-1 text-xs text-[#646970]">
              Short summary for cards and SEO. Recommended 120–180 characters.
            </p>
            <textarea
              value={form.excerpt}
              onChange={(e) =>
                setForm((f) => ({ ...f, excerpt: e.target.value }))
              }
              rows={3}
              className="mt-2 w-full rounded border border-[#8c8f94] px-3 py-2 text-sm text-[#2c3338]"
            />
            <p className="mt-1 text-xs text-[#787c82]">
              {form.excerpt.length} characters
            </p>
          </div>

          <RichTextEditor
            value={form.contentHtml}
            previewHref={previewHref}
            onChange={(html) => setForm((f) => ({ ...f, contentHtml: html }))}
          />

          <p className="text-xs text-[#646970]">
            Estimated reading time: {stats.readingTimeMinutes} min
          </p>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100dvh-5rem)] lg:overflow-y-auto">
          <EditorAccordion title="Publishing" defaultOpen>
            <label className="text-xs font-semibold text-slate-600">
              Content type
            </label>
            <select
              value={form.contentType}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  contentType: e.target.value as "BLOG" | "TIP",
                }))
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="BLOG">Blog post</option>
              <option value="TIP">Tip / guide</option>
            </select>
            {form.contentType === "TIP" ? (
              <>
                <label className="mt-2 text-xs font-semibold text-slate-600">
                  Guide type
                </label>
                <select
                  value={form.guideType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, guideType: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Not set</option>
                  {GUIDE_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </>
            ) : null}
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            ) : null}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm((f) => ({ ...f, featured: e.target.checked }))
                }
              />
              {form.contentType === "TIP"
                ? "Featured guide on Tips hub"
                : "Featured on blog home"}
            </label>
            {form.updatedAt ? (
              <p className="text-xs text-slate-500">
                Updated {new Date(form.updatedAt).toLocaleString()}
              </p>
            ) : null}
            {statusMsg ? (
              <p className="text-xs text-red-600">{statusMsg}</p>
            ) : null}
          </EditorAccordion>

          <EditorAccordion title="Featured image">
            {form.featuredImageUrl ? (
              <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.featuredImageUrl}
                  alt={form.featuredImageAlt || ""}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setMediaOpen(true)}
              className="w-full rounded-lg border border-dashed border-violet-200 py-2 text-sm font-semibold text-[#673de6]"
            >
              Select from media library
            </button>
            <input
              value={form.featuredImageAlt}
              onChange={(e) =>
                setForm((f) => ({ ...f, featuredImageAlt: e.target.value }))
              }
              placeholder="Alt text"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </EditorAccordion>

          <EditorAccordion title="Category">
            <select
              value={form.categoryId}
              onChange={(e) =>
                setForm((f) => ({ ...f, categoryId: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </EditorAccordion>

          <EditorAccordion title="Tags" defaultOpen={false}>
            <div className="flex flex-wrap gap-2">
              {form.tagIds.map((id) => {
                const tag = tags.find((t) => t.id === id);
                if (!tag) return null;
                return (
                  <button
                    key={id}
                    type="button"
                    className="rounded-full bg-violet-100 px-2 py-1 text-xs font-semibold text-[#673de6]"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        tagIds: f.tagIds.filter((x) => x !== id),
                      }))
                    }
                  >
                    {tag.name} ×
                  </button>
                );
              })}
            </div>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                const name = tagInput.trim();
                if (!name) return;
                const existing = tags.find(
                  (t) => t.name.toLowerCase() === name.toLowerCase(),
                );
                if (existing && !form.tagIds.includes(existing.id)) {
                  setForm((f) => ({
                    ...f,
                    tagIds: [...f.tagIds, existing.id],
                  }));
                }
                setTagInput("");
              }}
              placeholder="Type tag and press Enter"
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
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
              className="mt-2 h-20 w-full rounded-lg border border-slate-200 px-2 py-1 text-xs"
            >
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </EditorAccordion>

          <EditorAccordion title="Author" defaultOpen={false}>
            <select
              value={form.authorId}
              onChange={(e) =>
                setForm((f) => ({ ...f, authorId: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Select author</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.displayName || a.name}
                </option>
              ))}
            </select>
          </EditorAccordion>

          <EditorAccordion title="SEO">
            <div className="flex gap-1">
              {(["basic", "social", "advanced"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSeoTab(tab)}
                  className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                    seoTab === tab ? "bg-[#673de6] text-white" : "bg-slate-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {seoTab === "basic" ? (
              <div className="space-y-2">
                <input
                  value={form.seoTitle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, seoTitle: e.target.value }))
                  }
                  placeholder="SEO title (50–60 chars)"
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
                  placeholder="Meta description (140–160 chars)"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
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
                  placeholder="SEO keywords (internal only)"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            ) : null}
            {seoTab === "social" ? (
              <div className="space-y-2">
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
                <input
                  value={form.twitterTitle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, twitterTitle: e.target.value }))
                  }
                  placeholder="Twitter title"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <textarea
                  value={form.twitterDescription}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      twitterDescription: e.target.value,
                    }))
                  }
                  rows={2}
                  placeholder="Twitter description"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            ) : null}
            {seoTab === "advanced" ? (
              <div className="space-y-2">
                <input
                  value={form.canonicalUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, canonicalUrl: e.target.value }))
                  }
                  placeholder="Canonical URL"
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
              </div>
            ) : null}
            <ul className="mt-3 space-y-1 text-xs">
              {checklist.map((item) => (
                <li
                  key={item.label}
                  className={
                    item.ok
                      ? "text-emerald-700"
                      : item.warn
                        ? "text-amber-700"
                        : "text-slate-500"
                  }
                >
                  {item.ok ? "✓" : item.warn ? "!" : "○"} {item.label}
                </li>
              ))}
            </ul>
          </EditorAccordion>
        </aside>
      </div>

      <MediaPickerModal
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(url, alt) =>
          setForm((f) => ({
            ...f,
            featuredImageUrl: url,
            featuredImageAlt: f.featuredImageAlt || alt,
          }))
        }
      />
    </div>
  );
}
