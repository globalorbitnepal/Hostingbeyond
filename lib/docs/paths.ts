import { DOCS_BASE } from "@/lib/orbit/docs-hub-page-content";

export function docsHubPath(query?: { search?: string; category?: string }) {
  const params = new URLSearchParams();
  if (query?.category) params.set("category", query.category);
  if (query?.search) params.set("search", query.search);
  const qs = params.toString();
  return qs ? `${DOCS_BASE}?${qs}` : DOCS_BASE;
}

export { DOCS_BASE };
