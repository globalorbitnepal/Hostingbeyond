import type { Metadata } from "next";

import { HostingProductRoute } from "@/components/hosting/hosting-product-route";
import { hostingProductMetadata } from "@/lib/hosting/hosting-product-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return hostingProductMetadata("linux-vps", {
    title: "Linux VPS — Ubuntu, Debian & More",
    description:
      "Linux VPS with your choice of distribution, root access, NVMe storage, and 24/7 support on HostingBeyond.",
    image: "/images/home/vps.webp",
  });
}

export default function LinuxVpsPage() {
  return <HostingProductRoute slug="linux-vps" />;
}
