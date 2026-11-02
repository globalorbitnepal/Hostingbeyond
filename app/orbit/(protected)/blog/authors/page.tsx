import { TaxonomyAdmin } from "@/components/orbit/blog/taxonomy-admin";

export const metadata = {
  title: "Article authors | Orbit",
  robots: { index: false, follow: false },
};

export default function OrbitBlogAuthorsPage() {
  return <TaxonomyAdmin kind="authors" title="Article authors" />;
}
