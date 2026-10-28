import { revalidatePath } from "next/cache";

import { routes } from "@/config/routes";
import { invalidateTldCatalogueCache } from "@/lib/domains/tld-catalogue-cache";

/** Orbit retail (and extras) must show on public domain pages immediately. */
export function revalidateDomainRetailSurfaces() {
  invalidateTldCatalogueCache();
  revalidatePath(routes.domainSearch);
  revalidatePath(routes.bulkDomainSearch);
  revalidatePath(routes.domainTransfer);
  revalidatePath(routes.pricing);
  revalidatePath("/orbit/domain-pricing");
}
