import { OrbitMediaLibrary } from "@/components/orbit/blog/media-library";

export const metadata = {
  title: "Media library | Orbit",
  robots: { index: false, follow: false },
};

export default function OrbitBlogMediaPage() {
  return (
    <OrbitMediaLibrary
      heading="Media library"
      description="Images used across articles and pages. Upload once, then reuse the URL anywhere in Orbit."
    />
  );
}
