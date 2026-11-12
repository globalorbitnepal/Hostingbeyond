import type { Metadata } from "next";

import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { termsOfServiceDocument } from "@/lib/legal/terms-of-service-content";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service — HostingBeyond",
  description: termsOfServiceDocument.description,
  path: "/legal/terms",
  keywords: [
    "HostingBeyond terms of service",
    "web hosting terms",
    "domain registration terms",
    "acceptable use policy",
  ],
});

export default function TermsOfServicePage() {
  return (
    <LegalDocumentPage document={termsOfServiceDocument} path="/legal/terms" />
  );
}
