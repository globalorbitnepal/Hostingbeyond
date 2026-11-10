import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { HostingProductRoute } from "@/components/hosting/hosting-product-route";
import { hostingProductMetadata } from "@/lib/hosting/hosting-product-metadata";
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const base = await hostingProductMetadata("web-hosting", {
    title: "Web Hosting with NVMe SSD & Free SSL | HostingBeyond",
    description:
      "Compare Starter, Growth, Business, and Professional web hosting. NVMe storage, free SSL, and backups. Annual billing is 10% off the monthly price.",
    image: "/images/hosting/cloud.jpg",
  });
  return {
    ...base,
    alternates: {
      ...base.alternates,
      canonical: "https://hosting.theglobalorbit.com/web-hosting",
    },
  };
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
