import type { Metadata } from "next";

import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { privacyPolicyDocument } from "@/lib/legal/privacy-policy-content";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy — HostingBeyond",
  description: privacyPolicyDocument.description,
  path: "/legal/privacy",
  keywords: [
    "HostingBeyond privacy policy",
    "hosting data protection",
    "cookies HostingBeyond",
  ],
});

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentPage document={privacyPolicyDocument} path="/legal/privacy" />
  );
}
