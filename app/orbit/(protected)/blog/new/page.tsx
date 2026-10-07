import { OrbitBlogPostEditor } from "@/components/orbit/blog/post-editor";

export default function OrbitBlogNewPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">New blog post</h1>
      <OrbitBlogPostEditor />
    </div>
  );
}
