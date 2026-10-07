import type { Metadata } from "next";
import Link from "next/link";

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
import { blogHomeMetadata } from "@/lib/blog/seo";

export const metadata: Metadata = blogHomeMetadata();

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  await seedBlogTaxonomyIfEmpty();
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
  const excludeFeatured = featured?.id;

  const posts = listing.posts.filter((p) => p.id !== excludeFeatured);

  return (
    <BlogSiteShell>
      <div className="mx-auto max-w-[1240px] space-y-10">
        <BlogHero initialQuery={search} />

        {featured && !search ? (
          <FeaturedBlogPost
            post={featured}
            showFeaturedLabel={featuredBundle.isMarkedFeatured}
          />
        ) : null}

        <BlogCategoryNav categories={categoryNav} />

        <section>
          <h2 className="text-xl font-bold text-[#1a1035]">
            {search
              ? `Results for “${search}” (${listing.total})`
              : "Latest from HostingBeyond"}
          </h2>
          {posts.length === 0 ? (
            <BlogEmptyState search={search} />
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {listing.pageCount > 1 ? (
            <nav
              className="mt-10 flex flex-wrap items-center justify-center gap-2"
              aria-label="Pagination"
            >
              {Array.from({ length: listing.pageCount }, (_, i) => i + 1).map(
                (p) => (
                  <Link
                    key={p}
                    href={`${BLOG_BASE}?${search ? `search=${encodeURIComponent(search)}&` : ""}page=${p}`}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      p === listing.page
                        ? "bg-[#673de6] text-white"
                        : "border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {p}
                  </Link>
                ),
              )}
            </nav>
          ) : null}
        </section>

        <BlogNewsletter />
      </div>
    </BlogSiteShell>
  );
}
