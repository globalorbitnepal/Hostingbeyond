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
import {
  TipsCtaBand,
  TipsFaqSection,
  TipsIntroSection,
  TipsLearningPathsGrid,
  TipsPillarsGrid,
  TipsStatsBand,
} from "@/components/tips/tips-hub-sections";
import { TipsPremiumHero } from "@/components/tips/tips-premium-hero";
import { buildMetadata } from "@/lib/metadata";
import { BLOG_BASE, tipsHubPath, TIPS_BASE } from "@/lib/blog/paths";
import {
  countPublishedTips,
  getTipsHomeFeatured,
  listPublishedPosts,
  listTipCategoriesWithPublishedPosts,
  seedBlogTaxonomyIfEmpty,
} from "@/lib/blog/queries";
import { breadcrumbJsonLd } from "@/lib/blog/seo";
import { getTipsHubPageContent } from "@/lib/orbit/content";
import { siteConfig } from "@/config/site";

export async function generateMetadata(): Promise<Metadata> {
  const hub = await getTipsHubPageContent();
  return buildMetadata({
    title: hub.seoTitle,
    description: hub.seoDescription,
    path: TIPS_BASE,
  });
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      {eyebrow ? (
        <p className="text-xs font-bold tracking-[0.2em] text-[#673de6] uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#1a1035]">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>
      ) : null}
    </div>
  );
}

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
  const hub = await getTipsHubPageContent();
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

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Resources", path: "/resources" },
    { name: "Tips", path: TIPS_BASE },
  ]);

  const faqJsonLd =
    !isFiltered && hub.faqs.length
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: hub.faqs
            .filter((f) => f.visible !== false && f.question && f.answer)
            .map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
        }
      : null;

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: hub.seoTitle,
    description: hub.seoDescription,
    url: new URL(TIPS_BASE, siteConfig.url).toString(),
    isPartOf: {
      "@type": "WebSite",
      name: "HostingBeyond",
      url: siteConfig.url,
    },
  };

  return (
    <BlogSiteShell>
      <Script
        id="tips-hub-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <Script
        id="tips-hub-webpage-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      {faqJsonLd ? (
        <Script
          id="tips-hub-faq-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}

      <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2">
        <TipsPremiumHero
          content={hub}
          initialQuery={search}
          category={category || undefined}
          compact={Boolean(search)}
        />
      </div>

      <div className="mx-auto mt-10 max-w-[1320px] space-y-14 px-1 sm:px-0">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-[#673de6]">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/resources" className="hover:text-[#673de6]">
                Resources
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="font-medium text-[#1a1035]">Tips</li>
          </ol>
        </nav>

        {!isFiltered ? (
          <>
            <TipsStatsBand content={hub} />
            <TipsIntroSection content={hub} />
            <TipsLearningPathsGrid content={hub} />
          </>
        ) : null}

        <Suspense fallback={null}>
          <TipsCategoryNav categories={categories} search={search} />
        </Suspense>

        {search ? (
          <section>
            <SectionTitle
              title={`Search results for “${search}”`}
              description={`${listing.total} guide${listing.total === 1 ? "" : "s"} found`}
            />
          </section>
        ) : null}

        {category && activeCategory ? (
          <section>
            <SectionTitle
              title={`${activeCategory.name} tips & guides`}
              description={activeCategory.description}
            />
          </section>
        ) : null}

        {featured && !isFiltered ? <TipsFeaturedGuide post={featured} /> : null}

        {showHelpful ? (
          <section>
            <SectionTitle
              eyebrow="Community"
              title="Most helpful guides"
              description="Popular tutorials based on real reader visits."
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {helpfulPosts.map((post) => (
                <TipsGuideCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        ) : null}

        <section id="latest-guides">
          <SectionTitle
            eyebrow="Library"
            title={isFiltered ? "Guides" : "Latest guides"}
            description={
              isFiltered
                ? undefined
                : "Newest practical tutorials from HostingBeyond."
            }
          />
          {latestPosts.length === 0 ? (
            <TipsEmptyState search={search} hasAnyTips={totalTips > 0} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                        ? "bg-[#673de6] text-white shadow-md"
                        : "border border-violet-100 bg-white text-slate-700 hover:border-violet-200"
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
            <SectionTitle
              eyebrow="How-to"
              title="Step-by-step tutorials"
              description="Actionable walkthroughs for WordPress, hosting, DNS and more."
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {howTo.posts.slice(0, 4).map((post) => (
                <TipsGuideCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        ) : null}

        {!isFiltered && troubleshooting && troubleshooting.posts.length > 0 ? (
          <section>
            <SectionTitle
              eyebrow="Support"
              title="Quick fixes & troubleshooting"
              description="Resolve DNS, SSL, downtime and email issues faster."
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {troubleshooting.posts.slice(0, 4).map((post) => (
                <TipsGuideCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        ) : null}

        {!isFiltered ? <TipsPillarsGrid content={hub} /> : null}

        {totalTips === 0 && !search && !category ? (
          <TipsEmptyState hasAnyTips={false} />
        ) : null}

        {!isFiltered ? <TipsFaqSection content={hub} /> : null}

        <TipsCtaBand content={hub} />

        <p className="text-center text-sm text-slate-500">
          Looking for editorial stories?{" "}
          <Link href={BLOG_BASE} className="font-semibold text-[#673de6]">
            Visit the HostingBeyond blog →
          </Link>
        </p>

        <BlogNewsletter />
      </div>
    </BlogSiteShell>
  );
}
