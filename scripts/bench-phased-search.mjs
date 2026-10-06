#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  try {
    const text = readFileSync(resolve(process.cwd(), ".env"), "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m) continue;
      let v = m[2].trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  } catch {
    /* no .env */
  }
}

loadEnv();
process.env.DOMAIN_AVAILABILITY_ENV =
  process.env.DOMAIN_AVAILABILITY_ENV || "live";

const { lookupDomainNames } = await import("../lib/domains/lookup.ts");
const { normalizeDomainSearchInput } = await import(
  "../lib/domains/normalize.ts"
);
const { SUGGESTED_TLDS } = await import("../lib/domains/tlds.ts");

async function timed(label, fn) {
  const t0 = Date.now();
  const out = await fn();
  console.log(label, Date.now() - t0 + "ms", out);
  return out;
}

const query = "theglobalorbit.com";
const normalized = normalizeDomainSearchInput(query);
if (!normalized.ok) throw new Error("bad query");
const { name, tld } = normalized;
const anchor = `${name}${tld || ".com"}`;
const extensions = tld
  ? [tld, ...SUGGESTED_TLDS.filter((x) => x !== tld)]
  : [...SUGGESTED_TLDS];
const altNames = extensions
  .map((e) => `${name}${e}`)
  .filter((d) => d !== anchor);

await timed("primary", async () => {
  const { results } = await lookupDomainNames([anchor], { query });
  return results[0]?.status;
});
await timed("alternatives", async () => {
  const { results } = await lookupDomainNames(altNames, { query });
  return results.filter((r) => r.status === "available").length + " available";
});
await timed("full bulk", async () => {
  const names = extensions.map((e) => `${name}${e}`);
  const { results } = await lookupDomainNames(names, { query });
  return results.length + " rows";
});
