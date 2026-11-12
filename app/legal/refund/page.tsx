import type { Metadata } from "next";

import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { refundPolicyDocument } from "@/lib/legal/refund-policy-content";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Refund Policy — HostingBeyond",
  description: refundPolicyDocument.description,
  path: "/legal/refund",
  keywords: [
    "HostingBeyond refund policy",
    "hosting cancellation",
    "domain refund",
  ],
});

export default function RefundPolicyPage() {
  return (
    <LegalDocumentPage document={refundPolicyDocument} path="/legal/refund" />
  );
}
