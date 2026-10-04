import type { Metadata } from "next";

import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { privacyPolicyDocument } from "@/lib/legal/privacy-policy-content";

export const metadata: Metadata = {
  title: "Privacy Policy — HostingBeyond",
  description: privacyPolicyDocument.description,
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return <LegalDocumentPage document={privacyPolicyDocument} />;
}
