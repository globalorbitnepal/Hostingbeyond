#!/usr/bin/env node
/**
 * Phase 1 domain frontend smoke (HTTP + optional Playwright with mocked APIs).
 * Usage:
 *   QA_BASE_URL=http://127.0.0.1:3104 node scripts/phase1-domain-frontend-smoke.mjs
 * Browsers (no sudo): PLAYWRIGHT_BROWSERS_PATH=./.playwright-browsers npx playwright install chromium
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = (process.env.QA_BASE_URL ?? "http://127.0.0.1:3104").replace(
  /\/$/,
  "",
);
const BROWSERS_PATH =
  process.env.PLAYWRIGHT_BROWSERS_PATH ||
  path.join(process.cwd(), ".playwright-browsers");
const OUT = process.env.QA_OUT_DIR || path.join(process.cwd(), ".qa-phase1");

/** @type {{ id: string, area: string, result: 'PASS'|'FAIL'|'BLOCKED'|'NOT TESTED', detail?: string }[]} */
const results = [];

function record(id, area, result, detail = "") {
  results.push({ id, area, result, detail });
  const tag = result.padEnd(11);
  console.log(`[${tag}] ${area} — ${id}${detail ? `: ${detail}` : ""}`);
}

async function fetchText(urlPath) {
  const res = await fetch(`${BASE}${urlPath}`);
  const text = await res.text();
  return { status: res.status, text };
}

async function runHttpSmoke() {
  const routes = [
    ["/domain-name-search", "domain-name-search", "h1"],
    ["/bulk-domain-search", "bulk-domain-search", "domain-bulk-search"],
    ["/domain-transfer", "domain-transfer", "domain-transfer-name"],
    ["/website-migration", "website-migration", "Request a migration"],
  ];
  for (const [route, id, needle] of routes) {
    try {
      const { status, text } = await fetchText(route);
      if (status >= 500) {
        record(id, "HTTP load", "FAIL", `status ${status}`);
        continue;
      }
      if (!text.includes(needle) && needle !== "h1") {
        record(id, "HTTP load", "FAIL", `missing ${needle}`);
        continue;
      }
      if (needle === "h1" && !/<h1[\s>]/i.test(text)) {
        record(id, "HTTP load", "FAIL", "missing h1");
        continue;
      }
      record(id, "HTTP load", "PASS", String(status));
    } catch (e) {
      record(id, "HTTP load", "FAIL", e instanceof Error ? e.message : String(e));
    }
  }

  const mig = await fetchText("/website-migration");
  if (
    /migration request/i.test(mig.text) &&
    /does not transfer your domain|not move files automatically|request/i.test(
      mig.text,
    )
  ) {
    record("migration-copy", "Website migration", "PASS", "request-only copy");
  } else {
    record(
      "migration-copy",
      "Website migration",
      "FAIL",
      "missing request-only messaging",
    );
  }

  const bulkLimit = await fetchText(
    `/bulk-domain-search?bulk_limit=1&domains=${encodeURIComponent("a.com\nb.com\nc.com\nd.com\ne.com\nf.com\ng.com\nh.com\ni.com\nj.com\nk.com")}`,
  );
  if (/10 unique/i.test(bulkLimit.text)) {
    record("bulk-limit-copy", "Bulk search", "PASS", "limit copy in HTML");
  } else {
    record("bulk-limit-copy", "Bulk search", "FAIL", "no 10 unique copy");
  }

  const bulkPage = await fetchText("/bulk-domain-search");
  const staleBulkFifty =
    /\b0\/50\b|50\s*names?\s*per\s*run|up to 50 domain|check 50 domain/i;
  if (!staleBulkFifty.test(bulkPage.text) && /\/10\b|0\/10/.test(bulkPage.text)) {
    record("bulk-no-stale-50", "Bulk search", "PASS", "counter/limit in HTML");
  } else if (staleBulkFifty.test(bulkPage.text)) {
    record("bulk-no-stale-50", "Bulk search", "FAIL", "stale 50-domain copy");
  } else {
    record("bulk-no-stale-50", "Bulk search", "FAIL", "missing 0/10 counter");
  }
}

