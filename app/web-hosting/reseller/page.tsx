import type { Metadata } from "next";

import { HostingProductRoute } from "@/components/hosting/hosting-product-route";
import { hostingProductMetadata } from "@/lib/hosting/hosting-product-metadata";
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return hostingProductMetadata("reseller-hosting", {
    title: "Reseller Hosting — Start Your Hosting Business",
    description:
      "White-label reseller hosting with cPanel, WHM, and scalable plans. Launch your hosting brand on HostingBeyond.",
    image: "/images/hosting/cloud.jpg",
  });
}

export default function ResellerHostingPage() {
  return <HostingProductRoute slug="reseller-hosting" />;
}
