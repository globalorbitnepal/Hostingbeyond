import type { LegalDocumentContent } from "./legal-document-types";

/** Canonical refund policy copy — no fixed money-back period unless configured elsewhere. */
export const refundPolicyDocument: LegalDocumentContent = {
  title: "Refund Policy",
  description:
    "How HostingBeyond handles refund and cancellation requests for hosting and related services.",
  lastUpdated: "October 4, 2026",
  sections: [
    {
      heading: "Overview",
      paragraphs: [
        "HostingBeyond sells digital hosting and related services with plan-specific terms. Refund eligibility, cancellation windows, and any promotional pricing rules are defined in the plan and billing term you select at checkout.",
        "This policy describes how we handle refund requests in general. It does not replace the itemized terms shown when you place an order.",
      ],
    },
    {
      heading: "Before you purchase",
      paragraphs: [
        "Review the plan summary, renewal pricing, and billing cycle on the product page before completing checkout. If you have questions about refunds for a specific product, contact support before payment.",
      ],
    },
    {
      heading: "Requesting a refund",
      paragraphs: [
        "To request a refund or cancellation, sign in to your HostingBeyond account and open a support ticket, or contact us through the channels listed on our Contact page. Include your account email, the service in question, and your order or invoice reference if available.",
        "We evaluate each request against the terms that applied at the time of purchase. Approved refunds, when issued, are returned to the original payment method where possible.",
      ],
    },
    {
      heading: "Non-refundable items",
      paragraphs: [
        "Some charges may not be refundable once provisioning has started, including certain domain registrations, transfers, third-party licenses, or add-ons governed by external providers. Those limitations are disclosed at checkout when applicable.",
      ],
    },
    {
      heading: "Chargebacks",
      paragraphs: [
        "If you believe a charge is incorrect, contact us before initiating a payment dispute so we can resolve the issue directly.",
      ],
    },
    {
      heading: "Changes to this policy",
      paragraphs: [
        "We may update this page to reflect product or legal changes. The version in effect at the time of your purchase applies to that order unless otherwise required by law.",
      ],
    },
  ],
};
