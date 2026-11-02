import { OrbitBlogDashboard } from "@/components/orbit/blog/blog-dashboard";

export const metadata = {
  title: "Articles | Orbit",
  robots: { index: false, follow: false },
};

export default function OrbitBlogPage() {
  return <OrbitBlogDashboard />;
}
