import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { BlogNewsletter } from "@/components/blog/blog-newsletter";
import { BlogSiteShell } from "@/components/blog/blog-shell";
import {
  DocsArticleLibrary,
  DocsCategoryNav,
  DocsCtaBand,
  DocsFaqSection,
  DocsIntroSection,
  DocsPillars,
  DocsScopeSection,
  DocsStandardsSection,
  DocsStatsBand,
} from "@/components/docs/docs-hub-sections";
import { DocsPremiumHero } from "@/components/docs/docs-premium-hero";
import { DocsSearch } from "@/components/docs/docs-search";
import { breadcrumbJsonLd } from "@/lib/blog/seo";
import { DOCS_BASE } from "@/lib/docs/paths";
import { buildMetadata } from "@/lib/metadata";
import { getDocsHubPageContent } from "@/lib/orbit/content";
import type { CmsDocArticle } from "@/lib/orbit/docs-hub-page-content";
import { siteConfig } from "@/config/site";
import { BLOG_BASE, TIPS_BASE } from "@/lib/blog/paths";
import { CASE_STUDIES_BASE } from "@/lib/case-studies/paths";
import { GROWTH_BASE } from "@/lib/growth/paths";
import { UPDATES_BASE } from "@/lib/updates/paths";

export async function generateMetadata(): Promise<Metadata> {
  const hub = await getDocsHubPageContent();
  return buildMetadata({
    title: hub.seoTitle,
    description: hub.seoDescription,
    path: DOCS_BASE,
  });
}

function filterArticles(
  articles: CmsDocArticle[],
  opts: { category?: string; search?: string },
) {
  let rows = articles.filter((p) => p.visible !== false && p.title.trim());
  if (opts.category) {
    rows = rows.filter(
      (p) => p.category.toLowerCase() === opts.category!.toLowerCase(),
    );
  }
  if (opts.search) {
    const q = opts.search.toLowerCase();
    rows = rows.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.bullets.some((b) => b.text.toLowerCase().includes(q)),
    );
  }
  return rows;
}

export default async function DocsHubPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const hub = await getDocsHubPageContent();
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  const isFiltered = Boolean(search || category);

  const library = filterArticles(hub.articles, { category, search });

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Resources", path: "/resources" },
    { name: "Documentation", path: DOCS_BASE },
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
    "@type": "CollectionPage",
    name: hub.seoTitle,
    description: hub.seoDescription,
    url: new URL(DOCS_BASE, siteConfig.url).toString(),
    isPartOf: {
      "@type": "WebSite",
      name: "HostingBeyond",
      url: siteConfig.url,
    },
  };

  const itemListJsonLd =
    library.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "HostingBeyond product documentation",
          itemListElement: library.map((entry, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: entry.title,
            description: entry.excerpt,
            url: new URL(
              `${DOCS_BASE}#doc-${entry.id}`,
              siteConfig.url,
            ).toString(),
          })),
        }
      : null;

  return (
    <BlogSiteShell>
      <Script
        id="docs-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <Script
        id="docs-webpage-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      {itemListJsonLd ? (
        <Script
          id="docs-itemlist-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      ) : null}
      {faqJsonLd ? (
        <Script
          id="docs-faq-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}

      <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2">
        <DocsPremiumHero content={hub} />
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
            <li className="font-medium text-[#1a1035]">Documentation</li>
          </ol>
        </nav>

        {!isFiltered ? (
          <>
            <DocsStatsBand content={hub} />
            <DocsIntroSection content={hub} />
            <DocsScopeSection content={hub} />
          </>
        ) : null}

        <div className="max-w-xl">
          <DocsSearch initialQuery={search} category={category || undefined} />
        </div>

        <DocsCategoryNav
          categories={hub.categories}
          activeSlug={category}
          search={search}
        />

        {search ? (
          <p className="text-sm text-slate-600">
            {library.length} result{library.length === 1 ? "" : "s"} for &ldquo;
            {search}&rdquo;
          </p>
        ) : null}

        <section id="documentation">
          {category ? (
            <h2 className="mb-6 text-2xl font-extrabold text-[#1a1035] capitalize">
              {category} documentation
            </h2>
          ) : (
            <div className="mb-6">
              <p className="text-xs font-bold tracking-[0.2em] text-[#673de6] uppercase">
                Reference library
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-[#1a1035]">
                Product documentation
              </h2>
            </div>
          )}
          <DocsArticleLibrary articles={library} />
        </section>

        {!isFiltered ? (
          <>
            <DocsStandardsSection content={hub} />
            <DocsPillars content={hub} />
            <DocsFaqSection content={hub} />
          </>
        ) : null}

        <DocsCtaBand content={hub} />

        <p className="text-center text-sm text-slate-500">
          <Link href={TIPS_BASE} className="font-semibold text-[#673de6]">
            Tips &amp; guides
          </Link>
          {" · "}
          <Link href={GROWTH_BASE} className="font-semibold text-[#673de6]">
            Growth hub
          </Link>
          {" · "}
          <Link href={UPDATES_BASE} className="font-semibold text-[#673de6]">
            Updates
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
