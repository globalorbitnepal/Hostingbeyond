import { chromium, firefox } from "playwright";

const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:3040";
const WIDTHS = [390, 430, 768, 1024, 1280, 1440];
const PATH =
  "/checkout/hosting?product=web-hosting&plan=essential&billing=annually";

async function audit(page) {
  return await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const overflowX =
      Math.max(doc.scrollWidth, body.scrollWidth) >
      doc.clientWidth + 1;
    const buttons = [...document.querySelectorAll("button")].map((b) => ({
      text: (b.textContent || "").trim().slice(0, 40),
      rect: b.getBoundingClientRect(),
      visible:
        b.offsetParent !== null &&
        b.getBoundingClientRect().width > 0 &&
        b.getBoundingClientRect().height > 0,
    }));
    const continueBtns = buttons.filter((b) =>
      /continue|next step/i.test(b.text),
    );
    const fixedBar = document.querySelector(
      ".fixed.inset-x-0.bottom-0",
    );
    let fixedCoversContent = false;
    if (fixedBar && window.innerWidth < 1024) {
      const lastSection = document.querySelector("main, .space-y-6, section");
      const target = lastSection || body;
      const br = target.getBoundingClientRect();
      const fr = fixedBar.getBoundingClientRect();
      fixedCoversContent = br.bottom > fr.top - 8 && br.bottom > window.innerHeight - 20;
    }
    const summary = document.body.innerText.includes("Order summary");
    const total = document.body.innerText.match(/Total[\s\S]{0,40}\$[\d.]+/);
    return {
      overflowX,
      scrollW: doc.scrollWidth,
      clientW: doc.clientWidth,
      continueCount: continueBtns.length,
      continueVisible: continueBtns.some((b) => b.visible),
      summary,
      totalOk: Boolean(total),
      fixedCoversContent,
    };
  });
}

async function runWidth(browser, width) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
  });
  const page = await context.newPage();
  const url = `${BASE}${PATH}`;
  const res = await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  const status = res?.status() ?? 0;
  if (status !== 200) {
    await context.close();
    return { width, pass: false, reason: `HTTP ${status}` };
  }
  await page.waitForTimeout(500);
  const a = await audit(page);
  await page.goto(`${url}&step=review`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const reviewHasEdit = await page.evaluate(() =>
    document.body.innerText.includes("Edit configuration"),
  );
  await context.close();
  const pass =
    !a.overflowX &&
    a.continueVisible &&
    a.summary &&
    a.totalOk &&
    !a.fixedCoversContent &&
    reviewHasEdit;
  return {
    width,
    pass,
    ...a,
    reviewHasEdit,
    reason: pass
      ? "ok"
      : [
          a.overflowX ? "overflow" : null,
          !a.continueVisible ? "continue-hidden" : null,
          !a.summary ? "no-summary" : null,
          !a.totalOk ? "no-total" : null,
          a.fixedCoversContent ? "fixed-bar-covers" : null,
          !reviewHasEdit ? "review-edit-missing" : null,
        ]
          .filter(Boolean)
          .join(","),
  };
}

const ffPath =
  process.env.PLAYWRIGHT_FIREFOX_EXECUTABLE ||
  "/tmp/cursor-sandbox-cache/98341c7d32a9fed690a22806761c44bd/playwright/firefox-1466/firefox/firefox";
const browser = await firefox.launch({
  headless: true,
  executablePath: ffPath,
});
const results = [];
for (const w of WIDTHS) {
  results.push(await runWidth(browser, w));
}
await browser.close();

for (const r of results) {
  console.log(`${r.width}: ${r.pass ? "PASS" : "FAIL"} ${r.reason || ""}`);
}

process.exit(results.every((r) => r.pass) ? 0 : 1);