async function runApiBoundarySmoke() {
  try {
    const eleven = Array.from({ length: 11 }, (_, i) => `p1-${i}.example`).join(
      "\n",
    );
    const r11 = await fetch(`${BASE}/api/domains/search`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bulk: eleven }),
    });
    const j11 = await r11.json();
    if (r11.status === 400 && j11.code === "bulk_limit_exceeded") {
      record("api-bulk-11", "API boundary", "PASS");
    } else {
      record(
        "api-bulk-11",
        "API boundary",
        "FAIL",
        `status ${r11.status} code ${j11?.code}`,
      );
    }
  } catch (e) {
    record("api-bulk-11", "API boundary", "FAIL", String(e));
  }

  try {
    const tr = await fetch(`${BASE}/api/domains/transfer-check`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ domain: "" }),
    });
    if (tr.status === 400) {
      record("api-transfer-empty", "API boundary", "PASS");
    } else {
      record("api-transfer-empty", "API boundary", "FAIL", `status ${tr.status}`);
    }
  } catch (e) {
    record("api-transfer-empty", "API boundary", "FAIL", String(e));
  }

  try {
    const mig = await fetch(`${BASE}/api/migration/request`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ customerName: "x" }),
    });
    if (mig.status === 400) {
      record("api-migration-invalid", "API boundary", "PASS");
    } else {
      record(
        "api-migration-invalid",
        "API boundary",
        "FAIL",
        `status ${mig.status}`,
      );
    }
  } catch (e) {
    record("api-migration-invalid", "API boundary", "FAIL", String(e));
  }
}

function mockPrimaryResult(domain, status = "available") {
  const [name, tldRaw] = domain.includes(".")
    ? [domain.split(".")[0], `.${domain.split(".").slice(1).join(".")}`]
    : [domain, ".com"];
  const tld = tldRaw.startsWith(".") ? tldRaw : `.${tldRaw}`;
  return {
    domain: `${name}${tld}`.toLowerCase(),
    name,
    tld,
    status,
    register: 9.99,
    renew: 12.99,
    transfer: 9.99,
  };
}

async function tryLaunchPlaywright() {
  process.env.PLAYWRIGHT_BROWSERS_PATH = BROWSERS_PATH;
  process.env.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "1";
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    return { ok: false, reason: "playwright package not importable" };
  }
  try {
    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
    await browser.close();
    return { ok: true, chromium };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("libatk") || msg.includes("shared libraries")) {
      return {
        ok: false,
        reason:
          "Chromium missing OS libs (libatk-1.0.so.0 etc.). Operator: sudo npx playwright install-deps",
      };
    }
    return { ok: false, reason: msg.split("\n")[0] };
  }
}

