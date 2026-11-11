import type { CmsEditorialPageContent } from "@/lib/orbit/editorial-page-content";

import { PremiumLongEditorialView } from "./premium-long-editorial-view";

const CHROME = {
  related: [
    { href: "/web-hosting/reseller", label: "Reseller hosting" },
    { href: "/web-hosting", label: "Web hosting plans" },
    { href: "/web-hosting/wordpress", label: "WordPress hosting" },
    { href: "/business-email", label: "Business email" },
    { href: "/domain-name-search", label: "Domain search" },
    { href: "/about/affiliates", label: "Affiliate program" },
    { href: "/contact", label: "Contact" },
  ],
  firstBandEyebrow: "Agencies",
  firstBandTitle: "Client sites without midnight WHM sessions",
  secondBandEyebrow: "Resellers",
  secondBandTitle: "Catalog, migrations and support routing",
  faqTitle: "Partner program questions",
  faqLead:
    "Agencies, resellers and integration owners — straight answers, no logo-wall partnerships.",
  closingTitle: "Tell us who you serve and how you bill today.",
  closingLead:
    "Share client volume, regions, and whether you need reseller hosting or a custom scope. We reply with next steps, not a generic brochure.",
};

export function PartnersPageView({
  content,
}: {
  content: CmsEditorialPageContent;
}) {
  return <PremiumLongEditorialView content={content} chrome={CHROME} />;
}
