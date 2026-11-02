import type { Metadata } from "next";

import {
  DeveloperHostingRoute,
  developerHostingMetadata,
} from "@/lib/hosting/developer-hosting-route";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return developerHostingMetadata("nestjs-hosting", {
    title: "NestJS Hosting Plans | HostingBeyond",
    description:
      "Host NestJS APIs on the Node.js runtime with npm and TypeScript builds over SSH, MySQL for TypeORM or Prisma, NVMe storage and free automatic SSL.",
    image: "/images/hosting/cloud.jpg",
  });
}

export default function NestJsHostingPage() {
  return <DeveloperHostingRoute stack="nestjs-hosting" />;
}
