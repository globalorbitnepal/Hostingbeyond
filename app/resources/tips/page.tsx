import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Suspense } from "react";

import { BlogNewsletter } from "@/components/blog/blog-newsletter";
import { BlogSiteShell } from "@/components/blog/blog-shell";
import { TipsCategoryNav } from "@/components/tips/tips-category-nav";
import { TipsEmptyState } from "@/components/tips/tips-empty-state";
import { TipsFeaturedGuide } from "@/components/tips/tips-featured-guide";
import { TipsGuideCard } from "@/components/tips/tips-guide-card";
import { TipsHero } from "@/components/tips/tips-hero";
import { routes } from "@/config/routes";
import { TIP_TOPIC_BLOCKS } from "@/lib/blog/tips-topics";
import {
  countPublishedTips,
  getTipsHomeFeatured,
  listPublishedPosts,
  listTipCategoriesWithPublishedPosts,
  seedBlogTaxonomyIfEmpty,
} from "@/lib/blog/queries";
import { BLOG_BASE, tipsHubPath, TIPS_BASE } from "@/lib/blog/paths";
import { breadcrumbJsonLd, tipsHomeMetadata } from "@/lib/blog/seo";

export const metadata: Metadata = tipsHomeMetadata();

export default async function TipsHubPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
}) {
  await seedBlogTaxonomyIfEmpty();
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  const page = Number(params.page) || 1;
  const isFiltered = Boolean(search || category);

  const [
    totalTips,
    categories,
    featured,
    listing,
    helpful,
    howTo,
    troubleshooting,
  ] = await Promise.all([
    countPublishedTips(),
    listTipCategoriesWithPublishedPosts(),
    search || category ? Promise.resolve(null) : getTipsHomeFeatured(),
    listPublishedPosts({
      page,
      search,
      categorySlug: category || undefined,
      contentType: "TIP",
    }),
    !isFiltered
      ? listPublishedPosts({
          page: 1,
          contentType: "TIP",
          orderBy: "views",
        })
      : Promise.resolve(null),
    !isFiltered
      ? listPublishedPosts({
          page: 1,
          contentType: "TIP",
          guideTypes: ["HOW_TO", "STEP_BY_STEP"],
        })
      : Promise.resolve(null),
    !isFiltered
      ? listPublishedPosts({
          page: 1,
          contentType: "TIP",
          guideTypes: ["TROUBLESHOOTING"],
        })
      : Promise.resolve(null),
  ]);

  const activeCategory = categories.find((c) => c.slug === category);
  const latestPosts = listing.posts.filter((p) => p.id !== featured?.id);
  const helpfulPosts = (() => {
    if (!helpful?.posts.length) return [];
    const withViews = helpful.posts.filter((p) => p.viewCount > 0);
    return (withViews.length ? withViews : helpful.posts).slice(0, 3);
  })();
  const showHelpful = helpfulPosts.length > 0 && !isFiltered;

  const topicBlocks = TIP_TOPIC_BLOCKS.filter((block) =>
    categories.some((c) => c.slug === block.slug && c.count > 0),
  );

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Resources", path: "/resources" },
    { name: "Tips", path: TIPS_BASE },
  ]);

  return (
    <BlogSiteShell>
      <Script
        id="tips-hub-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <div className="mx-auto max-w-[1320px] space-y-10 px-1 sm:px-0">
        <TipsHero
          initialQuery={search}
          category={category || undefined}
          compact={Boolean(search)}
        />

        <Suspense fallback={null}>
          <TipsCategoryNav categories={categories} search={search} />
        </Suspense>

        {search ? (
          <section>
            <h2 className="text-lg font-bold text-[#1a1035]">
              Search results for &ldquo;{search}&rdquo; ({listing.total})
            </h2>
          </section>
        ) : null}

        {category && activeCategory ? (
          <section>
            <h2 className="text-2xl font-bold text-[#1a1035]">
              {activeCategory.name} Tips &amp; Guides
            </h2>
            {activeCategory.description ? (
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                {activeCategory.description}
              </p>
            ) : null}
          </section>
        ) : null}

        {featured && !isFiltered ? <TipsFeaturedGuide post={featured} /> : null}

        {showHelpful ? (
          <section>
            <h2 className="text-xl font-bold text-[#1a1035]">
              Most Helpful Guides
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {helpfulPosts.map((post) => (
                <TipsGuideCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        ) : null}

        <section id="latest-guides">
          <h2 className="text-xl font-bold text-[#1a1035]">
            {isFiltered ? "Guides" : "Latest Guides"}
          </h2>
          {latestPosts.length === 0 ? (
            <div className="mt-6">
              <TipsEmptyState search={search} hasAnyTips={totalTips > 0} />
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <TipsGuideCard key={post.id} post={post} />
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
                    href={tipsHubPath({
                      search: search || undefined,
                      category: category || undefined,
                      page: p,
                    })}
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

        {!isFiltered && howTo && howTo.posts.length > 0 ? (
          <section>
            <h2 className="text-xl font-bold text-[#1a1035]">How-To Guides</h2>
            <p className="mt-1 text-sm text-slate-600">
              Step-by-step tutorials for hosting, domains, WordPress and more.
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {howTo.posts.slice(0, 4).map((post) => (
                <TipsGuideCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        ) : null}

        {!isFiltered && troubleshooting && troubleshooting.posts.length > 0 ? (
          <section>
            <h2 className="text-xl font-bold text-[#1a1035]">
              Quick Fixes &amp; Troubleshooting
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {troubleshooting.posts.slice(0, 4).map((post) => (
                <TipsGuideCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        ) : null}

        {!isFiltered && topicBlocks.length > 0 ? (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topicBlocks.map((block) => (
              <div
                key={block.slug}
                className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-bold text-[#1a1035]">
                  {block.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {block.description}
                </p>
                <Link
                  href={tipsHubPath({ category: block.slug })}
                  className="mt-4 inline-flex text-sm font-semibold text-[#673de6] hover:underline"
                >
                  {block.cta} →
                </Link>
              </div>
            ))}
          </section>
        ) : null}

        {totalTips === 0 && !search ? (
          <TipsEmptyState hasAnyTips={false} />
        ) : null}

        <section className="rounded-2xl border border-violet-100 bg-violet-50/40 p-6 text-center sm:p-8">
          <p className="text-sm font-semibold text-[#673de6]">
            Ready to put these guides into action?
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              href={routes.hosting}
              className="rounded-full bg-[#673de6] px-5 py-2.5 text-sm font-semibold text-white"
            >
              View Hosting Plans
            </Link>
            <Link
              href={routes.domains}
              className="rounded-full border border-violet-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#673de6]"
            >
              Search Your Domain
            </Link>
            <Link
              href={BLOG_BASE}
              className="rounded-full border border-violet-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700"
            >
              Read the Blog
            </Link>
          </div>
        </section>

        <BlogNewsletter />
      </div>
    </BlogSiteShell>
  );
}
