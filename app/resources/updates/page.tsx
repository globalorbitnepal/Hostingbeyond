import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { BlogNewsletter } from "@/components/blog/blog-newsletter";
import { BlogSiteShell } from "@/components/blog/blog-shell";
import { UpdatesPremiumHero } from "@/components/updates/updates-premium-hero";
import { UpdatesSearch } from "@/components/updates/updates-search";
import {
  UpdatesCategoryNav,
  UpdatesCtaBand,
  UpdatesFaqSection,
  UpdatesIntroSection,
  UpdatesPillars,
  UpdatesRoadmap,
  UpdatesStatsBand,
  UpdatesTimeline,
} from "@/components/updates/updates-hub-sections";
import { BLOG_BASE, TIPS_BASE } from "@/lib/blog/paths";
import { breadcrumbJsonLd } from "@/lib/blog/seo";
import { buildMetadata } from "@/lib/metadata";
import { getUpdatesHubPageContent } from "@/lib/orbit/content";
import type { CmsUpdateEntry } from "@/lib/orbit/updates-hub-page-content";
import { UPDATES_BASE } from "@/lib/updates/paths";
import { siteConfig } from "@/config/site";

export async function generateMetadata(): Promise<Metadata> {
  const hub = await getUpdatesHubPageContent();
  return buildMetadata({
    title: hub.seoTitle,
    description: hub.seoDescription,
    path: UPDATES_BASE,
  });
}

function filterUpdates(
  updates: CmsUpdateEntry[],
  opts: { category?: string; search?: string },
) {
  let rows = updates.filter((u) => u.visible !== false && u.title.trim());
  if (opts.category) {
    rows = rows.filter(
      (u) => u.category.toLowerCase() === opts.category!.toLowerCase(),
    );
  }
  if (opts.search) {
    const q = opts.search.toLowerCase();
    rows = rows.filter(
      (u) =>
        u.title.toLowerCase().includes(q) ||
        u.excerpt.toLowerCase().includes(q) ||
        (u.body?.toLowerCase().includes(q) ?? false) ||
        u.category.toLowerCase().includes(q),
    );
  }
  return rows.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export default async function UpdatesHubPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const hub = await getUpdatesHubPageContent();
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  const isFiltered = Boolean(search || category);

  const timeline = filterUpdates(hub.updates, { category, search });

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Resources", path: "/resources" },
    { name: "Updates", path: UPDATES_BASE },
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
    url: new URL(UPDATES_BASE, siteConfig.url).toString(),
  };

  return (
    <BlogSiteShell>
      <Script
        id="updates-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <Script
        id="updates-webpage-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      {faqJsonLd ? (
        <Script
          id="updates-faq-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}

      <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2">
        <UpdatesPremiumHero content={hub} />
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
            <li className="font-medium text-[#1a1035]">Updates</li>
          </ol>
        </nav>

        {!isFiltered ? (
          <>
            <UpdatesStatsBand content={hub} />
            <UpdatesIntroSection content={hub} />
          </>
        ) : null}

        <div className="max-w-xl">
          <UpdatesSearch
            initialQuery={search}
            category={category || undefined}
          />
        </div>

        <UpdatesCategoryNav
          categories={hub.categories}
          activeSlug={category}
          search={search}
        />

        {search ? (
          <p className="text-sm text-slate-600">
            {timeline.length} result{timeline.length === 1 ? "" : "s"} for
            &ldquo;{search}&rdquo;
          </p>
        ) : null}

        {category ? (
          <h2 className="text-2xl font-extrabold text-[#1a1035] capitalize">
            {category} updates
          </h2>
        ) : (
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-[#673de6] uppercase">
              Changelog
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-[#1a1035]">
              Latest product updates
            </h2>
          </div>
        )}

        <UpdatesTimeline entries={timeline} />

        {!isFiltered ? (
          <>
            <UpdatesPillars content={hub} />
            <UpdatesRoadmap content={hub} />
            <UpdatesFaqSection content={hub} />
          </>
        ) : null}

        <UpdatesCtaBand content={hub} />

        <p className="text-center text-sm text-slate-500">
          <Link href={TIPS_BASE} className="font-semibold text-[#673de6]">
            Tips &amp; guides
          </Link>
          {" · "}
          <Link href={BLOG_BASE} className="font-semibold text-[#673de6]">
            Blog
          </Link>
        </p>

        <BlogNewsletter />
      </div>
    </BlogSiteShell>
  );
}
