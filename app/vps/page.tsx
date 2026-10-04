import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { resolveProductSlugFromLegacySearch } from "@/lib/hosting/products-registry";

export const dynamic = "force-dynamic";

const SLUG_TO_PATH: Record<string, string> = {
  "kvm-vps": "/kvm-vps",
  "nvme-vps": "/nvme-vps",
  "linux-vps": "/linux-vps",
  "managed-vps": "/managed-vps",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VpsLegacyRouterPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const slug = resolveProductSlugFromLegacySearch(routes.vps, params);
  if (slug && SLUG_TO_PATH[slug]) {
    redirect(SLUG_TO_PATH[slug]);
  }
  redirect("/kvm-vps");
}
