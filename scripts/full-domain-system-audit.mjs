#!/usr/bin/env node
/**
 * Full supplier catalogue audit (LIVE). No secrets in output.
 * Usage: NODE_ENV=production DOMAIN_AVAILABILITY_ENV=live node --import tsx scripts/full-domain-system-audit.mjs
 * Optional: RUN_SYNC=1 to run LIVE supplier sync after audit.
 */
import { config as loadDotenv } from "dotenv";
import { writeFileSync } from "node:fs";

loadDotenv();

const AUDIT_TLDS = [
  ".com", ".net", ".org", ".info", ".biz", ".xyz", ".online", ".site", ".website",
  ".store", ".shop", ".tech", ".dev", ".app", ".cloud", ".pro", ".agency", ".digital",
  ".blog", ".news", ".co", ".io", ".ai", ".me", ".tv", ".cc", ".chat", ".studio",
  ".live", ".world", ".space", ".fun", ".life", ".social", ".solutions", ".today",
  ".in", ".uk", ".us", ".ca", ".au", ".nz", ".de", ".fr", ".it", ".es", ".nl",
  ".ch", ".at", ".ae", ".sg", ".my", ".id", ".jp", ".eu", ".pk",
];

function priceForPeriod(block, period) {
  if (!Array.isArray(block)) return null;
  const row = block.find(
    (r) => r && typeof r === "object" && Number(r.period) === period,
  );
  if (!row) return null;
  const n = Number(row.price);
  return Number.isFinite(n) ? n : null;
}

function rawPeriod1Pricing(raw) {
  const groups = Array.isArray(raw?.prices) ? raw.prices : [];
  const g = groups[0];
  if (!g || typeof g !== "object") return null;
  const reg = g.register ?? g.registration;
  const renew = g.renew ?? g.renewal;
  const transfer = g.transfer;
  return {
    registerP1: priceForPeriod(reg, 1),
    renewP1: priceForPeriod(renew, 1),
    transferP1: priceForPeriod(transfer, 1),
    priceGroup: g.priceGroup ?? null,
    maxRegistrationPeriod: raw.maxRegistrationPeriod ?? null,
  };
}

const { readDomainNameApiAvailabilityConfig } = await import(
  "../lib/domains/providers/domain-name-api-config.ts"
);
const { createDomainNameApiProvider } = await import(
  "../lib/domains/providers/domain-name-api.ts"
);
const { parseProductTldListDto } = await import(
  "../lib/domains/providers/tld-catalogue-fetch.ts"
);
const { prisma } = await import("../lib/prisma.ts");

const cfg = readDomainNameApiAvailabilityConfig();
if (!cfg) {
  console.error(JSON.stringify({ error: "provider_not_configured" }));
  process.exit(1);
}

const provider = createDomainNameApiProvider(cfg);
const dbBefore = await prisma.domainTldPrice.count();
const dbSyncedBefore = await prisma.domainTldPrice.count({
  where: { supplierSyncedAt: { not: null } },
});

const catalogue = await provider.listAllTldPricingDetailed();
const parsedByTld = new Map(
  catalogue.items.map((i) => [i.tld.toLowerCase(), i]),
);

const rawByTld = new Map();
for (let skip = 0; skip < catalogue.totalCount; skip += 200) {
  const params = new URLSearchParams({
    SkipCount: String(skip),
    MaxResultCount: "200",
  });
  const url = `${cfg.baseUrl.replace(/\/$/, "")}/products/tlds?${params}`;
  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      "X-API-KEY": cfg.apiKey,
      __reseller: cfg.resellerId,
    },
  });
  const json = await res.json();
  const items = Array.isArray(json.items) ? json.items : [];
  for (const raw of items) {
    const name = String(raw?.name ?? "").toLowerCase();
    if (!name) continue;
    rawByTld.set(`.${name}`, raw);
  }
  if (items.length < 200) break;
}

const num = (v) =>
  v == null
    ? null
    : typeof v === "object" && "toNumber" in v
      ? v.toNumber()
      : Number(v);

const dbRows = await prisma.domainTldPrice.findMany();
const dbByTld = new Map(dbRows.map((r) => [r.tld.toLowerCase(), r]));

const mismatchCounts = {
  A_missing_in_db: 0,
  B_missing_provider_price: 0,
  C_wrong_registration: 0,
  D_wrong_renewal: 0,
  E_wrong_transfer: 0,
  F_currency: 0,
  G_price_group: 0,
  H_db_stale: 0,
  I_parser_mismatch: 0,
  match: 0,
};

const mismatches = [];

