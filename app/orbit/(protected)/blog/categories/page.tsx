import { TaxonomyAdmin } from "@/components/orbit/blog/taxonomy-admin";

export const metadata = {
  title: "Article categories | Orbit",
  robots: { index: false, follow: false },
};

export default function OrbitBlogCategoriesPage() {
  return <TaxonomyAdmin kind="categories" title="Article categories" />;
}