async function runPlaywrightSmoke(chromium) {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const viewports = [
    { name: "desktop", width: 1280, height: 900 },
    { name: "mobile", width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();

    // --- A. Domain search (mocked) ---
    let searchAttempts = 0;
    await page.route("**/api/domains/search", async (route) => {
      const body = route.request().postDataJSON();
      if (!body?.query) {
        return route.continue();
      }
      if (body.scope === "alternatives" || body.scope === "deep") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            recommendations: [],
            alternativesComplete: true,
          }),
        });
      }
      searchAttempts += 1;
      // 400 is not auto-retried by the client (503/502 are retried once in-flight).
      if (searchAttempts === 1) {
        return route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ error: "temporarily unavailable" }),
        });
      }
      const row = mockPrimaryResult("phase1-smoke-test.com", "available");
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          primary: row,
          anchorDomain: row.domain,
          results: [row],
          alternativesComplete: true,
        }),
      });
    });
    await page.route("**/api/domains/cart**", async (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({
          status: 200,
          body: JSON.stringify({ count: 0, items: [] }),
        });
      }
      if (route.request().method() === "POST") {
        return route.fulfill({
          status: 200,
          body: JSON.stringify({
            cart: { count: 1 },
            added: ["phase1-smoke-test.com"],
          }),
        });
      }
      return route.continue();
    });

    const searchUrl = `${BASE}/domain-name-search`;
    const searchRes = await page.goto(searchUrl, {
      waitUntil: "domcontentloaded",
      timeout: 90000,
    });
    if ((searchRes?.status() ?? 0) < 500) {
      record(`search-load-${vp.name}`, "Domain search", "PASS", vp.name);
    } else {
      record(`search-load-${vp.name}`, "Domain search", "FAIL", vp.name);
    }

    const searchInput = page.locator("#domain-name-search");
    await searchInput.waitFor({ state: "visible", timeout: 30000 });
    await searchInput.fill("phase1-smoke-test");
    const searchSubmit = page
      .locator("form")
      .filter({ has: searchInput })
      .getByRole("button", { name: /search domain/i });
    await searchSubmit.waitFor({ state: "visible", timeout: 15000 });
    await searchSubmit.click();
    await page.getByText(/try again/i).waitFor({ timeout: 8000 }).catch(() => {});
    await page.getByRole("button", { name: /try again/i }).click();
    await page
      .locator(".hb-domain-search-results")
      .getByText(/available/i)
      .first()
      .waitFor({ timeout: 12000 });
    const priceVisible = await page
      .locator(".hb-domain-search-results")
      .getByText(/\$9\.99/)
      .first()
      .isVisible();
    record(
      `search-retry-mock-${vp.name}`,
      "Domain search",
      searchAttempts >= 2 ? "PASS" : "FAIL",
      `attempts=${searchAttempts}`,
    );
    record(
      `search-price-${vp.name}`,
      "Domain search",
      priceVisible ? "PASS" : "FAIL",
      vp.name,
    );

    await page.unroute("**/api/domains/search");
    await page.unroute("**/api/domains/cart**");

    // --- B. Bulk (mocked) ---
    await page.route("**/api/domains/search", async (route) => {
      const body = route.request().postDataJSON();
      if (!body?.bulk) return route.continue();
      const lines = String(body.bulk)
        .split(/\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      const results = lines.map((line, i) => {
        if (line.startsWith("bad")) {
          return mockPrimaryResult(`${line}.com`, "invalid");
        }
        if (line.startsWith("fail")) {
          return {
            ...mockPrimaryResult(`${line}.com`, "unknown"),
            register: null,
            renew: null,
          };
        }
        return mockPrimaryResult(`${line}.com`, i % 2 === 0 ? "available" : "taken");
      });
      return route.fulfill({
        status: 200,
        body: JSON.stringify({ results, source: "registrar" }),
      });
    });

    await page.goto(`${BASE}/bulk-domain-search`, {
      waitUntil: "domcontentloaded",
    });
    const counterText = await page
      .locator("#domain-bulk-search")
      .locator("xpath=ancestor::form[1]")
      .locator("span[aria-live='polite']")
      .first()
      .textContent()
      .catch(() => "");
    const counterOk = /^\s*0\/10\s*$/.test(counterText ?? "");
    record(
      `bulk-counter-initial-${vp.name}`,
      "Bulk search",
      counterOk ? "PASS" : "FAIL",
      `counter=${JSON.stringify(counterText?.trim())}`,
    );
    const bodyText = await page.locator("body").innerText();
    const stale50 =
      /\b0\/50\b|50\s*names?\s*per\s*run|up to 50 domain/i.test(bodyText);
    record(
      `bulk-no-stale-50-${vp.name}`,
      "Bulk search",
      stale50 ? "FAIL" : "PASS",
      vp.name,
    );
    await page.fill(
      "#domain-bulk-search",
      "good1.com\ngood2.com\nfailcheck.com\nbad-name\n good1.com ",
    );
    await page.getByRole("button", { name: /check all domains/i }).click();
    await page.getByText(/available|registered|not valid/i).first().waitFor({
      timeout: 15000,
    });
    const retryFailed = page.getByRole("button", { name: /retry failed/i });
    const hasRetry = await retryFailed.isVisible().catch(() => false);
    record(
      `bulk-results-${vp.name}`,
      "Bulk search",
      "PASS",
      `retry-failed-visible=${hasRetry}`,
    );

    await page.fill(
      "#domain-bulk-search",
      Array.from({ length: 11 }, (_, i) => `x${i}.com`).join("\n"),
    );
    const overLimit = await page
      .getByText(/10 unique/i)
      .first()
      .isVisible()
      .catch(() => false);
    record(
      `bulk-over-limit-${vp.name}`,
      "Bulk search",
      overLimit ? "PASS" : "FAIL",
      vp.name,
    );

    await page.unroute("**/api/domains/search");

    // --- C. Transfer (mocked) ---
    await page.route("**/api/domains/transfer-check", async (route) => {
      return route.fulfill({
        status: 200,
        body: JSON.stringify({
          result: {
            domain: "transfer-smoke.example",
            status: "eligible",
            eligible: true,
            transferPrice: 8.99,
            renewPrice: 12.99,
            purchasable: true,
            registryCheckOnly: true,
            message: "Appears registered — not a guarantee.",
            checkoutHref: "/get-started?transfer=transfer-smoke.example",
          },
        }),
      });
    });

    await page.goto(`${BASE}/domain-transfer`, { waitUntil: "domcontentloaded" });
    const navTransfer = await page
      .getByRole("link", { name: /transfer/i })
      .first()
      .isVisible();
    record(
      `transfer-nav-${vp.name}`,
      "Domain transfer",
      navTransfer ? "PASS" : "FAIL",
      vp.name,
    );
    await page.fill("#domain-transfer-name", "transfer-smoke.example");
    await page.getByRole("button", { name: /check transfer/i }).click();
    await page.getByText(/review and continue/i).waitFor({ timeout: 10000 });
    await page.getByRole("button", { name: /review and continue/i }).click();
    const checkoutLink = page.getByRole("link", {
      name: /continue to checkout/i,
    });
    const disabled = await checkoutLink.getAttribute("aria-disabled");
    record(
      `transfer-review-gate-${vp.name}`,
      "Domain transfer",
      disabled === "true" ? "PASS" : "FAIL",
      "checkout gated",
    );
    await page.unroute("**/api/domains/transfer-check");

    // --- D. Migration (mocked POST) ---
    await page.route("**/api/migration/request", async (route) => {
      return route.fulfill({
        status: 200,
        body: JSON.stringify({
          message: "Request MIG-TEST received.",
          requestId: "MIG-TEST",
        }),
      });
    });
    await page.goto(`${BASE}/website-migration#migration-request`, {
      waitUntil: "domcontentloaded",
    });
    await page.fill("#migration-customer-name", "Phase One QA");
    await page.fill("#migration-customer-email", "qa@example.com");
    await page.getByRole("button", { name: /submit migration request/i }).click();
    const status = page.getByRole("status");
    await status.waitFor({ timeout: 10000 });
    const ok = (await status.textContent())?.includes("MIG-TEST");
    record(
      `migration-form-${vp.name}`,
      "Website migration",
      ok ? "PASS" : "FAIL",
      vp.name,
    );
    await page.unroute("**/api/migration/request");

    await context.close();
  }

  await browser.close();
}

