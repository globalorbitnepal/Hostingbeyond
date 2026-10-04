import type { Metadata } from "next";

import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { refundPolicyDocument } from "@/lib/legal/refund-policy-content";

export const metadata: Metadata = {
  title: "Refund Policy — HostingBeyond",
  description: refundPolicyDocument.description,
  robots: { index: true, follow: true },
};

export default function RefundPolicyPage() {
  return <LegalDocumentPage document={refundPolicyDocument} />;
}
