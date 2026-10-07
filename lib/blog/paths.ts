export const BLOG_BASE = "/resources/blog";

export function blogPostPath(slug: string) {
  return `${BLOG_BASE}/${slug}`;
}

export function blogCategoryPath(slug: string) {
  return `${BLOG_BASE}/category/${slug}`;
}

export function blogTagPath(slug: string) {
  return `${BLOG_BASE}/tag/${slug}`;
}
