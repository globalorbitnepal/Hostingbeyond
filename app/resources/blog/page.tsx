import type { Metadata } from "next";
import Link from "next/link";

import { BlogCategoryNav } from "@/components/blog/category-nav";
import { BlogNewsletter } from "@/components/blog/blog-newsletter";
import { BlogSearch } from "@/components/blog/blog-search";
import { BlogSiteShell } from "@/components/blog/blog-shell";
import { FeaturedBlogPost } from "@/components/blog/featured-post";
import { BlogPostCard } from "@/components/blog/post-card";
import { BLOG_BASE } from "@/lib/blog/paths";
import {
  getFeaturedPost,
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

  const [categories, featured, listing] = await Promise.all([
    listPublishedCategories(),
    search ? Promise.resolve(null) : getFeaturedPost(),
    listPublishedPosts({ page, search }),
  ]);

  const categoryNav = categories.map((c) => ({ name: c.name, slug: c.slug }));
  const excludeFeatured = featured?.id;

  const posts = listing.posts.filter((p) => p.id !== excludeFeatured);

  return (
    <BlogSiteShell>
      <div className="mx-auto max-w-[1240px] space-y-10">
        <header className="max-w-3xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1035] sm:text-4xl">
            HostingBeyond Blog
          </h1>
          <p className="mt-3 text-lg font-semibold text-[#673de6]">
            Build smarter. Host better. Grow online.
          </p>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Practical guides, hosting insights, domain tips, WordPress
            tutorials, security advice, and website performance resources.
          </p>
          <div className="mt-6">
            <BlogSearch initialQuery={search} />
          </div>
        </header>

        {featured && !search ? <FeaturedBlogPost post={featured} /> : null}

        <BlogCategoryNav categories={categoryNav} />

        <section>
          <h2 className="text-xl font-bold text-[#1a1035]">
            {search ? `Results for “${search}”` : "Latest from HostingBeyond"}
          </h2>
          {posts.length === 0 ? (
            <p className="mt-6 text-slate-600">
              No articles yet. Check back soon.
            </p>
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
