#!/usr/bin/env node
/**
 * Safe provider TLD catalogue diagnostic (no secrets in output).
 * Usage: node --import tsx scripts/diagnose-provider-tld-catalogue.mjs
 * Optional: RUN_SYNC=1 to import into local/production DATABASE_URL after diagnostic.
 */
import { config as loadDotenv } from "dotenv";

loadDotenv();

const { diagnoseProviderTldCatalogue, syncSupplierCatalogueFromProvider } =
  await import("../lib/domains/supplier-catalogue-sync.ts");
const { prisma } = await import("../lib/prisma.ts");
const { getRecommendationTierPools } = await import(
  "../lib/domains/recommendation-tlds.ts"
);

const dbBefore = await prisma.domainTldPrice.count().catch(() => 0);
const diag = await diagnoseProviderTldCatalogue();

const report = {
  dbCountBefore: dbBefore,
  fetchError: diag.fetchError ?? null,
  providerTotalCount: diag.fetch?.totalCount ?? 0,
  pagesFetched: diag.fetch?.pagesFetched ?? 0,
  uniqueParsed: diag.fetch?.items.length ?? 0,
  parseFailures: diag.fetch?.parseFailures ?? 0,
  duplicateTlds: diag.fetch?.duplicateTlds ?? 0,
  pageErrors: diag.fetch?.pageErrors ?? 0,
  withRegisterPrice: diag.summary?.withRegisterPrice ?? 0,
  withRenewPrice: diag.summary?.withRenewPrice ?? 0,
  withTransferPrice: diag.summary?.withTransferPrice ?? 0,
  withMaxRegisterYears: diag.summary?.withMaxRegisterYears ?? 0,
  tldPresence: diag.summary?.tldPresence ?? {},
  sampleSupplierPricing: (diag.fetch?.items ?? [])
    .filter((r) => [".com", ".in", ".pk", ".ai", ".chat"].includes(r.tld))
    .slice(0, 8)
    .map((r) => ({
      tld: r.tld,
      register: r.register,
      renew: r.renew,
      transfer: r.transfer,
      maxRegisterYears: r.maxRegisterYears,
    })),
};

console.log(JSON.stringify(report, null, 2));

if (process.env.RUN_SYNC === "1" && !diag.fetchError) {
  const sync = await syncSupplierCatalogueFromProvider();
  const dbAfter = await prisma.domainTldPrice.count();
  const pools = await getRecommendationTierPools();
  console.log(
    JSON.stringify(
      {
        syncStatus: sync.status,
        dbCountAfter: dbAfter,
        imported: sync.tldsReceived,
        created: sync.tldsCreated,
        updated: sync.tldsUpdated,
        failed: sync.tldsFailed,
        recommendationTier1: pools.tier1.length,
        recommendationTier2: pools.tier2.length,
        catalogueSize: pools.catalogueSize,
      },
      null,
      2,
    ),
  );
}

await prisma.$disconnect();
