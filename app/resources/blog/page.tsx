import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";

import { BlogCategoryNav } from "@/components/blog/category-nav";
import { BlogEmptyState } from "@/components/blog/blog-empty-state";
import { BlogHero } from "@/components/blog/blog-hero";
import { BlogNewsletter } from "@/components/blog/blog-newsletter";
import { BlogSiteShell } from "@/components/blog/blog-shell";
import { FeaturedBlogPost } from "@/components/blog/featured-post";
import { BlogPostCard } from "@/components/blog/post-card";
import { BLOG_BASE } from "@/lib/blog/paths";
import {
  getBlogHomeFeatured,
  listPublishedCategories,
  listPublishedPosts,
  seedBlogTaxonomyIfEmpty,
} from "@/lib/blog/queries";
import { seedStarterBlogPostsIfEmpty } from "@/lib/blog/seed-posts";
import { blogHomeMetadata } from "@/lib/blog/seo";

export const metadata: Metadata = blogHomeMetadata();

export const dynamic = "force-dynamic";

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  await seedBlogTaxonomyIfEmpty();
  await seedStarterBlogPostsIfEmpty();

  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const page = Number(params.page) || 1;

  const [categories, featuredBundle, listing] = await Promise.all([
    listPublishedCategories(),
    search
      ? Promise.resolve({ post: null, isMarkedFeatured: false })
      : getBlogHomeFeatured(),
    listPublishedPosts({ page, search }),
  ]);

  const featured = featuredBundle.post;
  const categoryNav = categories.map((c) => ({ name: c.name, slug: c.slug }));
  const posts = listing.posts.filter((p) => p.id !== featured?.id);

  return (
    <BlogSiteShell>
      <div className="mx-auto max-w-[1240px] space-y-12">
        <BlogHero initialQuery={search} total={listing.total} />

        {featured && !search ? (
          <FeaturedBlogPost
            post={featured}
            showFeaturedLabel={featuredBundle.isMarkedFeatured}
          />
        ) : null}

        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-[#1a1035] sm:text-[1.75rem]">
                {search
                  ? `Results for “${search}”`
                  : "Latest articles & guides"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {search
                  ? `${listing.total} matching article${listing.total === 1 ? "" : "s"}`
                  : "Practical, tested advice — written by the team that runs the infrastructure."}
              </p>
            </div>
            <Link
              href="/resources/tips"
              className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-[#673de6] hover:border-violet-300"
            >
              Browse tips &amp; guides <ArrowRight className="size-4" />
            </Link>
          </div>

          <BlogCategoryNav categories={categoryNav} />

          {posts.length === 0 ? (
            search ? (
              <div className="rounded-3xl border border-violet-100 bg-white p-10 text-center">
                <SearchX className="mx-auto size-8 text-violet-300" />
                <h3 className="mt-3 text-lg font-bold text-[#1a1035]">
                  No articles match “{search}”
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Try a broader keyword, or browse a category above.
                </p>
                <Link
                  href={BLOG_BASE}
                  className="mt-4 inline-flex rounded-full bg-[#673de6] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  View all articles
                </Link>
              </div>
            ) : (
              <BlogEmptyState search="" />
            )
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {listing.pageCount > 1 ? (
            <nav
              className="flex flex-wrap items-center justify-center gap-2 pt-2"
              aria-label="Pagination"
            >
              {page > 1 ? (
                <Link
                  href={`${BLOG_BASE}?${search ? `search=${encodeURIComponent(search)}&` : ""}page=${page - 1}`}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-violet-200"
                >
                  Previous
                </Link>
              ) : null}
              {Array.from({ length: listing.pageCount }, (_, i) => i + 1).map(
                (p) => (
                  <Link
                    key={p}
                    href={`${BLOG_BASE}?${search ? `search=${encodeURIComponent(search)}&` : ""}page=${p}`}
                    aria-current={p === listing.page ? "page" : undefined}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      p === listing.page
                        ? "bg-[#673de6] text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-violet-200"
                    }`}
                  >
                    {p}
                  </Link>
                ),
              )}
              {page < listing.pageCount ? (
                <Link
                  href={`${BLOG_BASE}?${search ? `search=${encodeURIComponent(search)}&` : ""}page=${page + 1}`}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-violet-200"
                >
                  Next
                </Link>
              ) : null}
            </nav>
          ) : null}
        </section>

        <BlogNewsletter />
      </div>
    </BlogSiteShell>
  );
}
