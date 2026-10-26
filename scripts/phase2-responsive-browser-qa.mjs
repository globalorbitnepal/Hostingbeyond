#!/usr/bin/env node
/**
 * Host-local responsive QA (requires playwright in node_modules).
 * Usage:
 *   QA_BASE_URL=http://127.0.0.1:3104 node scripts/phase2-responsive-browser-qa.mjs
 *   Never point QA_BASE_URL at production (hosting.theglobalorbit.com) without owner approval.
 * Install once: npm install playwright && npx playwright install chromium
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:3104";
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(
    process.cwd(),
    ".playwright-browsers",
  );
}
const WIDTHS = [1440, 1280, 768, 390, 360];
const OUT_DIR =
  process.env.QA_OUT_DIR ||
  path.join(process.cwd(), ".qa-phase2-responsive");

const PAGES = [
  { name: "home", path: "/" },
  { name: "domain-search", path: "/domain-name-search" },
  { name: "bulk-search", path: "/bulk-domain-search" },
  {
    name: "bulk-limit-prefill",
    path:
      "/bulk-domain-search?bulk_limit=1&domains=" +
      encodeURIComponent("one.com\ntwo.com\neleven.com"),
  },
  { name: "domain-transfer", path: "/domain-transfer" },
  { name: "website-migration", path: "/website-migration" },
  { name: "get-started", path: "/get-started" },
  { name: "login", path: "/login" },
];

async function auditPage(page) {
  return await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const overflowX =
      Math.max(doc.scrollWidth, body?.scrollWidth ?? 0) > doc.clientWidth + 2;
    return {
      overflowX,
      title: document.title,
      h1: document.querySelector("h1")?.textContent?.trim()?.slice(0, 80) ?? "",
      hasBulkLimitCopy: /10 unique/i.test(body?.innerText ?? ""),
    };
  });
}

async function main() {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    console.error(
      "BLOCKED: playwright not installed. Run: npm install playwright && npx playwright install chromium",
    );
    process.exit(2);
  }

  await mkdir(OUT_DIR, { recursive: true });
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("BLOCKED: browser launch failed:", msg.split("\n")[0]);
    console.error(
      "If missing libatk or similar, authorized operator must run: sudo npx playwright install-deps",
    );
    console.error("Then: npx playwright install chromium");
    process.exit(3);
  }
  const report = [];

  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
    });
    for (const spec of PAGES) {
      const page = await context.newPage();
      const consoleErrors = [];
      const responseFailures = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      page.on("pageerror", (err) => consoleErrors.push(String(err)));
      page.on("response", (response) => {
        const status = response.status();
        if (status < 400 || status === 401) return;
        const url = response.url();
        if (url.includes("/api/domains/cart")) return;
        // Next.js link prefetch for missing CMS routes (footer/mega-menu), not chunk drift.
        if (status === 404 && url.includes("_rsc=")) return;
        if (status === 404 && url.includes("/_next/static/chunks/")) {
          responseFailures.push(`${status} ${url}`);
          return;
        }
        if (status >= 400) responseFailures.push(`${status} ${url}`);
      });

      const url = `${BASE}${spec.path}`;
      let status = 0;
      try {
        const res = await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 45000,
        });
        status = res?.status() ?? 0;
        if (spec.name === "bulk-limit-prefill") {
          await page
            .getByText(/10 unique/i)
            .first()
            .waitFor({ timeout: 8000 })
            .catch(() => {});
          // Auto bulk search runs on mount; let the in-flight request finish.
          await page.waitForTimeout(3500);
          consoleErrors.length = 0;
        }
        await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(
          () => {},
        );
        const audit = await auditPage(page);
        const shot = path.join(OUT_DIR, `${spec.name}-${width}.png`);
        await page.screenshot({ path: shot, fullPage: false });
        report.push({
          width,
          page: spec.name,
          status,
          ...audit,
          consoleErrors: consoleErrors.slice(-5),
          responseFailures: responseFailures.slice(-8),
        });
      } catch (e) {
        report.push({
          width,
          page: spec.name,
          status,
          error: e instanceof Error ? e.message : String(e),
        });
      }
      await page.close();
    }
    await context.close();
  }

  await browser.close();
  const outJson = path.join(OUT_DIR, "report.json");
  await writeFile(outJson, JSON.stringify(report, null, 2));
  function isBenignConsoleError(text) {
    if (!text) return false;
    if (/ChunkLoadError|Loading chunk \d+ failed/i.test(text)) return false;
    if (/Failed to load resource.*401/i.test(text)) return true;
    if (/401.*Unauthorized/i.test(text)) return true;
    if (/Failed to load resource.*404/i.test(text)) return true;
    return false;
  }

  const failures = report.filter((r) => {
    if (r.error) return true;
    if (r.status && r.status >= 400) return true;
    if (r.overflowX) return true;
    if ((r.responseFailures ?? []).length > 0) return true;
    const errors = (r.consoleErrors ?? []).filter((e) => !isBenignConsoleError(e));
    return errors.length > 0;
  });
  console.log(`WROTE ${outJson} checks=${report.length} issues=${failures.length}`);
  if (failures.length) {
    console.log(JSON.stringify(failures, null, 2));
    process.exit(1);
  }
  console.log("phase2-responsive-browser-qa: OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
