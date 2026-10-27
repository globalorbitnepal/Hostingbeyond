import { routes } from "@/config/routes";
import type { CmsHostingPlansContent } from "@/lib/orbit/defaults";
import type { CmsHostingPageContent } from "@/lib/orbit/hosting-page-content";

import { hostingCheckoutHref } from "./checkout";

function polishFeatureLine(line: string): string {
  return line
    .replace(/Advanced Performance \(5× Faster\)/i, "Advanced Performance")
    .replace(/Advanced performance \(5× faster\)/i, "Advanced Performance")
    .replace(/Advanced performance \(5×\)/i, "Advanced Performance")
    .replace(/^(\d+) GB RAM$/i, "Up to $1 GB memory (shared hosting)")
    .replace(/^(\d+) GB RAM /i, "Up to $1 GB memory (shared) ");
}

/** Checkout URLs stay canonical. Orbit copy is not overwritten when present. */
export function polishWebHostingPlans(
  content: CmsHostingPlansContent,
): CmsHostingPlansContent {
  return {
    ...content,
    eyebrow: content.eyebrow || "Plans & pricing",
    title: content.title || "Choose your",
    titleAccent: content.titleAccent || "web hosting plan",
    plans: content.plans.map((plan) => ({
      ...plan,
      ctaLabel: plan.ctaLabel?.trim() ? plan.ctaLabel : "Buy now",
      ctaHref: hostingCheckoutHref("web-hosting", plan.id),
      features: plan.features.map(polishFeatureLine),
    })),
  };
}

export function polishWebHostingPageContent(
  page: CmsHostingPageContent,
): CmsHostingPageContent {
  const wordpressPath = `${routes.hosting}/wordpress`;
  return {
    ...page,
    wordpressCtaHref: page.wordpressCtaHref?.trim() || wordpressPath,
    closingCtaHref: page.closingCtaHref?.trim() || routes.getStarted,
    features: page.features.map((f) => {
      if (f.id !== "domain") return f;
      return {
        ...f,
        title: f.title?.trim() || "Free domain on eligible plans",
        description:
          f.description?.trim() ||
          "Free domain for the 1st year on eligible annual plans when you register a new domain with HostingBeyond.",
      };
    }),
    faqs: page.faqs.map((faq) => {
      if (faq.answer?.trim()) return faq;
      if (faq.id === "refund") {
        return {
          ...faq,
          answer:
            "Refunds are handled according to the applicable HostingBeyond refund terms. Please review our Refund Policy for the current terms before you complete your order.",
        };
      }
      if (faq.id === "domain" || /domain included/i.test(faq.question)) {
        return {
          ...faq,
          answer:
            "A free domain for the first year is available only on eligible annual web hosting plans when you register a new domain with HostingBeyond. Monthly plans do not include the free-domain benefit. Renewal pricing for domains follows standard rates shown during domain search or checkout.",
        };
      }
      return faq;
    }),
  };
}
