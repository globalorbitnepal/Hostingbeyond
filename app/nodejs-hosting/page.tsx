import type { Metadata } from "next";

import {
  DeveloperHostingRoute,
  developerHostingMetadata,
} from "@/lib/hosting/developer-hosting-route";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return developerHostingMetadata("nodejs-hosting", {
    title: "Node.js Hosting — Deploy Apps on NVMe | HostingBeyond",
    description:
      "Node.js, Next.js, and Express hosting with SSH and Git on Starter, Growth, Business, and Professional. Annual billing is 10% off.",
    image: "/images/hosting/cloud.jpg",
  });
}

export default function NodeJsHostingPage() {
  return <DeveloperHostingRoute stack="nodejs-hosting" />;
}
