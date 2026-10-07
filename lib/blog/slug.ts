const SLUG_MAX = 120;

export function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, SLUG_MAX);
}

export function normalizeBlogSlug(input: string): string {
  const raw = input.trim().toLowerCase();
  if (!raw) return "";
  return slugifyTitle(raw.replace(/\s+/g, "-"));
}
