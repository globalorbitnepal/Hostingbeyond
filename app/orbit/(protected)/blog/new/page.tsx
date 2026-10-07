import { OrbitBlogPostEditor } from "@/components/orbit/blog/post-editor";

export default async function OrbitBlogNewPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const defaultContentType = params.type === "tip" ? "TIP" : "BLOG";
  return <OrbitBlogPostEditor defaultContentType={defaultContentType} />;
}
