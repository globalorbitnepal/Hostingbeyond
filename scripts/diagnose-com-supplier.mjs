#!/usr/bin/env node
/** READ-ONLY .com supplier diagnostic — no secrets in output. */
import { config as loadDotenv } from "dotenv";
loadDotenv();

function priceForPeriod(block, period) {
  if (!Array.isArray(block)) return null;
  const row = block.find(
    (r) => r && typeof r === "object" && Number(r.period) === period,
  );
  if (!row) return null;
  const n = Number(row.price);
  return Number.isFinite(n) ? n : null;
}

function firstIndexPrice(block) {
  if (!Array.isArray(block) || !block[0] || typeof block[0] !== "object") {
    return { price: null, period: null };
  }
  const n = Number(block[0].price);
  return {
    price: Number.isFinite(n) ? n : null,
    period: block[0].period ?? null,
  };
}

const { readDomainNameApiAvailabilityConfig } = await import(
  "../lib/domains/providers/domain-name-api-config.ts"
);
const { parseProductTldListDto } = await import(
  "../lib/domains/providers/tld-catalogue-fetch.ts"
);
const { prisma } = await import("../lib/prisma.ts");

const cfg = readDomainNameApiAvailabilityConfig();
if (!cfg) {
  console.log(JSON.stringify({ error: "provider_not_configured" }));
  process.exit(1);
}

const params = new URLSearchParams({
  FilterText: "com",
  SkipCount: "0",
  MaxResultCount: "5",
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
const comRaw = items.find(
  (it) => String(it?.name ?? "").toLowerCase() === "com",
);
const group = comRaw?.prices?.[0];
const regBlock = group?.register ?? group?.registration;

const db = await prisma.domainTldPrice.findUnique({ where: { tld: ".com" } });
const num = (v) =>
  v == null
    ? null
    : typeof v === "object" && "toNumber" in v
      ? v.toNumber()
      : Number(v);

const parsed = comRaw ? parseProductTldListDto(comRaw) : null;
const idx0 = firstIndexPrice(regBlock);

const audit = await prisma.domainAuditLog.findFirst({
  where: { action: "DOMAIN_PROVIDER_SYNC" },
  orderBy: { createdAt: "desc" },
  select: { createdAt: true, details: true },
});

console.log(
  JSON.stringify(
    {
      apiEnvironment: cfg.environment,
      liveHttpOk: res.ok,
      registerPeriod1: priceForPeriod(regBlock, 1),
      registerPeriod3: priceForPeriod(regBlock, 3),
      registerIndex0Period: idx0.period,
      registerIndex0Price: idx0.price,
      normalizedRegistration: parsed?.register ?? null,
      normalizedRenew: parsed?.renew ?? null,
      normalizedTransfer: parsed?.transfer ?? null,
      db: db
        ? {
            supplierRegister: num(db.supplierRegister),
            supplierRenew: num(db.supplierRenew),
            supplierTransfer: num(db.supplierTransfer),
            supplierSyncedAt: db.supplierSyncedAt?.toISOString() ?? null,
            retailRegister: num(db.retailRegister),
            retailRenew: num(db.retailRenew),
            retailTransfer: num(db.retailTransfer),
          }
        : null,
      lastSupplierSync: audit
        ? {
            at: audit.createdAt.toISOString(),
            status:
              audit.details &&
              typeof audit.details === "object" &&
              "status" in audit.details
                ? audit.details.status
                : null,
          }
        : null,
      parserUsesPeriodAware: (await import("node:fs"))
        .readFileSync(
          new URL(
            "../lib/domains/providers/tld-catalogue-fetch.ts",
            import.meta.url,
          ),
          "utf8",
        )
        .includes("standardTermPrice(registerBlock)"),
    },
    null,
    2,
  ),
);

await prisma.$disconnect();
