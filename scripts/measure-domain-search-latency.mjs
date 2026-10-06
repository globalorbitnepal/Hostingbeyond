#!/usr/bin/env node
/** Measure production fast search latency (no secrets). */
import { config as loadDotenv } from "dotenv";
loadDotenv();

const base =
  process.env.MEASURE_SEARCH_BASE_URL ??
  "https://hosting.theglobalorbit.com";

const labels = (
  process.argv[2] ?? "google,globalorbit,mytriphost,techindia,beyondai,fox ai"
).split(",");

async function timed(path, body) {
  const started = performance.now();
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  const ms = Math.round(performance.now() - started);
  return { ms, ok: res.ok, status: res.status, json };
}

console.log(
  "Query | PrimaryMs | FastTotalMs | AltCount | BulkFqdns | CacheHit | API Calls",
);
for (const label of labels) {
  const q = label.trim();
  if (!q) continue;
  const fast = await timed("/api/domains/search", { query: q, scope: "fast" });
  const t = fast.json.timings ?? {};
  const primary =
    fast.json.primary ?? fast.json.results?.[0] ?? null;
  const alts =
    fast.json.recommendations ??
    fast.json.results?.filter((r) => r.domain !== primary?.domain) ??
    [];
  console.log(
    [
      q,
      t.primary_provider_end && t.primary_provider_start
        ? t.primary_provider_end - t.primary_provider_start
        : fast.ms,
      t.total_request_time ?? fast.ms,
      alts.length,
      t.bulk_fqdn_count ?? "—",
      t.cache_hit ? "yes" : "no",
      t.provider_request_count ?? "—",
    ].join(" | "),
  );
}
