import Script from "next/script";

import { EditorialPageView } from "@/components/editorial/editorial-page-view";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { breadcrumbJsonLd } from "@/lib/blog/seo";
import { getEditorialPageContent } from "@/lib/orbit/content";
import {
  editorialPageBySlug,
  type EditorialSlug,
} from "@/lib/orbit/editorial-page-content";
import {
  getLocalizedPublicChrome,
  localizeForPreferences,
} from "@/lib/i18n/public-chrome";

export async function EditorialPublicPage({ slug }: { slug: EditorialSlug }) {
  const meta = editorialPageBySlug(slug);
  const [{ sections, settings, preferences }, raw] = await Promise.all([
    getLocalizedPublicChrome(),
    getEditorialPageContent(slug),
  ]);
  const content = localizeForPreferences(preferences, raw);
  const crumbs = [
    { name: "Home", path: "/" },
    meta?.category === "company"
      ? { name: "Company", path: "/about" }
      : { name: "Resources", path: "/resources" },
    { name: meta?.label || content.eyebrow, path: meta?.path || "/" },
  ];

  const faqJsonLd =
    content.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: content.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }
      : null;

  return (
    <div className="hb-band-cream min-h-dvh overflow-x-hidden text-[#1a1035]">
      <Script
        id={`${slug}-breadcrumb-jsonld`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(crumbs)),
        }}
      />
      {faqJsonLd ? (
        <Script
          id={`${slug}-faq-jsonld`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}
      <div className="hb-band-purple">
        <SiteHeader
          navigation={sections.navigation}
          loginLabel={settings.loginLabel}
          loginHref={settings.loginHref}
          getStartedLabel={settings.getStartedLabel}
          getStartedHref={settings.getStartedHref}
          logoPath={settings.logoPath}
        />
      </div>
      <main id="main-content">
        <EditorialPageView content={content} />
      </main>
      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
