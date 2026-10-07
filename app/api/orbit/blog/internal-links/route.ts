import { NextRequest, NextResponse } from "next/server";

import { routes } from "@/config/routes";
import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const STATIC_PAGES = [
  { title: "Web Hosting", href: routes.hosting },
  { title: "Domain Name Search", href: routes.domainSearch },
  { title: "Business Email", href: routes.businessEmail },
  { title: "VPS Hosting", href: routes.vps },
  { title: "Cloud Hosting", href: routes.cloud },
  { title: "WordPress Hosting", href: "/web-hosting/wordpress" },
  { title: "Website Migration", href: routes.websiteMigration },
  { title: "Pricing", href: routes.pricing },
  { title: "Beyond AI", href: routes.beyondAi },
  { title: "Blog home", href: "/resources/blog" },
];

export async function GET(request: NextRequest) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";

  const posts = await prisma.blogPost.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    take: 12,
    select: { title: true, slug: true, status: true },
  });

  const blogLinks = posts.map((p) => ({
    title: p.title,
    href: `/resources/blog/${p.slug}`,
    kind: "blog",
    status: p.status,
  }));

  const staticFiltered = STATIC_PAGES.filter((p) =>
    !q ? true : p.title.toLowerCase().includes(q) || p.href.includes(q),
  );

  return NextResponse.json({
    results: [
      ...staticFiltered.map((p) => ({ ...p, kind: "page" })),
      ...blogLinks,
    ],
  });
}
