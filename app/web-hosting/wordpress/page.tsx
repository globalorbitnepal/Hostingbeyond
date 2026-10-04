import type { Metadata } from "next";

import { HostingProductRoute } from "@/components/hosting/hosting-product-route";
import { hostingProductMetadata } from "@/lib/hosting/hosting-product-metadata";
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return hostingProductMetadata("wordpress-hosting", {
    title: "WordPress Hosting — Managed & WooCommerce Ready",
    description:
      "Managed WordPress hosting on NVMe with one-click install, free SSL, automatic updates, WooCommerce support, and 24/7 expert help on HostingBeyond.",
    image: "/images/home/wordpress.webp",
  });
}

export default function WordPressHostingPage() {
  return <HostingProductRoute slug="wordpress-hosting" />;
}
