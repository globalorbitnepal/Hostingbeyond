import { PrismaClient } from "@prisma/client";
import {
  defaultHomeSections,
  defaultLoginPage,
  defaultSiteSettings,
} from "../lib/orbit/defaults.ts";

const prisma = new PrismaClient();

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default", data: defaultSiteSettings() },
    update: { data: defaultSiteSettings() },
  });

  await prisma.pageContent.upsert({
    where: { slug: "home" },
    create: {
      slug: "home",
      title: "Home",
      isPublished: true,
      isVisible: true,
      sections: defaultHomeSections(),
      seo: {
        title: "HostingBeyond — Beyond Hosting, Beyond Possibilities",
        description: defaultSiteSettings().description,
      },
    },
    update: { sections: defaultHomeSections() },
  });

  await prisma.pageContent.upsert({
    where: { slug: "login" },
    create: {
      slug: "login",
      title: "Login",
      isPublished: true,
      isVisible: true,
      sections: defaultLoginPage(),
      seo: {
        title: "Login — HostingBeyond",
        description: "Sign in to manage your HostingBeyond services.",
      },
    },
    update: { sections: defaultLoginPage() },
  });

  console.log("Prisma seed complete: site settings + home + login");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
