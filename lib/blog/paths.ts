export const BLOG_BASE = "/resources/blog";
export const TIPS_BASE = "/resources/tips";

export function blogPostPath(slug: string) {
  return `${BLOG_BASE}/${slug}`;
}

export function tipsPostPath(slug: string) {
  return `${TIPS_BASE}/${slug}`;
}

export function tipsHubPath(query?: {
  search?: string;
  category?: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (query?.search?.trim()) params.set("search", query.search.trim());
  if (query?.category?.trim()) params.set("category", query.category.trim());
  if (query?.page && query.page > 1) params.set("page", String(query.page));
  const qs = params.toString();
  return qs ? `${TIPS_BASE}?${qs}` : TIPS_BASE;
}

export function blogCategoryPath(slug: string) {
  return `${BLOG_BASE}/category/${slug}`;
}

export function blogTagPath(slug: string) {
  return `${BLOG_BASE}/tag/${slug}`;
}
