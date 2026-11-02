import { OrbitBlogDashboard } from "@/components/orbit/blog/blog-dashboard";

export const metadata = {
  title: "Drafts | Orbit",
  robots: { index: false, follow: false },
};

export default function OrbitBlogDraftsPage() {
  return <OrbitBlogDashboard initialStatus="DRAFT" />;
}
