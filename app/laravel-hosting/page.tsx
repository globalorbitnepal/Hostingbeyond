import type { Metadata } from "next";

import {
  DeveloperHostingRoute,
  developerHostingMetadata,
} from "@/lib/hosting/developer-hosting-route";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return developerHostingMetadata("laravel-hosting", {
    title: "Laravel Hosting Plans | HostingBeyond",
    description:
      "Laravel hosting with PHP, Composer and artisan over SSH, MySQL for Eloquent, cron for the scheduler, and free automatic SSL on Pro plans and above.",
    image: "/images/hosting/cloud.jpg",
  });
}

export default function LaravelHostingPage() {
  return <DeveloperHostingRoute stack="laravel-hosting" />;
}
