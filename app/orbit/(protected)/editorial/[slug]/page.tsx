"use client";

import { notFound } from "next/navigation";
import { use } from "react";

import { EditorialPageEditor } from "@/components/orbit/editorial-page-editor";
import { isEditorialSlug } from "@/lib/orbit/editorial-page-content";

export default function OrbitEditorialPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  if (!isEditorialSlug(slug)) notFound();
  return <EditorialPageEditor slug={slug} />;
}
