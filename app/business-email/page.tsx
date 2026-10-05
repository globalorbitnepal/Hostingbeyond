import type { Metadata } from "next";

import { BusinessEmailPageView } from "@/components/business-email/business-email-page";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { siteConfig } from "@/config/site";
import {
  buildPublicPageMetadata,
  getBusinessEmailPageContent,
  getHomeSections,
  getSiteSettings,
} from "@/lib/orbit/content";

const PAGE_PATH = "/business-email";

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicPageMetadata("business-email", PAGE_PATH, {
    title: "Business Email Hosting — Professional Email on Your Domain",
    description:
      "HostingBeyond Mail: AI-powered business email from $0.37/mo. Branded addresses on your domain, secure mail hosting, spam protection, and free migration help.",
    image: "/images/business-email/marketing-reach-hero-v2.jpg",
  });
}

export default async function BusinessEmailPage() {
  const [sections, settings, pageContent] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
    getBusinessEmailPageContent(),
  ]);

  const pageUrl = new URL(PAGE_PATH, siteConfig.url).toString();

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Business Email Hosting | HostingBeyond Mail",
    description:
      "Professional business email on your domain with AI-powered tools, secure hosting, and transparent pricing.",
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    about: {
      "@type": "Service",
      name: "HostingBeyond Mail",
      serviceType: "Business email hosting",
      provider: {
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
      },
    },
  };

  return (
    <div className="hb-band-cream min-h-dvh overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
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
        <BusinessEmailPageView content={pageContent} />
      </main>
      {sections.footer?.visible !== false ? (
        <SiteFooter content={sections.footer} logoPath={settings.logoPath} />
      ) : null}
    </div>
  );
}
