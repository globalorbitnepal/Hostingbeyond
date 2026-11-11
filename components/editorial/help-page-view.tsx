import type { CmsEditorialPageContent } from "@/lib/orbit/editorial-page-content";

import { PremiumLongEditorialView } from "./premium-long-editorial-view";

const CHROME = {
  related: [
    { href: "/resources/knowledge-base", label: "Knowledge base" },
    { href: "/resources/guides", label: "Hosting guides" },
    { href: "/website-migration", label: "Website migration" },
    { href: "/resources/status", label: "System status" },
    { href: "/login", label: "Customer panel" },
    { href: "/contact", label: "Contact support" },
    { href: "/resources/security", label: "Security" },
  ],
  firstBandEyebrow: "Support scope",
  firstBandTitle: "Products we can troubleshoot on this platform",
  secondBandEyebrow: "Get unstuck",
  secondBandTitle: "DNS, SSL, mail, billing, and the panel",
  faqTitle: "Help Center questions",
  faqLead:
    "When to use the panel, contact form, guides, or chat — and what we do not pretend to fix in one message.",
  closingTitle: "Still blocked after the guides?",
  closingLead:
    "Log in and open a support ticket with the domain, URL, and exact error text. Guests can use contact with the same details.",
};

export function HelpPageView({
  content,
}: {
  content: CmsEditorialPageContent;
}) {
  return <PremiumLongEditorialView content={content} chrome={CHROME} />;
}