for (const [tld, parsed] of parsedByTld) {
  const raw = rawByTld.get(tld);
  const rawP1 = raw ? rawPeriod1Pricing(raw) : null;
  const db = dbByTld.get(tld);
  if (!db) {
    mismatchCounts.A_missing_in_db += 1;
    if (mismatches.length < 200) {
      mismatches.push({ tld, class: "A", reason: "missing_in_db" });
    }
    continue;
  }
  const dbReg = num(db.supplierRegister);
  const dbRen = num(db.supplierRenew);
  const dbTr = num(db.supplierTransfer);
  const expectedReg = rawP1?.registerP1 ?? parsed.register;
  const expectedRen = rawP1?.renewP1 ?? parsed.renew;
  const expectedTr = rawP1?.transferP1 ?? parsed.transfer;

  if (expectedReg == null && expectedRen == null && expectedTr == null) {
    mismatchCounts.B_missing_provider_price += 1;
    continue;
  }

  let ok = true;
  if (expectedReg != null && dbReg !== expectedReg) {
    ok = false;
    mismatchCounts.C_wrong_registration += 1;
    if (parsed.register !== expectedReg) mismatchCounts.I_parser_mismatch += 1;
    if (mismatches.length < 200) {
      mismatches.push({
        tld,
        class: "C",
        dbReg,
        expectedReg,
        parsedReg: parsed.register,
      });
    }
  }
  if (expectedRen != null && dbRen !== expectedRen) {
    ok = false;
    mismatchCounts.D_wrong_renewal += 1;
  }
  if (expectedTr != null && dbTr !== expectedTr) {
    ok = false;
    mismatchCounts.E_wrong_transfer += 1;
  }
  if (ok) mismatchCounts.match += 1;
}

const audit50 = AUDIT_TLDS.map((tld) => {
  const key = tld.toLowerCase();
  const prov = parsedByTld.get(key);
  const raw = rawByTld.get(key);
  const rawP1 = raw ? rawPeriod1Pricing(raw) : null;
  const db = dbByTld.get(key);
  return {
    tld,
    providerSupported: Boolean(prov),
    providerRegP1: rawP1?.registerP1 ?? prov?.register ?? null,
    providerRenewP1: rawP1?.renewP1 ?? prov?.renew ?? null,
    providerTransfer: rawP1?.transferP1 ?? prov?.transfer ?? null,
    maxYears: prov?.maxRegisterYears ?? rawP1?.maxRegistrationPeriod ?? null,
    dbReg: db ? num(db.supplierRegister) : null,
    dbRenew: db ? num(db.supplierRenew) : null,
    dbTransfer: db ? num(db.supplierTransfer) : null,
    dbMaxYears: db?.supplierMaxRegisterYears ?? null,
    match:
      prov && db
        ? num(db.supplierRegister) === (rawP1?.registerP1 ?? prov.register) &&
          num(db.supplierRenew) === (rawP1?.renewP1 ?? prov.renew) &&
          num(db.supplierTransfer) === (rawP1?.transferP1 ?? prov.transfer)
        : prov
          ? "NO_DB"
          : "NOT_IN_PROVIDER",
  };
});

let syncResult = null;
if (process.env.RUN_SYNC === "1") {
  const { syncSupplierCatalogueFromProvider } = await import(
    "../lib/domains/supplier-catalogue-sync.ts"
  );
  const { invalidateTldCatalogueCache } = await import(
    "../lib/domains/tld-catalogue-cache.ts"
  );
  syncResult = await syncSupplierCatalogueFromProvider();
  invalidateTldCatalogueCache();
}

const dbAfter = await prisma.domainTldPrice.count();
const withReg = catalogue.items.filter((i) => i.register != null).length;
const withRen = catalogue.items.filter((i) => i.renew != null).length;
const withTr = catalogue.items.filter((i) => i.transfer != null).length;
const withNa = catalogue.items.filter(
  (i) => i.register == null && i.renew == null && i.transfer == null,
).length;

const report = {
  partA: {
    environment: cfg.environment,
    dbCountBefore: dbBefore,
    dbSyncedBefore,
    dbCountAfter: dbAfter,
    gitNote: "see /srv/apps/hostingbeyond/.git/refs/heads/main on server",
  },
  partB: {
    providerTotalCount: catalogue.totalCount,
    pagesFetched: catalogue.pagesFetched,
    uniqueParsed: catalogue.items.length,
    parseFailures: catalogue.parseFailures,
    duplicateTlds: catalogue.duplicateTlds,
    rawRowsFetched: rawByTld.size,
  },
  partD: { mismatchCounts, sampleMismatches: mismatches.slice(0, 50) },
  partE: audit50,
  pricingCoverage: {
    withRegistrationPrice: withReg,
    withRenewalPrice: withRen,
    withTransferPrice: withTr,
    withAllNa: withNa,
  },
  syncResult,
};

const out = new URL("../audit-full-domain-system.json", import.meta.url).pathname;
writeFileSync(out, JSON.stringify(report, null, 2));
console.log(
  JSON.stringify({
    ok: true,
    reportPath: out,
    providerTotal: report.partB.providerTotalCount,
    dbBefore,
    dbAfter,
    mismatches: mismatchCounts,
    com: audit50.find((r) => r.tld === ".com"),
  }),
);

await prisma.$disconnect();
