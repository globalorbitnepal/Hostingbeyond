import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const PUT_ROUTES = [
  "app/api/orbit/content/home/route.ts",
  "app/api/orbit/content/login/route.ts",
  "app/api/orbit/content/pricing/route.ts",
  "app/api/orbit/content/about/route.ts",
  "app/api/orbit/content/contact/route.ts",
  "app/api/orbit/content/hosting/route.ts",
  "app/api/orbit/content/cloud/route.ts",
  "app/api/orbit/content/domains/route.ts",
  "app/api/orbit/settings/route.ts",
];

describe("Orbit content PUT responses", () => {
  it("return the saved payload instead of re-reading the CMS cache", () => {
    for (const rel of PUT_ROUTES) {
      const text = fs.readFileSync(path.join(ROOT, rel), "utf8");
      const put = text.split("export async function PUT")[1] ?? "";
      assert.ok(put.length > 0, `${rel} missing PUT`);
      assert.doesNotMatch(
        put,
        /await get[A-Za-z]+\(/,
        `${rel} PUT must not re-read cached getters after save`,
      );
      assert.match(put, /await save[A-Za-z]+\(/, `${rel} PUT must save`);
    }
  });
});
