import type { Metadata } from "next";

import {
  DeveloperHostingRoute,
  developerHostingMetadata,
} from "@/lib/hosting/developer-hosting-route";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return developerHostingMetadata("django-hosting", {
    title: "Django Hosting Plans | HostingBeyond",
    description:
      "Django hosting on managed Linux with a virtual environment per project, pip over SSH, MySQL for the ORM, cron for management commands and free SSL.",
    image: "/images/hosting/cloud.jpg",
  });
}

export default function DjangoHostingPage() {
  return <DeveloperHostingRoute stack="django-hosting" />;
}
