"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PostRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  contentType: string;
  featured: boolean;
  updatedAt: string;
  publishedAt: string | null;
  category: { name: string } | null;
  author: { name: string } | null;
};

export default function OrbitBlogDashboardPage() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [filter, setFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    void (async () => {
      const params = new URLSearchParams();
      if (filter) params.set("status", filter);
      if (typeFilter) params.set("contentType", typeFilter);
      if (q) params.set("q", q);
      const res = await fetch(`/api/orbit/blog/posts?${params}`);
      const json = await res.json();
      setPosts(json.posts ?? []);
    })();
  }, [filter, typeFilter, q]);

  const stats = {
    published: posts.filter((p) => p.status === "PUBLISHED").length,
    draft: posts.filter((p) => p.status === "DRAFT").length,
    scheduled: posts.filter((p) => p.status === "SCHEDULED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Blog</h1>
          <p className="text-sm text-slate-500">
            Blog posts &amp; tips / guides
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/orbit/blog/new"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800"
          >
            New blog post
          </Link>
          <Link
            href="/orbit/blog/new?type=tip"
            className="rounded-xl bg-[#673de6] px-4 py-2.5 text-sm font-semibold text-white"
          >
            New tip / guide
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Published</p>
          <p className="text-2xl font-bold">{stats.published}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Drafts</p>
          <p className="text-2xl font-bold">{stats.draft}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Scheduled</p>
          <p className="text-2xl font-bold">{stats.scheduled}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {["", "BLOG", "TIP"].map((s) => (
          <button
            key={s || "all-types"}
            type="button"
            onClick={() => setTypeFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              typeFilter === s
                ? "bg-violet-100 text-[#673de6]"
                : "border border-slate-200 bg-white"
            }`}
          >
            {s === "BLOG" ? "Blog" : s === "TIP" ? "Tips" : "All types"}
          </button>
        ))}
        {["", "PUBLISHED", "DRAFT", "SCHEDULED", "ARCHIVED"].map((s) => (
          <button
            key={s || "all"}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              filter === s
                ? "bg-[#673de6] text-white"
                : "border border-slate-200 bg-white"
            }`}
          >
            {s || "All"}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search posts"
          className="ml-auto rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-slate-50">
                <td className="px-4 py-3 font-medium">{post.title}</td>
                <td className="px-4 py-3 text-xs font-semibold text-slate-600">
                  {post.contentType === "TIP" ? "Tip" : "Blog"}
                </td>
                <td className="px-4 py-3">{post.status}</td>
                <td className="px-4 py-3">{post.category?.name ?? "—"}</td>
                <td className="px-4 py-3">{post.author?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  {new Date(post.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">{post.featured ? "Yes" : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <Link
                      href={`/orbit/blog/${post.id}/edit`}
                      className="text-[#673de6]"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="text-slate-600"
                      onClick={async () => {
                        await fetch("/api/orbit/blog/posts", {
                          method: "POST",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({
                            title: `${post.title} (copy)`,
                            duplicateFromId: post.id,
                          }),
                        });
                        window.location.reload();
                      }}
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      className="text-red-600"
                      onClick={async () => {
                        if (!window.confirm("Delete this post?")) return;
                        await fetch(`/api/orbit/blog/posts/${post.id}`, {
                          method: "DELETE",
                        });
                        window.location.reload();
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href="/orbit/blog/categories"
          className="font-semibold text-[#673de6]"
        >
          Categories
        </Link>
        <Link href="/orbit/blog/tags" className="font-semibold text-[#673de6]">
          Tags
        </Link>
        <Link
          href="/orbit/blog/authors"
          className="font-semibold text-[#673de6]"
        >
          Authors
        </Link>
        <Link href="/orbit/blog/media" className="font-semibold text-[#673de6]">
          Media
        </Link>
        <Link href="/orbit/blog/seo" className="font-semibold text-[#673de6]">
          SEO
        </Link>
      </div>
    </div>
  );
}
