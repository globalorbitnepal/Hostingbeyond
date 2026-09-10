const { readFileSync } = require("fs");
const { join } = require("path");
const { PrismaClient, Prisma } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const seedPath = join(__dirname, "data", "orbit-cms.json");
  const seed = JSON.parse(readFileSync(seedPath, "utf8"));

  for (const row of seed.siteSettings ?? []) {
    await prisma.siteSettings.upsert({
      where: { id: row.id },
      create: { id: row.id, data: row.data },
      update: { data: row.data },
    });
  }

  for (const page of seed.pages ?? []) {
    await prisma.pageContent.upsert({
      where: { slug: page.slug },
      create: {
        slug: page.slug,
        title: page.title,
        isPublished: page.isPublished,
        isVisible: page.isVisible,
        seo: page.seo ?? Prisma.JsonNull,
        sections: page.sections,
      },
      update: {
        title: page.title,
        isPublished: page.isPublished,
        isVisible: page.isVisible,
        seo: page.seo ?? Prisma.JsonNull,
        sections: page.sections,
      },
    });
  }

  for (const asset of seed.media ?? []) {
    const existing = await prisma.mediaAsset.findFirst({
      where: { url: asset.url },
    });
    if (existing) {
      await prisma.mediaAsset.update({
        where: { id: existing.id },
        data: {
          filename: asset.filename,
          originalName: asset.originalName,
          mimeType: asset.mimeType,
          size: asset.size,
          width: asset.width,
          height: asset.height,
          alt: asset.alt,
        },
      });
    } else {
      await prisma.mediaAsset.create({ data: asset });
    }
  }

  console.log(
    `Seeded Orbit CMS: ${seed.pages?.length ?? 0} pages, ${seed.siteSettings?.length ?? 0} settings, ${seed.media?.length ?? 0} media`,
  );
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
