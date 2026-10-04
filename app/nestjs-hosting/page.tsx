import type { Metadata } from "next";

import { HostingProductRoute } from "@/components/hosting/hosting-product-route";
import { hostingProductMetadata } from "@/lib/hosting/hosting-product-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return hostingProductMetadata("nestjs-hosting", {
    title: "NestJS Hosting — Modern Node APIs",
    description:
      "Deploy NestJS applications with process management, npm, free SSL, and scalable hosting on HostingBeyond.",
    image: "/images/hosting/cloud.jpg",
  });
}

export default function NestJsHostingPage() {
  return <HostingProductRoute slug="nestjs-hosting" />;
}
