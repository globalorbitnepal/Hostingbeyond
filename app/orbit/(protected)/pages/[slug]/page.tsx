import { OrbitPageDetailEditor } from "@/components/orbit/page-detail-editor";

export default async function OrbitPageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <OrbitPageDetailEditor slug={slug} />;
}
