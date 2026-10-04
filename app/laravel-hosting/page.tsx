import type { Metadata } from "next";

import { HostingProductRoute } from "@/components/hosting/hosting-product-route";
import { hostingProductMetadata } from "@/lib/hosting/hosting-product-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return hostingProductMetadata("laravel-hosting", {
    title: "Laravel Hosting — PHP, Composer & Queues",
    description:
      "Laravel-optimized hosting with Composer, cron, queues, free SSL, and NVMe performance. Launch Laravel projects on HostingBeyond.",
    image: "/images/hosting/cloud.jpg",
  });
}

export default function LaravelHostingPage() {
  return <HostingProductRoute slug="laravel-hosting" />;
}
