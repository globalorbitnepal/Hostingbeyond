import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
const currency = readFileSync(
  join(ROOT, "components/locale/currency-selector.tsx"),
  "utf8",
);
const language = readFileSync(
  join(ROOT, "components/locale/country-language-selector.tsx"),
  "utf8",
);

test("GT banner CSS cannot hide HostingBeyond body-portaled menus", () => {
  assert.match(
    css,
    /body\s*>\s*\.skiptranslate:not\(\[data-hb-ui\]\)/,
    "hide only Google's skiptranslate nodes, not data-hb-ui portals",
  );
  assert.doesNotMatch(
    css,
    /body\s*>\s*\.skiptranslate\s*,/,
    "unqualified body > .skiptranslate { display:none } hides the currency menu",
  );
});

test("currency menu portal is not skiptranslate (that class is display:none on body)", () => {
  const portal = currency.slice(currency.indexOf("createPortal"));
  assert.ok(portal.includes("createPortal"), "currency menu must portal");
  assert.doesNotMatch(portal, /\bskiptranslate\b/);
  assert.match(portal, /data-hb-ui="currency-menu"/);
  assert.match(portal, /\bnotranslate\b/);
});

test("language menu portal is tagged so GT hide CSS cannot match it", () => {
  const portal = language.slice(language.indexOf("createPortal"));
  assert.match(portal, /data-hb-ui="language-menu"/);
  assert.doesNotMatch(portal, /\bskiptranslate\b/);
});
