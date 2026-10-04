import type { Metadata } from "next";

import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { termsOfServiceDocument } from "@/lib/legal/terms-of-service-content";

export const metadata: Metadata = {
  title: "Terms of Service — HostingBeyond",
  description: termsOfServiceDocument.description,
  robots: { index: true, follow: true },
};

export default function TermsOfServicePage() {
  return <LegalDocumentPage document={termsOfServiceDocument} />;
}
