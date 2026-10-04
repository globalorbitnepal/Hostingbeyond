import type { Metadata } from "next";

import { HostingProductRoute } from "@/components/hosting/hosting-product-route";
import { hostingProductMetadata } from "@/lib/hosting/hosting-product-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return hostingProductMetadata("agency-hosting", {
    title: "Agency Hosting — Manage Client Sites",
    description:
      "Agency-friendly hosting to manage multiple client websites with staging, backups, and scalable plans on HostingBeyond.",
    image: "/images/hosting/cloud.jpg",
  });
}

export default function AgencyHostingPage() {
  return <HostingProductRoute slug="agency-hosting" />;
}
