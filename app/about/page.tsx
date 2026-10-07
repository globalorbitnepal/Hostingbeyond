import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { AboutPremiumHero } from "@/components/about/about-premium-hero";
import {
  AboutCommitment,
  AboutCtaBand,
  AboutFaqSection,
  AboutMilestones,
  AboutMissionVision,
  AboutProductsGrid,
  AboutStatsBand,
  AboutStorySection,
  AboutTeamSection,
  AboutTrustSection,
  AboutUsaSection,
  AboutValuesGrid,
} from "@/components/about/about-page-sections";
import { BlogSiteShell } from "@/components/blog/blog-shell";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { breadcrumbJsonLd } from "@/lib/blog/seo";
import { buildMetadata } from "@/lib/metadata";
import { getAboutPageContent } from "@/lib/orbit/content";

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAboutPageContent();
  return buildMetadata({
    title: about.seoTitle,
    description: about.seoDescription,
    path: routes.about,
  });
}

export default async function AboutPage() {
  const content = await getAboutPageContent();

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "About", path: routes.about },
  ]);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: content.companyLegalName || siteConfig.name,
    url: siteConfig.url,
    description: content.seoDescription,
    slogan: siteConfig.tagline,
    areaServed: "Worldwide",
    foundingLocation: {
      "@type": "Country",
      name: "United States",
    },
  };

  const faqJsonLd =
    content.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: content.faqs
            .filter((f) => f.visible !== false && f.question && f.answer)
            .map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
        }
      : null;

  return (
    <BlogSiteShell>
      <Script
        id="about-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <Script
        id="about-organization-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      {faqJsonLd ? (
        <Script
          id="about-faq-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}

      <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2">
        <AboutPremiumHero content={content} />
      </div>

      <div className="mx-auto mt-10 max-w-[1320px] space-y-16 px-1 sm:px-0">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-[#673de6]">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="font-medium text-[#1a1035]">About</li>
          </ol>
        </nav>

        <AboutStatsBand content={content} />
        <AboutMissionVision content={content} />
        <AboutUsaSection content={content} />
        <AboutStorySection content={content} />
        <AboutValuesGrid content={content} />
        <AboutProductsGrid content={content} />
        <AboutMilestones content={content} />
        <AboutTeamSection content={content} />
        <AboutTrustSection content={content} />
        <AboutCommitment content={content} />
        <AboutFaqSection content={content} />
        <AboutCtaBand content={content} />
      </div>
    </BlogSiteShell>
  );
}
