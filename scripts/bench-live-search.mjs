#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const path = resolve(process.cwd(), ".env");
  try {
    const text = readFileSync(path, "utf8");
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

const samples = [
  "google",
  "namecheap",
  "globalorbit",
  `hbsearch${Date.now()}`,
];

const times = [];
for (let i = 0; i < 10; i++) {
  const query = samples[i % samples.length];
  const t0 = Date.now();
  const { results, source } = await lookupDomainNames([query], { query });
  const ms = Date.now() - t0;
  times.push(ms);
  const com = results.find((r) => r.domain.endsWith(".com"));
  console.log(
    `#${i + 1}`,
    query,
    "source=" + source,
    com ? `${com.domain}:${com.status}` : "no-com",
    `${ms}ms`,
  );
}

const min = Math.min(...times);
const max = Math.max(...times);
const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
console.log("min_ms", min, "avg_ms", avg, "max_ms", max);
