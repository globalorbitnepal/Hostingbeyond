import type { Metadata } from "next";

import { HostingProductRoute } from "@/components/hosting/hosting-product-route";
import { hostingProductMetadata } from "@/lib/hosting/hosting-product-metadata";
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return hostingProductMetadata("business-hosting", {
    title: "Cloud Hosting — Dedicated CPU & NVMe",
    description:
      "Managed cloud hosting with dedicated RAM, vCPU, and NVMe storage. Compare Cloud Starter, Business, and Pro plans with free SSL and 24/7 support on HostingBeyond.",
    image: "/images/hosting/cloud.jpg",
  });
}

export default function CloudHostingPage() {
  return <HostingProductRoute slug="business-hosting" />;
}
