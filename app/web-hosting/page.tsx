import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { HostingProductRoute } from "@/components/hosting/hosting-product-route";
import { hostingProductMetadata } from "@/lib/hosting/hosting-product-metadata";
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return hostingProductMetadata("web-hosting", {
    title: "Web Hosting — Fast NVMe WordPress Hosting",
    description:
      "Compare HostingBeyond web hosting plans with free SSL, NVMe storage, managed WordPress, free domain options, and 24/7 support. Save up to 70% on annual billing.",
    image: "/images/hosting/cloud.jpg",
  });
}

const STACK_REDIRECTS: Record<string, string> = {
  python: "/web-hosting/python",
  nodejs: "/nodejs-hosting",
  laravel: "/laravel-hosting",
  django: "/django-hosting",
  nestjs: "/nestjs-hosting",
};

type PageProps = {
  searchParams: Promise<{ stack?: string | string[] }>;
};

export default async function WebHostingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const stackRaw = params.stack;
  const stack = Array.isArray(stackRaw) ? stackRaw[0] : stackRaw;
  if (stack && STACK_REDIRECTS[stack]) {
    redirect(STACK_REDIRECTS[stack]);
  }

  return <HostingProductRoute slug="web-hosting" />;
}
