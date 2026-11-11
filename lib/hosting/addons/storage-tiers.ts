export const EXTRA_STORAGE_SLUG = "extra-storage";

export const EXTRA_STORAGE_TIERS = [
  { id: "storage-10gb", label: "10 GB", unitMonthlyPrice: 1.5 },
  { id: "storage-25gb", label: "25 GB", unitMonthlyPrice: 3 },
  { id: "storage-50gb", label: "50 GB", unitMonthlyPrice: 5 },
  { id: "storage-100gb", label: "100 GB", unitMonthlyPrice: 9 },
] as const;

export const LEGACY_STORAGE_SLUGS = EXTRA_STORAGE_TIERS.map((tier) => tier.id);

export function isStorageAddonSlug(slug: string) {
  return slug === EXTRA_STORAGE_SLUG || LEGACY_STORAGE_SLUGS.includes(slug);
}
