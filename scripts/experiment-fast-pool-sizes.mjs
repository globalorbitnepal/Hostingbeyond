#!/usr/bin/env node
/**
 * Controlled fast-pool experiment — LIVE DNA, same code path as production fast search.
 * Does NOT change deployed pool size. Clears caches before every run (true cold).
 *
 * Usage: node --import tsx scripts/experiment-fast-pool-sizes.mjs
 */
import { config as loadDotenv } from "dotenv";
import { writeFileSync } from "node:fs";

loadDotenv();

process.env.DOMAIN_API_ENV = process.env.DOMAIN_API_ENV ?? "live";
process.env.DOMAIN_AVAILABILITY_ENV =
  process.env.DOMAIN_AVAILABILITY_ENV ?? "live";

const POOL_CONFIGS = [
  { id: "A", tlds: 14, note: "current production default" },
  { id: "B", tlds: 10 },
  { id: "C", tlds: 8 },
  { id: "D", tlds: 6 },
  { id: "E", tlds: 5 },
];

const QUERIES = [
  "fox ai",
  "mytriphost",
  "techindia",
  "beyondai",
  "globalorbit",
];

function coldSuffix() {
  return `zzyx${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

async function loadModules() {
  const { clearFastSearchCacheForTests } = await import(
    "../lib/domains/fast-search-cache.ts"
  );
  const { clearSearchCacheForTests } = await import(
    "../lib/domains/availability-cache.ts"
  );
  const {
    invalidateFastTldPoolCache,
    getFastCustomerTldPool,
  } = await import("../lib/domains/recommendation-tlds.ts");
  const { runFastCustomerSearch } = await import(
    "../lib/domains/fast-domain-search.ts"
  );
  const { resetDnaProviderMetricsForTests } = await import(
    "../lib/domains/providers/dna-rate-limiter.ts"
  );
  const { clearDnaRequestTraces } = await import(
    "../lib/domains/providers/dna-request-trace.ts"
  );
  return {
    clearFastSearchCacheForTests,
    clearSearchCacheForTests,
    invalidateFastTldPoolCache,
    getFastCustomerTldPool,
    runFastCustomerSearch,
    resetDnaProviderMetricsForTests,
    clearDnaRequestTraces,
  };
}

function summarizeDna(traces) {
  if (!traces?.length) return { calls: 0, bulkSizes: [], httpMs: [], overlap: false };
  const httpMs = traces.map((t) => t.providerMs);
  return {
    calls: traces.length,
    bulkSizes: traces.map((t) => t.domainCount),
    httpMs,
    overlap: traces.length >= 2
      ? traces[0].httpStartAt < traces[1].httpEndAt &&
        traces[1].httpStartAt < traces[0].httpEndAt
      : false,
  };
}

async function main() {
  const mods = await loadModules();
  const rows = [];

  for (const pool of POOL_CONFIGS) {
    process.env.DOMAIN_FAST_POOL_TLDS = String(pool.tlds);
    mods.invalidateFastTldPoolCache();

    const poolTlds = await mods.getFastCustomerTldPool();
    const randomCold = coldSuffix();
    const queries = [...QUERIES, randomCold];

    for (const query of queries) {
      mods.clearFastSearchCacheForTests();
      mods.clearSearchCacheForTests();
      mods.invalidateFastTldPoolCache();
      mods.clearDnaRequestTraces();
      mods.resetDnaProviderMetricsForTests();

      const started = performance.now();
      const result = await mods.runFastCustomerSearch(query);
      const wallMs = Math.round(performance.now() - started);
      const t = result.timings;
      const dna = summarizeDna(t.dna_requests);

      rows.push({
        poolId: pool.id,
        poolTldTarget: pool.tlds,
        poolTldsResolved: poolTlds.length,
        poolTldList: poolTlds,
        query,
        cacheHit: t.cache_hit,
        fqdnCount: t.bulk_fqdn_count,
        dnaCalls: t.provider_request_count,
        dnaBulkSizes: dna.bulkSizes,
        dnaHttpMs: dna.httpMs,
        dnaOverlap: dna.overlap,
        wallMs,
        totalMs: t.total_request_time,
        catalogueMs: t.catalogue_ms,
        filterMs: t.filter_ms,
        firstAltReadyMs: t.first_alternative_ready - t.search_start,
        altCount: result.alternatives.length,
        deepDiscoveryAvailable: result.deepDiscoveryAvailable,
        primaryStatus: result.primary?.status ?? null,
      });

    }
  }

  const outPath = new URL("../experiment-fast-pool-results.json", import.meta.url);
  writeFileSync(outPath, JSON.stringify({ at: new Date().toISOString(), rows }, null, 2));

  console.log("\n=== Per-run (cold) ===\n");
  console.log(
    "pool | tlds | query | wallMs | totalMs | dna# | bulks | httpMs | alts | overlap",
  );
  for (const r of rows) {
    console.log(
      [
        r.poolId,
        r.poolTldsResolved,
        r.query,
        r.wallMs,
        r.totalMs,
        r.dnaCalls,
        r.dnaBulkSizes.join("+"),
        r.dnaHttpMs.join("+"),
        r.altCount,
        r.dnaOverlap ? "yes" : "no",
      ].join(" | "),
    );
  }

  console.log("\n=== Summary by pool ===\n");
  console.log("Pool | Avg | P95 | Fastest | Slowest | Avg Alts | Avg DNA calls");
  const summary = [];
  for (const pool of POOL_CONFIGS) {
    const subset = rows.filter((r) => r.poolId === pool.id);
    const totals = subset.map((r) => r.wallMs).sort((a, b) => a - b);
    const alts = subset.map((r) => r.altCount);
    const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
    const p95 = totals[Math.min(totals.length - 1, Math.floor(totals.length * 0.95))];
    summary.push({
      pool: pool.id,
      tlds: pool.tlds,
      avg: Math.round(avg),
      p95,
      fastest: totals[0],
      slowest: totals[totals.length - 1],
      avgAlts: (alts.reduce((a, b) => a + b, 0) / alts.length).toFixed(1),
      avgDnaCalls: (
        subset.reduce((a, r) => a + r.dnaCalls, 0) / subset.length
      ).toFixed(1),
    });
  }
  for (const s of summary) {
    console.log(
      `${s.pool} (${s.tlds} TLDs) | ${s.avg} | ${s.p95} | ${s.fastest} | ${s.slowest} | ${s.avgAlts} | ${s.avgDnaCalls}`,
    );
  }

  const under2 = summary.filter((s) => s.avg <= 2000);
  const best = summary.reduce((a, b) => (a.avg < b.avg ? a : b));
  console.log("\n=== Recommendation (review before deploy) ===\n");
  console.log(
    `Fastest avg: pool ${best.pool} (${best.tlds} TLDs) avg=${best.avg}ms avgAlts=${best.avgAlts}`,
  );
  if (under2.length) {
    console.log(`Pools with avg <=2s: ${under2.map((s) => s.pool).join(", ")}`);
  } else {
    console.log("No pool configuration achieved avg <=2s in this run.");
  }
  console.log(`\nFull JSON: ${outPath.pathname}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
