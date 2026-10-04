import type { Metadata } from "next";

import { HostingProductRoute } from "@/components/hosting/hosting-product-route";
import { hostingProductMetadata } from "@/lib/hosting/hosting-product-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return hostingProductMetadata("nodejs-hosting", {
    title: "Node.js Hosting — Deploy Apps on NVMe",
    description:
      "Node.js hosting with npm, modern runtimes, free SSL, and scalable resources. Choose a plan and deploy APIs or full-stack apps on HostingBeyond.",
    image: "/images/hosting/cloud.jpg",
  });
}

export default function NodeJsHostingPage() {
  return <HostingProductRoute slug="nodejs-hosting" />;
}
