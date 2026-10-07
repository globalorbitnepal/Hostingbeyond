import { OrbitBlogPostEditor } from "@/components/orbit/blog/post-editor";

type Params = { params: Promise<{ id: string }> };

export default async function OrbitBlogEditPage({ params }: Params) {
  const { id } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit post</h1>
      <OrbitBlogPostEditor postId={id} />
    </div>
  );
}
