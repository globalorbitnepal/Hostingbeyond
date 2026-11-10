import type { Metadata } from "next";

import { HostingProductRoute } from "@/components/hosting/hosting-product-route";
import { hostingProductMetadata } from "@/lib/hosting/hosting-product-metadata";
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return hostingProductMetadata("ecommerce-hosting", {
    title: "Ecommerce Hosting for WooCommerce | HostingBeyond",
    description:
      "WooCommerce hosting with free SSL checkout and NVMe storage. Four plans from Starter to Professional. Annual billing is 10% off.",
    image: "/images/hosting/ecommerce.jpg",
  });
}

export default function EcommerceHostingPage() {
  return <HostingProductRoute slug="ecommerce-hosting" />;
}
