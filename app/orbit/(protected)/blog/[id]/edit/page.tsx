import { OrbitBlogPostEditor } from "@/components/orbit/blog/post-editor";

type Params = { params: Promise<{ id: string }> };

export default async function OrbitBlogEditPage({ params }: Params) {
  const { id } = await params;
  return <OrbitBlogPostEditor postId={id} />;
}
