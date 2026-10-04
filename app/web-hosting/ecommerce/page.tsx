import type { Metadata } from "next";

import { HostingProductRoute } from "@/components/hosting/hosting-product-route";
import { hostingProductMetadata } from "@/lib/hosting/hosting-product-metadata";
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return hostingProductMetadata("ecommerce-hosting", {
    title: "Ecommerce Hosting — WooCommerce NVMe Stores",
    description:
      "WooCommerce ecommerce hosting with NVMe, free SSL checkout, scalable store plans, and 24/7 commerce support on HostingBeyond.",
    image: "/images/hosting/ecommerce.jpg",
  });
}

export default function EcommerceHostingPage() {
  return <HostingProductRoute slug="ecommerce-hosting" />;
}
