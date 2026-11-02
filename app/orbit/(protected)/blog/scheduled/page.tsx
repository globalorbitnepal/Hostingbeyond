import { OrbitBlogDashboard } from "@/components/orbit/blog/blog-dashboard";

export const metadata = {
  title: "Scheduled articles | Orbit",
  robots: { index: false, follow: false },
};

export default function OrbitBlogScheduledPage() {
  return <OrbitBlogDashboard initialStatus="SCHEDULED" />;
}
