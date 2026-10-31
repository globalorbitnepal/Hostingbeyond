import { GROWTH_BASE } from "@/lib/orbit/growth-hub-page-content";

export function growthHubPath(query?: { search?: string; category?: string }) {
  const params = new URLSearchParams();
  if (query?.category) params.set("category", query.category);
  if (query?.search) params.set("search", query.search);
  const qs = params.toString();
  return qs ? `${GROWTH_BASE}?${qs}` : GROWTH_BASE;
}

export { GROWTH_BASE };
