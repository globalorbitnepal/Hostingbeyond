import type { Metadata } from "next";

import { HostingProductRoute } from "@/components/hosting/hosting-product-route";
import { hostingProductMetadata } from "@/lib/hosting/hosting-product-metadata";
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return hostingProductMetadata("wordpress-hosting", {
    title: "WordPress Hosting — One-Click Install | HostingBeyond",
    description:
      "Managed WordPress on NVMe with one-click install and free SSL. Starter, Growth, Business, and Professional. Annual billing is 10% off.",
    image: "/images/home/wordpress.webp",
  });
}

export default function WordPressHostingPage() {
  return <HostingProductRoute slug="wordpress-hosting" />;
}
