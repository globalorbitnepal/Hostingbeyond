import { notFound } from "next/navigation";

import { HostingProductPage } from "@/components/hosting/hosting-product-page";
import { HostingProductSiteShell } from "@/components/hosting/hosting-product-site-shell";
import { WebHostingStructuredData } from "@/components/hosting/web-hosting-structured-data";
import { loadHostingProductPage } from "@/lib/hosting/load-hosting-product-page";
import { getHomeSections, getSiteSettings } from "@/lib/orbit/content";

export async function HostingProductRoute({ slug }: { slug: string }) {
  const resolved = await loadHostingProductPage(slug);
  if (!resolved || resolved.inactive) notFound();

  const [sections, settings] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
  ]);

  return (
    <HostingProductSiteShell
      sections={sections}
      settings={settings}
      overlayHero={slug === "web-hosting"}
    >
      {slug === "web-hosting" ? <WebHostingStructuredData /> : null}
      <HostingProductPage {...resolved} />
    </HostingProductSiteShell>
  );
}
