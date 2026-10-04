import type { Metadata } from "next";

import { HostingProductRoute } from "@/components/hosting/hosting-product-route";
import { hostingProductMetadata } from "@/lib/hosting/hosting-product-metadata";
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return hostingProductMetadata("python-hosting", {
    title: "Python Hosting — Django, Flask & FastAPI on NVMe",
    description:
      "Managed Python hosting for Flask, Django, and FastAPI on Linux NVMe. Free SSL, SSH on Pro+ plans, and 24/7 developer support.",
    image: "/images/home/solutions/wordpress-screen.png",
  });
}

export default function PythonHostingPage() {
  return <HostingProductRoute slug="python-hosting" />;
}
