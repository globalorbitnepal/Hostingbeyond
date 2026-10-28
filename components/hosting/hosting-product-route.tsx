import { notFound } from "next/navigation";

import { HostingProductPage } from "@/components/hosting/hosting-product-page";
import { HostingProductSiteShell } from "@/components/hosting/hosting-product-site-shell";
import { WebHostingStructuredData } from "@/components/hosting/web-hosting-structured-data";
import { loadHostingProductPage } from "@/lib/hosting/load-hosting-product-page";
import {
  getLocalizedPublicChrome,
  localizePublicContent,
} from "@/lib/i18n/public-chrome";

export async function HostingProductRoute({ slug }: { slug: string }) {
  const resolved = await loadHostingProductPage(slug);
  if (!resolved || resolved.inactive) notFound();

  const { sections, settings, preferences } = await getLocalizedPublicChrome();
  const localized = localizePublicContent(preferences.language, resolved);

  return (
    <HostingProductSiteShell sections={sections} settings={settings}>
      {slug === "web-hosting" ? <WebHostingStructuredData /> : null}
      <HostingProductPage {...localized} />
    </HostingProductSiteShell>
  );
}
