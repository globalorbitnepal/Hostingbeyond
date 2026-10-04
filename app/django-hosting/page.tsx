import type { Metadata } from "next";

import { HostingProductRoute } from "@/components/hosting/hosting-product-route";
import { hostingProductMetadata } from "@/lib/hosting/hosting-product-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return hostingProductMetadata("django-hosting", {
    title: "Django Hosting — Python Web Apps on NVMe",
    description:
      "Managed Django hosting with pip, virtual environments, free SSL, and developer-friendly tooling on HostingBeyond.",
    image: "/images/hosting/cloud.jpg",
  });
}

export default function DjangoHostingPage() {
  return <HostingProductRoute slug="django-hosting" />;
}
