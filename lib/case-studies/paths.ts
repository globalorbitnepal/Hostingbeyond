import { CASE_STUDIES_BASE } from "@/lib/orbit/case-studies-hub-page-content";

export function caseStudiesHubPath(query?: {
  search?: string;
  industry?: string;
}) {
  const params = new URLSearchParams();
  if (query?.search?.trim()) params.set("search", query.search.trim());
  if (query?.industry?.trim()) params.set("industry", query.industry.trim());
  const qs = params.toString();
  return qs ? `${CASE_STUDIES_BASE}?${qs}` : CASE_STUDIES_BASE;
}

export { CASE_STUDIES_BASE };
