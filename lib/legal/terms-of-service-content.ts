import type { LegalDocumentContent } from "./legal-document-types";

export const termsOfServiceDocument: LegalDocumentContent = {
  title: "Terms of Service",
  description:
    "Terms governing your use of HostingBeyond websites, accounts, and digital services.",
  lastUpdated: "October 4, 2026",
  sections: [
    {
      heading: "Agreement",
      paragraphs: [
        "These Terms of Service (“Terms”) apply when you access HostingBeyond websites, create an account, or purchase services from us. By using our services, you agree to these Terms and to any product-specific terms presented at checkout.",
        "If you do not agree, do not use our services.",
      ],
    },
    {
      heading: "Services",
      paragraphs: [
        "HostingBeyond provides online infrastructure and related digital services such as web hosting, domains, email, and account management tools. Features, limits, and pricing depend on the plan you select.",
        "We may update, suspend, or discontinue parts of the platform for maintenance, security, or business reasons. Where practical, we provide notice of material changes that affect active services.",
      ],
    },
    {
      heading: "Accounts",
      paragraphs: [
        "You are responsible for keeping your login credentials confidential and for activity under your account. Provide accurate registration information and notify us promptly if you suspect unauthorized access.",
        "We may suspend or terminate accounts that violate these Terms, applicable law, or acceptable-use requirements.",
      ],
    },
    {
      heading: "Acceptable use",
      paragraphs: [
        "You may not use HostingBeyond services to distribute malware, send unsolicited bulk messages, infringe intellectual property, harass others, or interfere with the security or operation of our network or other customers’ services.",
        "You are responsible for content you host and for complying with laws that apply to your websites, stores, and communications.",
      ],
    },
    {
      heading: "Billing and renewals",
      paragraphs: [
        "Fees, billing cycles, taxes, and renewal rates are shown during checkout or in your account. By completing a purchase, you authorize us to charge the payment method you provide according to the selected billing term.",
        "Unless otherwise stated at checkout, subscriptions renew automatically until cancelled according to the cancellation process available in your account or through support.",
      ],
    },
    {
      heading: "Third-party services",
      paragraphs: [
        "Some features may rely on third-party providers (for example, domain registries, certificate authorities, or payment processors). Their terms may also apply to those components.",
      ],
    },
    {
      heading: "Disclaimer",
      paragraphs: [
        "Services are provided on an “as available” basis to the extent permitted by law. We do not guarantee uninterrupted or error-free operation. Plan descriptions on our site are summaries; the terms at checkout and in your account govern your order.",
      ],
    },
    {
      heading: "Limitation of liability",
      paragraphs: [
        "To the maximum extent permitted by applicable law, HostingBeyond is not liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, or goodwill arising from your use of the services.",
        "Our total liability for any claim relating to the services is limited to the amounts you paid to HostingBeyond for the affected service during the twelve (12) months before the event giving rise to the claim, unless a different limit is required by law.",
      ],
    },
    {
      heading: "Changes",
      paragraphs: [
        "We may revise these Terms from time to time. The “Last updated” date at the top of this page indicates when they were last changed. Continued use after changes become effective constitutes acceptance of the revised Terms where permitted by law.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [
        "Questions about these Terms can be sent through the contact options on our website.",
      ],
    },
  ],
};
