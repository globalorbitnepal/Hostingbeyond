import type { CmsEditorialPageContent } from "@/lib/orbit/editorial-page-content";

import { PremiumLongEditorialView } from "./premium-long-editorial-view";

const CHROME = {
  related: [
    { href: "/web-hosting", label: "Web hosting plans" },
    { href: "/web-hosting/wordpress", label: "WordPress hosting" },
    { href: "/business-email", label: "Business email" },
    { href: "/domain-name-search", label: "Domain search" },
    { href: "/about/partners", label: "Partner program" },
    { href: "/pricing", label: "Pricing" },
    { href: "/contact", label: "Apply" },
  ],
  firstBandEyebrow: "Commissions",
  firstBandTitle: "What earns and what does not",
  secondBandEyebrow: "Compliance",
  secondBandTitle: "Rules that keep affiliates paid",
  faqTitle: "Affiliate program questions",
  faqLead:
    "Cookie window, payouts and promotion rules — without invented commission rates on this page.",
  closingTitle: "Apply with your channel and audience.",
  closingLead:
    "Tell us how you recommend hosting and domains today. We send a tracking link when the fit is real.",
};

export function AffiliatesPageView({
  content,
}: {
  content: CmsEditorialPageContent;
}) {
  return <PremiumLongEditorialView content={content} chrome={CHROME} />;
}
