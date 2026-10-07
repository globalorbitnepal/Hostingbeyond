import { UPDATES_BASE } from "@/lib/orbit/updates-hub-page-content";

export function updatesHubPath(query?: { search?: string; category?: string }) {
  const params = new URLSearchParams();
  if (query?.search?.trim()) params.set("search", query.search.trim());
  if (query?.category?.trim()) params.set("category", query.category.trim());
  const qs = params.toString();
  return qs ? `${UPDATES_BASE}?${qs}` : UPDATES_BASE;
}

export { UPDATES_BASE };
