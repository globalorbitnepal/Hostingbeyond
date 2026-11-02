import type { Metadata } from "next";

import {
  DeveloperHostingRoute,
  developerHostingMetadata,
} from "@/lib/hosting/developer-hosting-route";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return developerHostingMetadata("python-hosting", {
    title: "Python Hosting Plans | HostingBeyond",
    description:
      "Run Flask, Django and FastAPI on managed Linux with pip and virtual environments over SSH, MySQL databases, cron scheduling and free automatic SSL.",
    image: "/images/home/solutions/wordpress-screen.png",
  });
}

export default function PythonHostingPage() {
  return <DeveloperHostingRoute stack="python-hosting" />;
}
