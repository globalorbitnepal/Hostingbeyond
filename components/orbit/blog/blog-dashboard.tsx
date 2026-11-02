"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Copy,
  Eye,
  FileText,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";

import { scoreBlogSeo } from "@/lib/blog/seo-score";
import { cn } from "@/lib/utils";

type PostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  status: string;
  contentType: string;
  featured: boolean;
  updatedAt: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  viewCount: number;
  seoTitle: string | null;
  seoDescription: string | null;
  focusKeyword: string | null;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  noIndex: boolean;
  category: { id: string; name: string; slug: string } | null;
  author: { name: string; displayName: string | null } | null;
};

type CategoryRow = { id: string; name: string; slug: string };

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Drafts" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "ARCHIVED", label: "Archived" },
] as const;

function scoreTone(score: number) {
  if (score >= 85) return "bg-emerald-100 text-emerald-800";
  if (score >= 60) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-700";
}

function scoreFor(post: PostRow) {
  return scoreBlogSeo({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    contentHtml: post.contentHtml,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    focusKeyword: post.focusKeyword,
    coverImageUrl: post.featuredImageUrl,
    coverImageAlt: post.featuredImageAlt,
  }).score;
}

export function OrbitBlogDashboard({
  initialStatus = "",
}: {
  initialStatus?: string;
}) {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [status, setStatus] = useState(initialStatus);
  const [categoryId, setCategoryId] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (categoryId) params.set("categoryId", categoryId);
    if (q) params.set("q", q);
    const [postsRes, catsRes] = await Promise.all([
      fetch(`/api/orbit/blog/posts?${params}`),
      fetch("/api/orbit/blog/categories"),
    ]);
    const json = await postsRes.json();
    const cats = await catsRes.json();
    setPosts(json.posts ?? []);
    setCategories(cats.categories ?? []);
    setLoading(false);
  }, [status, categoryId, q]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), q ? 250 : 0);
    return () => clearTimeout(timer);
  }, [load, q]);

  const stats = useMemo(() => {
    const published = posts.filter((p) => p.status === "PUBLISHED").length;
    const draft = posts.filter((p) => p.status === "DRAFT").length;
    const scheduled = posts.filter((p) => p.status === "SCHEDULED").length;
    const views = posts.reduce((sum, p) => sum + (p.viewCount ?? 0), 0);
    return { published, draft, scheduled, views };
  }, [posts]);

  const duplicate = async (post: PostRow) => {
    setBusyId(post.id);
    setError("");
    const res = await fetch("/api/orbit/blog/posts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: `${post.title} (copy)`,
        duplicateFromId: post.id,
      }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error || "Could not duplicate this article.");
      setBusyId(null);
      return;
    }
    const json = await res.json();
    window.location.href = `/orbit/blog/${json.post.id}/edit`;
  };

  const remove = async (post: PostRow) => {
    if (!window.confirm(`Delete “${post.title}” permanently?`)) return;
    setBusyId(post.id);
    const res = await fetch(`/api/orbit/blog/posts/${post.id}`, {
      method: "DELETE",
    });
    setBusyId(null);
    if (!res.ok) {
      setError("Could not delete this article.");
      return;
    }
    await load();
  };

  const empty = !loading && posts.length === 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1d2327]">
            Articles
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Write, optimise and publish blog posts on{" "}
            <Link
              href="/resources/blog"
              target="_blank"
              className="font-semibold text-[#2271b1] hover:underline"
            >
              hosting.theglobalorbit.com/resources/blog
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/orbit/blog/new?type=tip"
            className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-[#673de6]"
          >
            <Plus className="size-4" /> Add guide
          </Link>
          <Link
            href="/orbit/blog/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2271b1] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#135e96]"
          >
            <Plus className="size-4" /> Add new article
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Published", value: stats.published, icon: CheckCircle2 },
          { label: "Drafts", value: stats.draft, icon: FileText },
          { label: "Scheduled", value: stats.scheduled, icon: CalendarClock },
          { label: "Total views", value: stats.views, icon: Eye },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <card.icon className="size-3.5" /> {card.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-[#1d2327]">
              {card.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-full border border-slate-200 bg-white">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value || "all"}
              type="button"
              onClick={() => setStatus(tab.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold transition",
                status === tab.value
                  ? "bg-[#2271b1] text-white"
                  : "text-slate-600 hover:bg-slate-50",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title or slug"
            className="w-56 rounded-full border border-slate-200 bg-white py-1.5 pr-3 pl-8 text-xs"
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/60 text-[11px] tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Article</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">SEO</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Loading articles…
                </td>
              </tr>
            ) : null}
            {empty ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center">
                  <p className="font-semibold text-slate-700">
                    No articles yet.
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Start with one well-optimised post — the editor scores it as
                    you write.
                  </p>
                  <Link
                    href="/orbit/blog/new"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#2271b1] px-3 py-2 text-sm font-semibold text-white"
                  >
                    <Plus className="size-4" /> Add new article
                  </Link>
                </td>
              </tr>
            ) : null}
            {posts.map((post) => {
              const score = scoreFor(post);
              return (
                <tr key={post.id} className="border-b border-slate-50">
                  <td className="max-w-[420px] px-4 py-3">
                    <div className="flex items-start gap-2">
                      {post.featured ? (
                        <Star className="mt-0.5 size-3.5 shrink-0 fill-amber-400 text-amber-400" />
                      ) : null}
                      <div className="min-w-0">
                        <Link
                          href={`/orbit/blog/${post.id}/edit`}
                          className="font-semibold text-[#1d2327] hover:text-[#2271b1]"
                        >
                          {post.title}
                        </Link>
                        <p className="truncate text-[11px] text-slate-400">
                          /resources/blog/{post.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {post.category?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold",
                        scoreTone(score),
                      )}
                    >
                      {score}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        post.status === "PUBLISHED"
                          ? "bg-emerald-100 text-emerald-800"
                          : post.status === "SCHEDULED"
                            ? "bg-amber-100 text-amber-800"
                            : post.status === "ARCHIVED"
                              ? "bg-slate-200 text-slate-600"
                              : "bg-slate-100 text-slate-600",
                      )}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(post.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/orbit/blog/${post.id}/edit`}
                        title="Edit"
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#2271b1]"
                      >
                        <Pencil className="size-3.5" />
                      </Link>
                      {post.status === "PUBLISHED" ? (
                        <a
                          href={`/resources/blog/${post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="View live"
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#2271b1]"
                        >
                          <ArrowUpRight className="size-3.5" />
                        </a>
                      ) : null}
                      <button
                        type="button"
                        title="Duplicate"
                        disabled={busyId === post.id}
                        onClick={() => void duplicate(post)}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#2271b1] disabled:opacity-40"
                      >
                        <Copy className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        disabled={busyId === post.id}
                        onClick={() => void remove(post)}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
