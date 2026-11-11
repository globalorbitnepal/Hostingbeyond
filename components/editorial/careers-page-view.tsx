import type { CmsEditorialPageContent } from "@/lib/orbit/editorial-page-content";

import { PremiumLongEditorialView } from "./premium-long-editorial-view";

const CHROME = {
  related: [
    { href: "/about", label: "About HostingBeyond" },
    { href: "/web-hosting", label: "Web hosting" },
    { href: "/web-hosting/wordpress", label: "WordPress hosting" },
    { href: "/business-email", label: "Business email" },
    { href: "/domain-name-search", label: "Domain search" },
    { href: "/contact", label: "Contact" },
  ],
  firstBandEyebrow: "Teams",
  firstBandTitle: "Work that stays on the live product",
  secondBandEyebrow: "How we hire",
  secondBandTitle: "A short process. No fake job board.",
  faqTitle: "Questions about working here",
  faqLead:
    "Straight answers. If a seat is not listed, we still read notes sent from the contact page.",
  closingTitle: "Send the work, not a generic CV.",
  closingLead:
    "Tell us the seat you want, link two examples, and we reply when there is a real opening.",
};

export function CareersPageView({
  content,
}: {
  content: CmsEditorialPageContent;
}) {
  return <PremiumLongEditorialView content={content} chrome={CHROME} />;
}