async function main() {
  await mkdir(OUT, { recursive: true });
  console.log(`Phase 1 smoke — base ${BASE}`);
  console.log(`Playwright browsers path: ${BROWSERS_PATH}`);

  await runHttpSmoke();
  await runApiBoundarySmoke();

  const launch = await tryLaunchPlaywright();
  if (!launch.ok) {
    record("playwright-launch", "Browser infra", "BLOCKED", launch.reason);
    const browserIds = [
      "search-load-desktop",
      "search-load-mobile",
      "search-retry-mock-desktop",
      "search-retry-mock-mobile",
      "bulk-results-desktop",
      "transfer-nav-mobile",
      "migration-form-desktop",
    ];
    for (const id of browserIds) {
      record(id, "Playwright UI", "BLOCKED", launch.reason);
    }
  } else {
    record("playwright-launch", "Browser infra", "PASS");
    try {
      await runPlaywrightSmoke(launch.chromium);
    } catch (e) {
      record(
        "playwright-suite",
        "Playwright UI",
        "FAIL",
        e instanceof Error ? e.message : String(e),
      );
    }
  }

  const summary = {
    base: BASE,
    browsersPath: BROWSERS_PATH,
    results,
    pass: results.filter((r) => r.result === "PASS").length,
    fail: results.filter((r) => r.result === "FAIL").length,
    blocked: results.filter((r) => r.result === "BLOCKED").length,
  };
  await writeFile(
    path.join(OUT, "phase1-smoke-report.json"),
    JSON.stringify(summary, null, 2),
  );
  console.log(
    `\nSummary: PASS=${summary.pass} FAIL=${summary.fail} BLOCKED=${summary.blocked}`,
  );
  process.exit(summary.fail > 0 ? 1 : summary.blocked > 0 ? 2 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
