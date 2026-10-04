import type { Metadata } from "next";

import { HostingProductRoute } from "@/components/hosting/hosting-product-route";
import { hostingProductMetadata } from "@/lib/hosting/hosting-product-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return hostingProductMetadata("managed-vps", {
    title: "Managed VPS — Updates & Monitoring",
    description:
      "Managed VPS hosting with security updates, monitoring, backups, and expert support on HostingBeyond.",
    image: "/images/home/vps.webp",
  });
}

export default function ManagedVpsPage() {
  return <HostingProductRoute slug="managed-vps" />;
}
