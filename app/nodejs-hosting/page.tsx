import type { Metadata } from "next";

import {
  DeveloperHostingRoute,
  developerHostingMetadata,
} from "@/lib/hosting/developer-hosting-route";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return developerHostingMetadata("nodejs-hosting", {
    title: "Node.js Hosting Plans | HostingBeyond",
    description:
      "Host Node.js APIs and full-stack JavaScript apps with the Node.js runtime on Pro and above, npm over SSH, MySQL, NVMe storage and free automatic SSL.",
    image: "/images/hosting/cloud.jpg",
  });
}

export default function NodeJsHostingPage() {
  return <DeveloperHostingRoute stack="nodejs-hosting" />;
}
