import type { Metadata } from "next";

import { HostingProductRoute } from "@/components/hosting/hosting-product-route";
import { hostingProductMetadata } from "@/lib/hosting/hosting-product-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return hostingProductMetadata("nvme-vps", {
    title: "NVMe VPS — High-Speed Storage",
    description:
      "NVMe VPS hosting for demanding workloads — fast storage, KVM isolation, and flexible scaling on HostingBeyond.",
    image: "/images/home/vps.webp",
  });
}

export default function NvmeVpsPage() {
  return <HostingProductRoute slug="nvme-vps" />;
}
