import { TaxonomyAdmin } from "@/components/orbit/blog/taxonomy-admin";

export const metadata = {
  title: "Article tags | Orbit",
  robots: { index: false, follow: false },
};

export default function OrbitBlogTagsPage() {
  return <TaxonomyAdmin kind="tags" title="Article tags" />;
}
