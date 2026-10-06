#!/usr/bin/env node
/** Measure production search latency (no secrets). */
import { config as loadDotenv } from "dotenv";
loadDotenv();

const base =
  process.env.MEASURE_SEARCH_BASE_URL ??
  "https://hosting.theglobalorbit.com";

const labels = (process.argv[2] ?? "mytriphost,techindia,beyondai").split(
  ",",
);

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

for (const label of labels) {
  const q = label.trim();
  if (!q) continue;

  const primaryStarted = performance.now();
  const [primary, alt] = await Promise.all([
    timed("/api/domains/search", { query: q, scope: "primary" }),
    timed("/api/domains/search", { query: q, scope: "alternatives", tier: 1 }),
  ]);
  const wallMs = Math.round(performance.now() - primaryStarted);

  console.log(
    JSON.stringify({
      query: q,
      wallParallelMs: wallMs,
      primaryMs: primary.ms,
      primaryStatus: primary.json.results?.[0]?.status,
      altMs: alt.ms,
      altCount: alt.json.results?.length ?? 0,
      extensionsChecked: alt.json.extensionsChecked ?? null,
      suggestTier2: alt.json.suggestTier2 ?? null,
      batchMs: alt.json.timings?.batchMs ?? null,
    }),
  );
}
