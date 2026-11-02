import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { scoreBlogSeo } from "@/lib/blog/seo-score";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "SEO settings | Orbit",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function OrbitBlogSeoPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      contentHtml: true,
      status: true,
      updatedAt: true,
      seoTitle: true,
      seoDescription: true,
      focusKeyword: true,
      featuredImageUrl: true,
      featuredImageAlt: true,
      noIndex: true,
    },
  });

  const scored = posts.map((post) => ({
    ...post,
    seo: scoreBlogSeo({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      contentHtml: post.contentHtml,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      focusKeyword: post.focusKeyword,
      coverImageUrl: post.featuredImageUrl,
      coverImageAlt: post.featuredImageAlt,
    }),
  }));

  scored.sort((a, b) => a.seo.score - b.seo.score);
  const needsWork = scored.filter((p) => p.seo.score < 70);
  const average =
    scored.length > 0
      ? Math.round(
          scored.reduce((sum, post) => sum + post.seo.score, 0) / scored.length,
        )
      : 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1d2327]">
          Blog SEO
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Every article is scored on the same 16 checks used inside the editor.
          Fix the lowest scores first.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Average SEO score</p>
          <p className="mt-1 text-3xl font-bold text-[#1d2327]">{average}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Articles scored</p>
          <p className="mt-1 text-3xl font-bold text-[#1d2327]">
            {scored.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Below 70 (needs work)</p>
          <p className="mt-1 text-3xl font-bold text-amber-600">
            {needsWork.length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/60 text-[11px] tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Article</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Grade</th>
              <th className="px-4 py-3">Biggest gap</th>
              <th className="px-4 py-3 text-right">Fix</th>
            </tr>
          </thead>
          <tbody>
            {scored.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No articles yet.{" "}
                  <Link
                    href="/orbit/blog/new"
                    className="font-semibold text-[#2271b1]"
                  >
                    Write the first one
                  </Link>
                  .
                </td>
              </tr>
            ) : null}
            {scored.map((post) => {
              const gaps = post.seo.checks
                .filter((c) => c.status !== "good")
                .sort((a, b) => b.max - a.max);
              return (
                <tr key={post.id} className="border-b border-slate-50">
                  <td className="max-w-[360px] px-4 py-3">
                    <p className="truncate font-semibold text-[#1d2327]">
                      {post.title}
                    </p>
                    <p className="truncate text-[11px] text-slate-400">
                      /resources/blog/{post.slug} · {post.status.toLowerCase()}
                      {post.noIndex ? " · noindex" : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold",
                        post.seo.score >= 85
                          ? "bg-emerald-100 text-emerald-800"
                          : post.seo.score >= 60
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-700",
                      )}
                    >
                      {post.seo.score}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {post.seo.grade}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {gaps[0]?.label ?? "All checks passed"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/orbit/blog/${post.id}/edit`}
                      className="text-xs font-semibold text-[#2271b1] hover:underline"
                    >
                      Open editor
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
        <p className="font-semibold text-slate-800">Technical endpoints</p>
        <ul className="mt-2 space-y-1">
          <li>
            Public blog: <code className="text-[#2271b1]">/resources/blog</code>
          </li>
          <li>
            RSS feed:{" "}
            <code className="text-[#2271b1]">/resources/blog/rss.xml</code>
          </li>
          <li>
            Sitemap: <code className="text-[#2271b1]">/sitemap.xml</code>
          </li>
          <li>Drafts preview through secure tokens and stay noindex.</li>
        </ul>
      </div>
    </div>
  );
}
