"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  ExternalLink,
  ImagePlus,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

import { EditorAccordion } from "@/components/orbit/blog/editor-accordion";
import { MediaPickerModal } from "@/components/orbit/blog/media-picker-modal";
import { RichTextEditor } from "@/components/orbit/blog/rich-text-editor";
import { SeoScorePanel } from "@/components/orbit/blog/seo-score-panel";
import { siteConfig } from "@/config/site";
import { GUIDE_TYPE_OPTIONS } from "@/lib/blog/guide-type";
import { editorContentStats } from "@/lib/blog/editor-stats";
import { scoreBlogSeo } from "@/lib/blog/seo-score";
import { slugifyTitle } from "@/lib/blog/slug";
import { readResponseError } from "@/lib/orbit/read-response-error";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string; slug: string };
type Tag = { id: string; name: string; slug: string };
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

type MediaTarget = "cover" | "social" | null;

function charTone(len: number, min: number, max: number) {
  if (len === 0) return "text-slate-400";
  if (len < min) return "text-amber-600";
  if (len > max) return "text-red-600";
  return "text-emerald-700";
}

function seoHint(len: number, min: number, max: number) {
  if (len === 0) return "Not set";
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
    "idle" | "saving" | "saved" | "dirty" | "error"
  >("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [slugEdit, setSlugEdit] = useState(false);
  const [slugLocked, setSlugLocked] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<MediaTarget>(null);
  const [seoTab, setSeoTab] = useState<"basic" | "social" | "advanced">(
    "basic",
  );
  const [tagInput, setTagInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [metaBusy, setMetaBusy] = useState(false);
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
  const dirtyRef = useRef(false);

  const stats = useMemo(
    () => editorContentStats(form.contentHtml),
    [form.contentHtml],
  );

  const seoScore = useMemo(
    () =>
      scoreBlogSeo({
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        contentHtml: form.contentHtml,
        seoTitle: form.seoTitle,
        seoDescription: form.seoDescription,
        focusKeyword: form.focusKeyword,
        ogTitle: form.ogTitle,
        ogDescription: form.ogDescription,
        coverImageUrl: form.featuredImageUrl,
        coverImageAlt: form.featuredImageAlt,
        keywords: form.seoKeywords
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    [form],
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
        setStatusMsg(json.error || "Failed to load this post.");
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
      if (!postId && opts?.autosave) return;
      const body = {
        ...payload,
        status: (opts?.statusOverride ??
          payload.status) as typeof payload.status,
        autosave: opts?.autosave,
      };
      const fingerprint = JSON.stringify(body);
      if (opts?.autosave && fingerprint === lastSavedRef.current) return;

      setSaveState("saving");
      setStatusMsg("");
      const res = await fetch(
        postId ? `/api/orbit/blog/posts/${postId}` : "/api/orbit/blog/posts",
        {
          method: postId ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const parsed = await readResponseError(res, "Save failed");
        setStatusMsg(parsed.text || json.error || "Save failed");
        setSaveState("error");
        return;
      }
      lastSavedRef.current = fingerprint;
      dirtyRef.current = false;
      setSaveState("saved");
      setSavedAt(new Date());
      if (!postId && json.post?.id) {
        window.location.href = `/orbit/blog/${json.post.id}/edit`;
        return;
      }
      if (json.post) {
        setForm((f) => ({
          ...f,
          previewToken: json.post.previewToken ?? f.previewToken,
          slug: json.post.slug ?? f.slug,
          updatedAt: json.post.updatedAt ?? f.updatedAt,
          publishedAt: json.post.publishedAt ?? f.publishedAt,
          readingTimeOverride: json.post.readingTimeOverride ?? null,
        }));
      }
    },
    [payload, postId],
  );

  useEffect(() => {
    if (loading || !postId) return;
    dirtyRef.current = true;
    setSaveState((prev) => (prev === "saving" ? prev : "dirty"));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (form.title.trim()) void save({ autosave: true });
    }, 4000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // Autosave only reacts to the fields that matter for recovery.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    form.title,
    form.contentHtml,
    form.excerpt,
    form.slug,
    form.seoTitle,
    form.seoDescription,
    loading,
    postId,
  ]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current || saveState === "saved") return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [saveState]);

  const createCategory = async () => {
    const name = categoryInput.trim();
    if (!name) return;
    setMetaBusy(true);
    try {
      const res = await fetch("/api/orbit/blog/categories", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatusMsg(json.error || "Could not create category.");
        return;
      }
      await loadMeta();
      setForm((f) => ({ ...f, categoryId: json.category.id }));
      setCategoryInput("");
      setShowNewCategory(false);
    } finally {
      setMetaBusy(false);
    }
  };

  const createTag = async () => {
    const name = tagInput.trim();
    if (!name) return;
    const existing = tags.find(
      (t) => t.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      if (!form.tagIds.includes(existing.id)) {
        setForm((f) => ({ ...f, tagIds: [...f.tagIds, existing.id] }));
      }
      setTagInput("");
      return;
    }
    setMetaBusy(true);
    try {
      const res = await fetch("/api/orbit/blog/tags", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatusMsg(json.error || "Could not create tag.");
        return;
      }
      setTags((prev) =>
        [...prev, json.tag].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setForm((f) => ({ ...f, tagIds: [...f.tagIds, json.tag.id] }));
      setTagInput("");
    } finally {
      setMetaBusy(false);
    }
  };

  const previewHref = form.previewToken
    ? `/resources/blog/preview?token=${form.previewToken}`
    : null;
  const publicHref =
    form.status === "PUBLISHED" && form.slug
      ? `/resources/blog/${form.slug}`
      : null;

  const publishLabel =
    form.status === "PUBLISHED"
      ? "Update"
      : form.status === "SCHEDULED"
        ? "Schedule"
        : "Publish";

  const publish = () => {
    const nextStatus =
      form.status === "PUBLISHED"
        ? "PUBLISHED"
        : form.status === "SCHEDULED" && form.scheduledAt
          ? "SCHEDULED"
          : "PUBLISHED";
    if (nextStatus === "SCHEDULED") {
      setForm((f) => ({ ...f, status: "SCHEDULED" }));
      void save({ statusOverride: "SCHEDULED" });
      return;
    }
    setForm((f) => ({ ...f, status: "PUBLISHED" }));
    void save({ statusOverride: "PUBLISHED" });
  };

  const canPublish = Boolean(
    form.title.trim() && form.slug.trim() && form.contentHtml.trim(),
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="size-4 animate-spin" /> Loading editor…
      </div>
    );
  }

  const selectedCategory = categories.find((c) => c.id === form.categoryId);

  return (
    <div className="-mx-4 -mt-2 min-h-[calc(100dvh-4rem)] bg-[#f0f0f1] lg:-mx-6">
      <div className="sticky top-0 z-30 border-b border-[#dcdcde] bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-3 px-4 py-2.5">
          <Link
            href="/orbit/blog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2271b1] hover:underline"
          >
            <ArrowLeft className="size-4" />
            All articles
          </Link>
          <span className="hidden h-5 w-px bg-[#dcdcde] sm:block" aria-hidden />
          <p className="text-sm font-semibold text-[#1d2327]">
            {postId
              ? "Edit article"
              : form.contentType === "TIP"
                ? "Add new guide"
                : "Add new article"}
          </p>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
              form.status === "PUBLISHED"
                ? "bg-emerald-100 text-emerald-800"
                : form.status === "SCHEDULED"
                  ? "bg-amber-100 text-amber-800"
                  : form.status === "ARCHIVED"
                    ? "bg-slate-200 text-slate-600"
                    : "bg-slate-100 text-slate-600",
            )}
          >
            {form.status}
          </span>

          <p className="ml-auto text-xs text-[#646970]">
            {saveState === "saving"
              ? "Saving…"
              : saveState === "saved" && savedAt
                ? `Saved ${savedAt.toLocaleTimeString()}`
                : saveState === "dirty"
                  ? "Unsaved changes"
                  : saveState === "error"
                    ? "Save failed"
                    : ""}
          </p>
          {previewHref ? (
            <a
              href={previewHref}
              target="_blank"
              rel="noreferrer"
              className="rounded-sm border border-[#c3c4c7] bg-[#f6f7f7] px-3 py-1.5 text-xs font-semibold text-[#2c3338] hover:bg-white"
            >
              Preview
            </a>
          ) : null}
          {publicHref ? (
            <a
              href={publicHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-sm border border-[#c3c4c7] bg-[#f6f7f7] px-3 py-1.5 text-xs font-semibold text-[#2c3338] hover:bg-white"
            >
              View live <ExternalLink className="size-3" />
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => void save({ statusOverride: "DRAFT" })}
            className="rounded-sm border border-[#c3c4c7] bg-[#f6f7f7] px-3 py-1.5 text-xs font-semibold text-[#2c3338] hover:bg-white"
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={!canPublish}
            onClick={publish}
            title={
              canPublish
                ? "Publish this article"
                : "Add a title, slug and content first"
            }
            className={cn(
              "rounded-sm px-4 py-1.5 text-xs font-bold text-white",
              canPublish
                ? "bg-[#2271b1] hover:bg-[#135e96]"
                : "cursor-not-allowed bg-[#8c8f94]",
            )}
          >
            {publishLabel}
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1440px] gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="mx-auto w-full max-w-[860px] space-y-4">
          <div className="rounded-sm border border-[#c3c4c7] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
            <label className="sr-only" htmlFor="post-title">
              Article title
            </label>
            <textarea
              id="post-title"
              value={form.title}
              rows={2}
              onChange={(e) => {
                const title = e.target.value;
                setForm((f) => ({
                  ...f,
                  title,
                  slug: slugLocked ? f.slug : slugifyTitle(title),
                  // Keep the SEO title in sync until the author edits it.
                  seoTitle:
                    !f.seoTitle.trim() || f.seoTitle === f.title.slice(0, 60)
                      ? title.slice(0, 60)
                      : f.seoTitle,
                }));
              }}
              placeholder="Add title"
              className="w-full resize-none border-0 bg-transparent px-4 py-3 text-[clamp(1.6rem,3.4vw,2rem)] leading-tight font-semibold text-[#1d2327] outline-none placeholder:text-[#a7aaad]"
            />
          </div>

          <div className="rounded-sm border border-[#c3c4c7] bg-white px-4 py-3 shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#646970]">
              <span className="font-semibold text-[#2c3338]">Permalink:</span>
              <span className="break-all">
                {siteConfig.url.replace(/\/$/, "")}/resources/blog/
                <strong className="text-[#1d2327]">
                  {form.slug || "your-slug"}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => setSlugEdit((v) => !v)}
                className="font-semibold text-[#2271b1] hover:underline"
              >
                {slugEdit ? "Close" : "Edit"}
              </button>
            </div>
            {slugEdit ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  value={form.slug}
                  onChange={(e) => {
                    setSlugLocked(true);
                    setForm((f) => ({ ...f, slug: e.target.value }));
                  }}
                  onBlur={() =>
                    setForm((f) => ({
                      ...f,
                      slug: slugifyTitle(f.slug) || slugifyTitle(f.title),
                    }))
                  }
                  placeholder="url-slug"
                  className="min-w-[220px] flex-1 rounded-sm border border-[#8c8f94] px-3 py-1.5 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSlugLocked(true);
                    setForm((f) => ({ ...f, slug: slugifyTitle(f.title) }));
                  }}
                  className="inline-flex items-center gap-1 rounded-sm border border-[#c3c4c7] px-3 py-1.5 text-xs font-semibold text-[#2c3338]"
                >
                  <RefreshCw className="size-3" /> From title
                </button>
              </div>
            ) : null}
            <p className="mt-2 text-[11px] text-[#646970]">
              Keep it short and descriptive: lowercase words, hyphens only. Old
              slugs redirect automatically when you change them after
              publishing.
            </p>
          </div>

          <div className="rounded-sm border border-[#c3c4c7] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between border-b border-[#f0f0f1] px-4 py-2">
              <p className="text-[11px] font-bold tracking-[0.08em] text-[#646970] uppercase">
                Cover image
              </p>
              <button
                type="button"
                onClick={() => setMediaTarget("cover")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2271b1] hover:underline"
              >
                <ImagePlus className="size-3.5" />
                {form.featuredImageUrl ? "Replace" : "Set cover image"}
              </button>
            </div>
            {form.featuredImageUrl ? (
              <div className="space-y-2 p-3">
                <div className="relative aspect-[16/8] overflow-hidden rounded-sm bg-[#f6f7f7]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.featuredImageUrl}
                    alt={form.featuredImageAlt || ""}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={form.featuredImageAlt}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        featuredImageAlt: e.target.value,
                      }))
                    }
                    placeholder="Alt text — describe the image for screen readers and image search"
                    className="min-w-[220px] flex-1 rounded-sm border border-[#8c8f94] px-3 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        featuredImageUrl: "",
                        featuredImageAlt: "",
                      }))
                    }
                    className="inline-flex items-center gap-1 rounded-sm border border-[#c3c4c7] px-2.5 py-1.5 text-xs font-semibold text-[#b32d2e]"
                  >
                    <Trash2 className="size-3" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setMediaTarget("cover")}
                className="m-3 flex w-[calc(100%-1.5rem)] flex-col items-center gap-1 rounded-sm border border-dashed border-[#c3c4c7] bg-[#f6f7f7] px-4 py-8 text-xs text-[#646970] hover:border-[#2271b1] hover:text-[#2271b1]"
              >
                <ImagePlus className="size-5" />
                Choose a cover image from the media library
              </button>
            )}
          </div>

          <RichTextEditor
            value={form.contentHtml}
            previewHref={previewHref}
            onChange={(html) => setForm((f) => ({ ...f, contentHtml: html }))}
          />

          <div className="rounded-sm border border-[#c3c4c7] bg-white px-4 py-4 shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
            <label className="text-[11px] font-bold tracking-[0.08em] text-[#646970] uppercase">
              Excerpt
            </label>
            <p className="mt-1 text-xs text-[#646970]">
              Short summary used on blog cards, search results and social
              previews. Aim for 120–180 characters.
            </p>
            <textarea
              value={form.excerpt}
              onChange={(e) =>
                setForm((f) => ({ ...f, excerpt: e.target.value }))
              }
              rows={3}
              className="mt-2 w-full rounded-sm border border-[#8c8f94] px-3 py-2 text-sm text-[#2c3338]"
            />
            <p
              className={cn(
                "mt-1 text-xs",
                charTone(form.excerpt.length, 100, 180),
              )}
            >
              {form.excerpt.length} characters
            </p>
          </div>

          <div className="rounded-sm border border-[#c3c4c7] bg-white px-4 py-4 shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
            <p className="text-[11px] font-bold tracking-[0.08em] text-[#646970] uppercase">
              Search engine preview
            </p>
            <div className="mt-3 rounded-sm border border-[#e2e8f0] bg-[#fafafa] p-4">
              <p className="truncate text-sm text-[#1a0dab]">
                {form.seoTitle.trim() || form.title || "Article title"}
              </p>
              <p className="mt-0.5 truncate text-xs text-[#006621]">
                {siteConfig.url.replace(/\/$/, "")}/resources/blog/
                {form.slug || "your-slug"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#545454]">
                {(
                  form.seoDescription.trim() ||
                  form.excerpt ||
                  "Add a meta description so this article shows a compelling summary in Google."
                ).slice(0, 165)}
              </p>
            </div>
            <p className="mt-2 text-xs text-[#646970]">
              Estimated reading time: {stats.readingTimeMinutes} min ·{" "}
              {stats.words.toLocaleString()} words
            </p>
          </div>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-[3.75rem] lg:max-h-[calc(100dvh-4.5rem)] lg:overflow-y-auto lg:pb-4">
          <EditorAccordion title="Publish">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => void save({ statusOverride: "DRAFT" })}
                className="rounded-sm border border-[#c3c4c7] px-2.5 py-1.5 font-semibold text-[#2c3338]"
              >
                Save draft
              </button>
              <button
                type="button"
                onClick={() => {
                  const url = window.prompt(
                    "Preview link (share before publishing)",
                    previewHref
                      ? new URL(previewHref, window.location.origin).toString()
                      : "",
                  );
                  if (url) void navigator.clipboard.writeText(url);
                }}
                className="rounded-sm border border-[#c3c4c7] px-2.5 py-1.5 font-semibold text-[#2c3338]"
              >
                Copy preview link
              </button>
            </div>

            <label className="text-xs font-semibold text-slate-600">
              Status
            </label>
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
              <>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <CalendarClock className="size-3.5" /> Publish at
                </label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, scheduledAt: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </>
            ) : null}

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
              <option value="BLOG">Blog article</option>
              <option value="TIP">Tip / guide</option>
            </select>
            {form.contentType === "TIP" ? (
              <>
                <label className="text-xs font-semibold text-slate-600">
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

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm((f) => ({ ...f, featured: e.target.checked }))
                }
              />
              {form.contentType === "TIP"
                ? "Feature on the Tips hub"
                : "Feature at the top of the blog"}
            </label>

            {form.updatedAt ? (
              <p className="text-xs text-slate-500">
                Last saved {new Date(form.updatedAt).toLocaleString()}
              </p>
            ) : null}
            {statusMsg ? (
              <p className="rounded-lg bg-red-50 px-2 py-1.5 text-xs text-red-700">
                {statusMsg}
              </p>
            ) : null}
          </EditorAccordion>

          <SeoScorePanel result={seoScore} />

          <EditorAccordion title="Categories">
            <select
              value={form.categoryId}
              onChange={(e) =>
                setForm((f) => ({ ...f, categoryId: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Uncategorised</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {selectedCategory ? (
              <p className="text-[11px] text-slate-500">
                Archive page: /resources/blog/category/{selectedCategory.slug}
              </p>
            ) : (
              <p className="text-[11px] text-amber-700">
                Pick a category so the article appears in a topic archive.
              </p>
            )}
            {showNewCategory ? (
              <div className="flex gap-2">
                <input
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void createCategory();
                    }
                  }}
                  placeholder="New category name"
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  disabled={metaBusy}
                  onClick={() => void createCategory()}
                  className="rounded-lg bg-[#2271b1] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNewCategory(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2271b1] hover:underline"
              >
                <Plus className="size-3.5" /> Add new category
              </button>
            )}
            <Link
              href="/orbit/blog/categories"
              className="block text-[11px] font-semibold text-slate-500 hover:text-[#2271b1]"
            >
              Manage categories →
            </Link>
          </EditorAccordion>

          <EditorAccordion title="Tags">
            <div className="flex flex-wrap gap-1.5">
              {form.tagIds.map((id) => {
                const tag = tags.find((t) => t.id === id);
                if (!tag) return null;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700"
                  >
                    {tag.name}
                    <button
                      type="button"
                      aria-label={`Remove ${tag.name}`}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          tagIds: f.tagIds.filter((x) => x !== id),
                        }))
                      }
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                );
              })}
              {form.tagIds.length === 0 ? (
                <p className="text-xs text-slate-400">No tags yet.</p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  void createTag();
                }}
                placeholder="Type a tag and press Enter"
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <button
                type="button"
                disabled={metaBusy}
                onClick={() => void createTag()}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-60"
              >
                Add
              </button>
            </div>
            <div className="max-h-32 overflow-y-auto rounded-lg border border-slate-100 p-1.5">
              {tags.map((t) => {
                const active = form.tagIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        tagIds: active
                          ? f.tagIds.filter((x) => x !== t.id)
                          : [...f.tagIds, t.id],
                      }))
                    }
                    className={cn(
                      "flex w-full items-center justify-between rounded px-2 py-1 text-left text-xs",
                      active
                        ? "bg-[#f0f6fc] font-semibold text-[#2271b1]"
                        : "text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    {t.name}
                    {active ? <Check className="size-3" /> : null}
                  </button>
                );
              })}
            </div>
          </EditorAccordion>

          <EditorAccordion title="Featured / social image" defaultOpen={false}>
            <p className="text-[11px] text-slate-500">
              Used for Facebook, X and WhatsApp link previews. Falls back to the
              cover image when empty.
            </p>
            {form.ogImageUrl ? (
              <div className="space-y-2">
                <div className="relative aspect-[1.91/1] overflow-hidden rounded-lg bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.ogImageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, ogImageUrl: "" }))}
                  className="text-xs font-semibold text-red-600"
                >
                  Remove social image
                </button>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setMediaTarget("social")}
              className="w-full rounded-lg border border-dashed border-violet-200 py-2 text-xs font-semibold text-[#673de6]"
            >
              {form.ogImageUrl
                ? "Replace from media library"
                : "Select from media library"}
            </button>
          </EditorAccordion>

          <EditorAccordion title="Author" defaultOpen={false}>
            <select
              value={form.authorId}
              onChange={(e) =>
                setForm((f) => ({ ...f, authorId: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">HostingBeyond editorial team</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.displayName || a.name}
                </option>
              ))}
            </select>
            <Link
              href="/orbit/blog/authors"
              className="block text-[11px] font-semibold text-slate-500 hover:text-[#2271b1]"
            >
              Manage authors →
            </Link>
          </EditorAccordion>

          <EditorAccordion title="SEO settings" defaultOpen={false}>
            <div className="flex gap-1">
              {(["basic", "social", "advanced"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSeoTab(tab)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                    seoTab === tab
                      ? "bg-[#2271b1] text-white"
                      : "bg-slate-100 text-slate-600",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            {seoTab === "basic" ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">
                  SEO title
                </label>
                <input
                  value={form.seoTitle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, seoTitle: e.target.value }))
                  }
                  placeholder="Search title — 50 to 60 characters"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <p
                  className={cn(
                    "text-[11px]",
                    charTone(form.seoTitle.length, 30, 65),
                  )}
                >
                  {form.seoTitle.length} chars —{" "}
                  {seoHint(form.seoTitle.length, 30, 65)}
                </p>
                <label className="text-xs font-semibold text-slate-600">
                  Meta description
                </label>
                <textarea
                  value={form.seoDescription}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, seoDescription: e.target.value }))
                  }
                  rows={3}
                  placeholder="Meta description — 140 to 160 characters"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <p
                  className={cn(
                    "text-[11px]",
                    charTone(form.seoDescription.length, 120, 165),
                  )}
                >
                  {form.seoDescription.length} chars —{" "}
                  {seoHint(form.seoDescription.length, 120, 165)}
                </p>
                <label className="text-xs font-semibold text-slate-600">
                  Focus keyword
                </label>
                <input
                  value={form.focusKeyword}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, focusKeyword: e.target.value }))
                  }
                  placeholder="e.g. web hosting for small business"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <label className="text-xs font-semibold text-slate-600">
                  Secondary keywords (internal only)
                </label>
                <input
                  value={form.seoKeywords}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, seoKeywords: e.target.value }))
                  }
                  placeholder="comma, separated, keywords"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            ) : null}
            {seoTab === "social" ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">
                  Open Graph title
                </label>
                <input
                  value={form.ogTitle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ogTitle: e.target.value }))
                  }
                  placeholder="Defaults to SEO title"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <label className="text-xs font-semibold text-slate-600">
                  Open Graph description
                </label>
                <textarea
                  value={form.ogDescription}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ogDescription: e.target.value }))
                  }
                  rows={2}
                  placeholder="Defaults to meta description"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <label className="text-xs font-semibold text-slate-600">
                  X (Twitter) title
                </label>
                <input
                  value={form.twitterTitle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, twitterTitle: e.target.value }))
                  }
                  placeholder="Defaults to Open Graph title"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <label className="text-xs font-semibold text-slate-600">
                  X (Twitter) description
                </label>
                <textarea
                  value={form.twitterDescription}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      twitterDescription: e.target.value,
                    }))
                  }
                  rows={2}
                  placeholder="Defaults to Open Graph description"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            ) : null}
            {seoTab === "advanced" ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">
                  Canonical URL
                </label>
                <input
                  value={form.canonicalUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, canonicalUrl: e.target.value }))
                  }
                  placeholder="Leave empty to use the live article URL"
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
                  Hide from search engines (noindex)
                </label>
                <p className="text-[11px] text-slate-500">
                  Use noindex only for temporary or duplicate content.
                </p>
              </div>
            ) : null}
          </EditorAccordion>
        </aside>
      </div>

      <MediaPickerModal
        open={mediaTarget !== null}
        onClose={() => setMediaTarget(null)}
        onSelect={(url, alt) =>
          setForm((f) =>
            mediaTarget === "social"
              ? { ...f, ogImageUrl: url }
              : {
                  ...f,
                  featuredImageUrl: url,
                  featuredImageAlt: f.featuredImageAlt || alt,
                },
          )
        }
      />
    </div>
  );
}
