import { LegalPublicShell } from "@/components/legal/legal-public-shell";

export default function HtmlSitemapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LegalPublicShell>{children}</LegalPublicShell>;
}
