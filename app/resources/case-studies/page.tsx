import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Suspense } from "react";

import { BlogNewsletter } from "@/components/blog/blog-newsletter";
import { BlogSiteShell } from "@/components/blog/blog-shell";
import { CaseStudiesPremiumHero } from "@/components/case-studies/case-studies-premium-hero";
import {
  CaseStudiesCtaBand,
  CaseStudiesFaqSection,
  CaseStudiesIndustryNav,
  CaseStudiesIntroSection,
  CaseStudiesLibrary,
  CaseStudiesMethodology,
  CaseStudiesPillars,
  CaseStudiesStatsBand,
} from "@/components/case-studies/case-studies-hub-sections";
import { CaseStudiesSearch } from "@/components/case-studies/case-studies-search";
import { CASE_STUDIES_BASE } from "@/lib/case-studies/paths";
import { breadcrumbJsonLd } from "@/lib/blog/seo";
import { buildMetadata } from "@/lib/metadata";
import { getCaseStudiesHubPageContent } from "@/lib/orbit/content";
import type { CmsCaseStudyEntry } from "@/lib/orbit/case-studies-hub-page-content";
import { siteConfig } from "@/config/site";

export async function generateMetadata(): Promise<Metadata> {
  const hub = await getCaseStudiesHubPageContent();
  return buildMetadata({
    title: hub.seoTitle,
    description: hub.seoDescription,
    path: CASE_STUDIES_BASE,
  });
}

function filterCaseStudies(
  studies: CmsCaseStudyEntry[],
  opts: { industry?: string; search?: string },
) {
  let rows = studies.filter((s) => s.visible !== false && s.title.trim());
  if (opts.industry) {
    rows = rows.filter(
      (s) => s.industry.toLowerCase() === opts.industry!.toLowerCase(),
    );
  }
  if (opts.search) {
    const q = opts.search.toLowerCase();
    rows = rows.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.clientName.toLowerCase().includes(q) ||
        s.industry.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.challenge.toLowerCase().includes(q) ||
        s.solution.toLowerCase().includes(q) ||
        s.services.some((svc) => svc.toLowerCase().includes(q)),
    );
  }
  return rows;
}

function uniqueIndustries(studies: CmsCaseStudyEntry[]) {
  const set = new Set<string>();
  for (const s of studies) {
    if (s.visible !== false && s.industry.trim()) set.add(s.industry.trim());
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export default async function CaseStudiesHubPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; industry?: string }>;
}) {
  const hub = await getCaseStudiesHubPageContent();
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const industry = params.industry?.trim() ?? "";
  const isFiltered = Boolean(search || industry);

  const visible = hub.caseStudies.filter((s) => s.visible !== false);
  const industries = uniqueIndustries(visible);
  const library = filterCaseStudies(hub.caseStudies, { industry, search });

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Resources", path: "/resources" },
    { name: "Case studies", path: CASE_STUDIES_BASE },
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
    url: new URL(CASE_STUDIES_BASE, siteConfig.url).toString(),
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
          name: "HostingBeyond customer case studies",
          itemListElement: library.map((study, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: study.title,
            description: study.summary,
            url: new URL(
              `${CASE_STUDIES_BASE}#case-study-${study.id}`,
              siteConfig.url,
            ).toString(),
          })),
        }
      : null;

  return (
    <BlogSiteShell>
      <Script
        id="case-studies-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <Script
        id="case-studies-webpage-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      {itemListJsonLd ? (
        <Script
          id="case-studies-itemlist-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      ) : null}
      {faqJsonLd ? (
        <Script
          id="case-studies-faq-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}

      <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2">
        <CaseStudiesPremiumHero content={hub} />
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
            <li className="font-medium text-[#1a1035]">Case studies</li>
          </ol>
        </nav>

        {!isFiltered ? (
          <>
            <CaseStudiesStatsBand content={hub} />
            <CaseStudiesIntroSection content={hub} />
          </>
        ) : null}

        <div className="max-w-xl">
          <Suspense fallback={null}>
            <CaseStudiesSearch initialQuery={search} industry={industry} />
          </Suspense>
        </div>

        <CaseStudiesIndustryNav
          industries={industries}
          active={industry}
          search={search}
        />

        <section id="case-studies-library">
          {isFiltered ? (
            <h2 className="mb-6 text-2xl font-extrabold text-[#1a1035]">
              {search
                ? `Results for “${search}”`
                : industry
                  ? `${industry} case studies`
                  : "Case studies"}
            </h2>
          ) : (
            <h2 className="mb-6 text-2xl font-extrabold text-[#1a1035]">
              Customer case study library
            </h2>
          )}
          <CaseStudiesLibrary studies={library} />
        </section>

        {!isFiltered ? (
          <>
            <CaseStudiesMethodology content={hub} />
            <CaseStudiesPillars content={hub} />
            <CaseStudiesFaqSection content={hub} />
          </>
        ) : null}

        <CaseStudiesCtaBand content={hub} />
        <BlogNewsletter />
      </div>
    </BlogSiteShell>
  );
}
