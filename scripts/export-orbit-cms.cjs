/**
 * Export Orbit CMS rows (pages, settings, media) for Git.
 * Does not export admin users, passkeys, sessions, or env secrets.
 */
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { PrismaClient } = require("@prisma/client");

const outDir = path.join(__dirname, "..", "prisma", "data");
const outFile = path.join(outDir, "orbit-cms.json");

async function main() {
  const prisma = new PrismaClient();
  try {
    const [siteSettings, pages, media] = await Promise.all([
      prisma.siteSettings.findMany(),
      prisma.pageContent.findMany({ orderBy: { slug: "asc" } }),
      prisma.mediaAsset.findMany({ orderBy: { createdAt: "asc" } }),
    ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      siteSettings: siteSettings.map((row) => ({
        id: row.id,
        data: row.data,
      })),
      pages: pages.map((row) => ({
        slug: row.slug,
        title: row.title,
        isPublished: row.isPublished,
        isVisible: row.isVisible,
        seo: row.seo,
        sections: row.sections,
      })),
      media: media.map((row) => ({
        filename: row.filename,
        originalName: row.originalName,
        mimeType: row.mimeType,
        size: row.size,
        width: row.width,
        height: row.height,
        alt: row.alt,
        url: row.url,
      })),
    };

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outFile, `${JSON.stringify(payload, null, 2)}\n`);
    console.log(
      `Exported ${payload.pages.length} pages, ${payload.siteSettings.length} settings, ${payload.media.length} media -> prisma/data/orbit-cms.json`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Orbit CMS export failed:", error.message);
  process.exit(1);
});
