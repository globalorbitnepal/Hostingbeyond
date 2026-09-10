import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

async function main() {
  const counts = {
    AdminUser: await prisma.adminUser.count(),
    WebAuthnCredential: await prisma.webAuthnCredential.count(),
    AdminSession: await prisma.adminSession.count(),
    SiteSettings: await prisma.siteSettings.count(),
    PageContent: await prisma.pageContent.count(),
    MediaAsset: await prisma.mediaAsset.count(),
    ActivityLog: await prisma.activityLog.count(),
  };
  console.log("counts", JSON.stringify(counts, null, 2));

  // CMS / site content only — safe portable dump for another server
  const siteSettings = await prisma.siteSettings.findMany();
  const pageContent = await prisma.pageContent.findMany({
    orderBy: { slug: "asc" },
  });
  const mediaAsset = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "asc" },
  });

  // Admin identity without live sessions/challenges (passkeys are device+RP bound)
  const adminUsers = await prisma.adminUser.findMany({
    select: { id: true, displayName: true, createdAt: true, updatedAt: true },
  });
  const webAuthnCredentials = await prisma.webAuthnCredential.findMany();

  const dump = {
    exportedAt: new Date().toISOString(),
    note: "Orbit CMS + media metadata. Re-enroll passkeys on a new domain (ORBIT_RP_ID).",
    counts,
    siteSettings,
    pageContent,
    mediaAsset,
    adminUsers,
    webAuthnCredentials: webAuthnCredentials.map((c) => ({
      ...c,
      publicKey: Buffer.from(c.publicKey).toString("base64"),
      counter: c.counter.toString(),
    })),
  };

  const outDir = path.join(process.cwd(), "data", "db");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "orbit-cms-export.json");
  fs.writeFileSync(outFile, JSON.stringify(dump, null, 2), "utf8");
  console.log("wrote", outFile, "bytes", fs.statSync(outFile).size);

  // Also write a SQL-friendly content seed without auth secrets
  const seedFile = path.join(outDir, "orbit-content-seed.json");
  fs.writeFileSync(
    seedFile,
    JSON.stringify(
      {
        exportedAt: dump.exportedAt,
        siteSettings: siteSettings.map((r) => ({ id: r.id, data: r.data })),
        pageContent: pageContent.map((r) => ({
          slug: r.slug,
          title: r.title,
          isPublished: r.isPublished,
          isVisible: r.isVisible,
          seo: r.seo,
          sections: r.sections,
        })),
        mediaAsset: mediaAsset.map((r) => ({
          filename: r.filename,
          originalName: r.originalName,
          mimeType: r.mimeType,
          size: r.size,
          width: r.width,
          height: r.height,
          alt: r.alt,
          url: r.url,
        })),
      },
      null,
      2,
    ),
    "utf8",
  );
  console.log("wrote", seedFile, "bytes", fs.statSync(seedFile).size);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
