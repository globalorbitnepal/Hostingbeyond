import type { Metadata } from "next";

import { HostingProductRoute } from "@/components/hosting/hosting-product-route";
import { hostingProductMetadata } from "@/lib/hosting/hosting-product-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return hostingProductMetadata("kvm-vps", {
    title: "KVM VPS — Full Root Access",
    description:
      "KVM virtual private servers with dedicated resources, IPv4/IPv6, snapshots, and NVMe storage on HostingBeyond.",
    image: "/images/home/vps.webp",
  });
}

export default function KvmVpsPage() {
  return <HostingProductRoute slug="kvm-vps" />;
}
