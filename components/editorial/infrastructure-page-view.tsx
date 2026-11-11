import type { CmsEditorialPageContent } from "@/lib/orbit/editorial-page-content";

import { PremiumLongEditorialView } from "./premium-long-editorial-view";

const CHROME = {
  related: [
    { href: "/web-hosting", label: "Web hosting plans" },
    { href: "/web-hosting/wordpress", label: "WordPress hosting" },
    { href: "/domain-name-search", label: "Domain search" },
    { href: "/business-email", label: "Business email" },
    { href: "/resources/status", label: "System status" },
    { href: "/about", label: "About HostingBeyond" },
    { href: "/contact", label: "Contact" },
  ],
  firstBandEyebrow: "Platform",
  firstBandTitle: "Public site, panel, and TLS on the live hostname",
  secondBandEyebrow: "Products",
  secondBandTitle: "Hosting, domains, mail, and checkout",
  faqTitle: "Infrastructure questions",
  faqLead:
    "What we operate on hosting.theglobalorbit.com — without invented backbone maps or unpublished SLAs.",
  closingTitle: "Need facility detail for a migration or RFP?",
  closingLead:
    "Open a ticket or contact sales with the plan tier and region you are evaluating. We answer what is in scope for your order.",
};

export function InfrastructurePageView({
  content,
}: {
  content: CmsEditorialPageContent;
}) {
  return <PremiumLongEditorialView content={content} chrome={CHROME} />;
}
