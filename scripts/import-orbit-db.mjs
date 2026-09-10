import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const seedPath = path.join(process.cwd(), "data", "db", "orbit-content-seed.json");

async function main() {
  if (!fs.existsSync(seedPath)) {
    throw new Error(`Missing seed file: ${seedPath}`);
  }

  const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));

  for (const row of seed.siteSettings ?? []) {
    await prisma.siteSettings.upsert({
      where: { id: row.id },
      create: { id: row.id, data: row.data },
      update: { data: row.data },
    });
  }

  for (const row of seed.pageContent ?? []) {
    await prisma.pageContent.upsert({
      where: { slug: row.slug },
      create: {
        slug: row.slug,
        title: row.title,
        isPublished: row.isPublished ?? true,
        isVisible: row.isVisible ?? true,
        seo: row.seo ?? undefined,
        sections: row.sections,
      },
      update: {
        title: row.title,
        isPublished: row.isPublished ?? true,
        isVisible: row.isVisible ?? true,
        seo: row.seo ?? undefined,
        sections: row.sections,
      },
    });
  }

  for (const row of seed.mediaAsset ?? []) {
    const existing = await prisma.mediaAsset.findFirst({
      where: { filename: row.filename },
    });
    if (existing) {
      await prisma.mediaAsset.update({
        where: { id: existing.id },
        data: {
          originalName: row.originalName,
          mimeType: row.mimeType,
          size: row.size,
          width: row.width,
          height: row.height,
          alt: row.alt,
          url: row.url,
        },
      });
    } else {
      await prisma.mediaAsset.create({ data: row });
    }
  }

  console.log("Seeded Orbit CMS content from", seedPath);
  console.log({
    siteSettings: seed.siteSettings?.length ?? 0,
    pageContent: seed.pageContent?.length ?? 0,
    mediaAsset: seed.mediaAsset?.length ?? 0,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
