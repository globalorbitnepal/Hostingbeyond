import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { DeveloperHostingPageView } from "@/components/hosting/developer-hosting-page";
import { HostingProductSiteShell } from "@/components/hosting/hosting-product-site-shell";
import { getHostingProductBySlug } from "@/lib/hosting/hosting-products";
import { dbPlansToCmsHostingPlans } from "@/lib/hosting/plans-to-cms";
import { normalizePlanFeatures } from "@/lib/hosting/plan-claims";
import { getDeveloperHostingContent } from "@/lib/orbit/content";
import {
  DEVELOPER_STACK_PATHS,
  type DeveloperStackKey,
} from "@/lib/orbit/developer-hosting-content";
import { buildPublicPageMetadata } from "@/lib/orbit/content";
import {
  getLocalizedPublicChrome,
  localizeForPreferences,
} from "@/lib/i18n/public-chrome";
import { siteConfig } from "@/config/site";

const STACK_LABEL: Record<DeveloperStackKey, string> = {
  "nodejs-hosting": "Node.js",
  "python-hosting": "Python",
  "laravel-hosting": "Laravel",
  "django-hosting": "Django",
  "nestjs-hosting": "NestJS",
};

/**
 * The developer pages reuse the shared web hosting plans, whose feature lists
 * include WordPress-specific lines. Those are still true of the plan, but they
 * are noise on a Node.js or Laravel page, so they are filtered from the card
 * display here only — the Web Hosting page still shows them in full.
 */
const WORDPRESS_SPECIFIC = /wordpress|woocommerce/i;

function developerPlanFeatures(features: string[]): string[] {
  return features.filter((line) => !WORDPRESS_SPECIFIC.test(line));
}

export async function developerHostingMetadata(
  key: DeveloperStackKey,
  defaults: { title: string; description: string; image?: string },
): Promise<Metadata> {
  return buildPublicPageMetadata(key, DEVELOPER_STACK_PATHS[key], {
    title: defaults.title,
    description: defaults.description,
    image: defaults.image,
  });
}

/**
 * Developer hosting route.
 *
 * Renders technology-specific content from the per-stack CMS record and the
 * authoritative plan catalog. It deliberately does not use
 * `HostingProductRoute`, because that path reuses the WordPress-centric Web
 * Hosting template and its copy.
 */
export async function DeveloperHostingRoute({
  stack,
}: {
  stack: DeveloperStackKey;
}) {
  const [product, content, chrome] = await Promise.all([
    getHostingProductBySlug(stack),
    getDeveloperHostingContent(stack),
    getLocalizedPublicChrome(),
  ]);

  if (!product) notFound();
  if (product.status !== "ACTIVE") notFound();

  const basePlans = dbPlansToCmsHostingPlans(stack, product.plans);
  const plans = {
    ...basePlans,
    plans: basePlans.plans.map((plan) => ({
      ...plan,
      features: developerPlanFeatures(normalizePlanFeatures(plan.features)),
    })),
  };

  const localized = localizeForPreferences(chrome.preferences, {
    content,
  });

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: localized.content.faqs
      .filter((item) => item.visible !== false)
      .map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
  };

  return (
    <HostingProductSiteShell
      sections={chrome.sections}
      settings={chrome.settings}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: `${STACK_LABEL[stack]} Hosting`,
            description: localized.content.heroDescription,
            brand: { "@type": "Brand", name: siteConfig.name },
            url: new URL(
              DEVELOPER_STACK_PATHS[stack],
              siteConfig.url,
            ).toString(),
            offers: plans.plans.map((plan) => ({
              "@type": "Offer",
              name: plan.name,
              price: (plan.monthlyUsd ?? 0).toFixed(2),
              priceCurrency: "USD",
              url: new URL(
                DEVELOPER_STACK_PATHS[stack],
                siteConfig.url,
              ).toString(),
              availability: "https://schema.org/InStock",
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <DeveloperHostingPageView
        content={localized.content}
        plans={plans}
        productName={product.name}
        productCheckoutSlug={product.slug}
        canonicalPath={DEVELOPER_STACK_PATHS[stack]}
        stackLabel={STACK_LABEL[stack]}
      />
    </HostingProductSiteShell>
  );
}
