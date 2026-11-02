import { NextResponse } from "next/server";

import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import {
  embeddedSeoFromAboutSections,
  embeddedSeoFromContactSections,
  getOrbitPageInventory,
} from "@/lib/orbit/page-inventory";
import { mergeStoredPageSeo, type StoredPageSeo } from "@/lib/orbit/page-seo";
import { scorePageSeo } from "@/lib/orbit/page-seo-score";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const inventory = getOrbitPageInventory();
  const rows = await prisma.pageContent.findMany({
    select: {
      slug: true,
      title: true,
      isPublished: true,
      isVisible: true,
      updatedAt: true,
      seo: true,
      sections: true,
    },
  });
  const bySlug = new Map(rows.map((row) => [row.slug, row]));

  const pages = inventory.map((entry) => {
    const seoRow = bySlug.get(entry.slug);
    const cmsRow = entry.cmsSlug ? bySlug.get(entry.cmsSlug) : undefined;

    let seo: StoredPageSeo = mergeStoredPageSeo(
      seoRow?.seo,
      entry.defaultSeo ?? {},
    );

    if (entry.slug === "about" && cmsRow?.sections) {
      const embedded = embeddedSeoFromAboutSections(cmsRow.sections);
      if (embedded) {
        seo = mergeStoredPageSeo(seo, embedded);
      }
    }
    if (entry.slug === "contact" && cmsRow?.sections) {
      const embedded = embeddedSeoFromContactSections(cmsRow.sections);
      if (embedded) {
        seo = mergeStoredPageSeo(seo, embedded);
      }
    }

    const updatedAt =
      [seoRow?.updatedAt, cmsRow?.updatedAt]
        .filter(Boolean)
        .sort(
          (a, b) =>
            new Date(b as Date).getTime() - new Date(a as Date).getTime(),
        )[0] ?? null;

    const hasStoredSeo = Boolean(
      seoRow?.seo &&
      typeof seoRow.seo === "object" &&
      Object.keys(seoRow.seo as object).length > 0,
    );
    const hasCmsContent = Boolean(
      cmsRow?.sections &&
      typeof cmsRow.sections === "object" &&
      Object.keys(cmsRow.sections as object).length > 0,
    );

    const scored = scorePageSeo(seo, entry.path);

    return {
      slug: entry.slug,
      label: entry.label,
      path: entry.path,
      category: entry.category,
      editorHref: entry.editorHref,
      note: entry.note,
      cmsSlug: entry.cmsSlug,
      seoMode: entry.seoMode,
      contentEditorLabel: entry.contentEditorLabel,
      isPublished: cmsRow?.isPublished ?? seoRow?.isPublished ?? true,
      isVisible: cmsRow?.isVisible ?? seoRow?.isVisible ?? true,
      updatedAt: updatedAt ? updatedAt.toISOString() : null,
      hasStoredSeo,
      hasCmsContent,
      seo,
      seoScore: scored.score,
      seoGrade: scored.grade,
    };
  });

  return NextResponse.json({ pages });
}
