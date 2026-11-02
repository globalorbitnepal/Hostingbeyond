import type { Metadata } from "next";
import Script from "next/script";

import { AboutPageView } from "@/components/about/about-page-view";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { breadcrumbJsonLd } from "@/lib/blog/seo";
import { buildMetadata } from "@/lib/metadata";
import {
  getLocalizedPublicChrome,
  localizeForPreferences,
} from "@/lib/i18n/public-chrome";
import { getAboutPageContent } from "@/lib/orbit/content";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAboutPageContent();
  return buildMetadata({
    title: about.seoTitle,
    description: about.seoDescription,
    path: routes.about,
    image: "/images/hosting/cloud.jpg",
  });
}

export default async function AboutPage() {
  const [{ sections, settings, preferences }, content] = await Promise.all([
    getLocalizedPublicChrome(),
    getAboutPageContent(),
  ]);
  const localized = localizeForPreferences(preferences, content);

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "About", path: routes.about },
  ]);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: localized.legalEntityName || localized.companyLegalName,
    legalName: localized.legalEntityName || localized.companyLegalName,
    url: siteConfig.url,
    description: localized.seoDescription,
    slogan: siteConfig.tagline,
    foundingLocation: {
      "@type": "Country",
      name: "United States",
    },
    areaServed: "Worldwide",
    contactPoint: localized.legalContactEmail
      ? {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: localized.legalContactEmail,
          availableLanguage: ["English"],
        }
      : undefined,
  };

  const faqJsonLd =
    localized.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: localized.faqs
            .filter((f) => f.visible !== false && f.question && f.answer)
            .map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
        }
      : null;

  return (
    <div className="hb-band-cream min-h-dvh overflow-x-hidden text-[#1a1035]">
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
        <AboutPageView content={localized} />
      </main>

      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
