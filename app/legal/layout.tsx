import { LegalPublicShell } from "@/components/legal/legal-public-shell";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LegalPublicShell>{children}</LegalPublicShell>;
}
