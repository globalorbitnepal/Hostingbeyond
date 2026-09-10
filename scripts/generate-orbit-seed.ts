import fs from "node:fs";
import path from "node:path";
import {
  defaultHomeSections,
  defaultLoginPage,
  defaultSiteSettings,
} from "../lib/orbit/defaults";

const seed = {
  exportedAt: new Date().toISOString(),
  source: "lib/orbit/defaults.ts",
  note: "Full Orbit CMS content seed for cloning to another server. Run: npm run db:import",
  siteSettings: [{ id: "default", data: defaultSiteSettings() }],
  pageContent: [
    {
      slug: "home",
      title: "Home",
      isPublished: true,
      isVisible: true,
      seo: {
        title: "HostingBeyond — Beyond Hosting, Beyond Possibilities",
        description: defaultSiteSettings().description,
      },
      sections: defaultHomeSections(),
    },
    {
      slug: "login",
      title: "Login",
      isPublished: true,
      isVisible: true,
      seo: {
        title: "Login — HostingBeyond",
        description: "Sign in to manage your HostingBeyond services.",
      },
      sections: defaultLoginPage(),
    },
  ],
  mediaAsset: [] as Array<Record<string, unknown>>,
};

const outDir = path.join(process.cwd(), "data", "db");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "orbit-content-seed.json");
fs.writeFileSync(outFile, JSON.stringify(seed, null, 2), "utf8");
console.log("wrote", outFile, `(${fs.statSync(outFile).size} bytes)`);
