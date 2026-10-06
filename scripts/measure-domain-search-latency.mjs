#!/usr/bin/env node
/** Measure production fast search latency (no secrets). */
import { config as loadDotenv } from "dotenv";
loadDotenv();

const base =
  process.env.MEASURE_SEARCH_BASE_URL ??
  "https://hosting.theglobalorbit.com";

const labels = (
  process.argv[2] ??
  "fox ai,mytriphost,techindia,beyondai,google,globalorbit"
).split(",");

async function timedFast(query) {
  const started = performance.now();
  const res = await fetch(`${base}/api/domains/search`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, scope: "fast" }),
  });
  const serverTiming = res.headers.get("server-timing") ?? "";
  const json = await res.json();
  const wallMs = Math.round(performance.now() - started);
  return { wallMs, ok: res.ok, json, serverTiming };
}

console.log(
  "query | cache | calls | bulk | wallMs | totalMs | alts | overlap | server-timing",
);

for (const label of labels) {
  const q = label.trim();
  if (!q) continue;
  const { wallMs, json, serverTiming } = await timedFast(q);
  const t = json.timings ?? {};
  const alts = json.recommendations?.length ?? 0;
  console.log(
    [
      q,
      t.cache_hit ? "hit" : "miss",
      t.provider_request_count ?? "—",
      t.bulk_fqdn_count ?? "—",
      wallMs,
      t.total_request_time ?? wallMs,
      alts,
      t.dna_requests_overlap ? "yes" : "no",
      serverTiming || t.server_timing || "—",
    ].join(" | "),
  );
  if (t.dna_requests?.length) {
    for (const d of t.dna_requests) {
      console.log(
        `  dna#${d.index} domains=${d.domainCount} slot→http ${d.httpStartAt - d.slotAcquiredAt}ms http=${d.providerMs}ms`,
      );
    }
  }
}

const cold = `zzyxprobe${Date.now().toString(36)}`;
console.log(`\nCold probe: ${cold}`);
const coldRun = await timedFast(cold);
const ct = coldRun.json.timings ?? {};
console.log(
  [
    cold,
    ct.cache_hit ? "hit" : "miss",
    ct.provider_request_count,
    ct.bulk_fqdn_count,
    coldRun.wallMs,
    ct.total_request_time,
    coldRun.json.recommendations?.length ?? 0,
    ct.dna_requests_overlap ? "yes" : "no",
    coldRun.serverTiming,
  ].join(" | "),
);
