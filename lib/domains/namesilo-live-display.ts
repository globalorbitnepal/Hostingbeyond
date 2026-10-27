import { deriveNameSiloCatalogueStatus } from "@/lib/domains/namesilo-price-status";
import { normalizeCatalogueTld } from "@/lib/domains/namesilo-supplier-sync";
import {
  fetchNameSiloAccountPricesQuick,
  type NameSiloPriceRow,
} from "@/lib/domains/providers/namesilo-pricing";

export type NameSiloLiveDisplayStatus =
  "live" | "cached" | "key_missing" | "unavailable";

export type NameSiloLiveMeta = {
  status: NameSiloLiveDisplayStatus;
  fetchedAt: string | null;
  apiTldCount: number | null;
  error: string | null;
  wroteDatabase: false;
};

const LIVE_TTL_MS = 45_000;

type CacheEntry = {
  expiresAt: number;
  rows: NameSiloPriceRow[];
  fetchedAt: Date;
};

let cache: CacheEntry | null = null;

export function resetNameSiloLiveDisplayCache() {
  cache = null;
}

export function overlayRowWithLiveNameSilo(
  stored: {
    namesiloRegister: number | null;
    namesiloRenew: number | null;
    namesiloTransfer: number | null;
    namesiloSyncedAt: Date | null;
    namesiloPriceStatus: string | null;
  },
  live: NameSiloPriceRow | undefined,
  liveFetchedAt: Date | null,
): {
  namesiloRegister: number | null;
  namesiloRenew: number | null;
  namesiloTransfer: number | null;
  namesiloSyncedAt: Date | null;
  namesiloPriceStatus: string | null;
  namesiloPriceSource: "live_api" | "stored_catalogue";
  storedNamesiloRegister: number | null;
  storedNamesiloRenew: number | null;
  storedNamesiloTransfer: number | null;
} {
  const storedNamesiloRegister = stored.namesiloRegister;
  const storedNamesiloRenew = stored.namesiloRenew;
  const storedNamesiloTransfer = stored.namesiloTransfer;
  if (!live) {
    return {
      namesiloRegister: stored.namesiloRegister,
      namesiloRenew: stored.namesiloRenew,
      namesiloTransfer: stored.namesiloTransfer,
      namesiloSyncedAt: stored.namesiloSyncedAt,
      namesiloPriceStatus: stored.namesiloPriceStatus,
      namesiloPriceSource: "stored_catalogue",
      storedNamesiloRegister,
      storedNamesiloRenew,
      storedNamesiloTransfer,
    };
  }
  const register =
    live.register != null && Number.isFinite(live.register)
      ? live.register
      : stored.namesiloRegister;
  const renew =
    live.renew != null && Number.isFinite(live.renew)
      ? live.renew
      : stored.namesiloRenew;
  const transfer =
    live.transfer != null && Number.isFinite(live.transfer)
      ? live.transfer
      : stored.namesiloTransfer;
  const status = deriveNameSiloCatalogueStatus(
    { register, renew, transfer },
    {
      hadInvalidField: live.invalidFields.length > 0,
      onApi: true,
    },
  );
  return {
    namesiloRegister: register,
    namesiloRenew: renew,
    namesiloTransfer: transfer,
    namesiloSyncedAt: liveFetchedAt,
    namesiloPriceStatus: status,
    namesiloPriceSource: "live_api",
    storedNamesiloRegister,
    storedNamesiloRenew,
    storedNamesiloTransfer,
  };
}

export function extraLiveOnlyTlds(
  catalogueTlds: Iterable<string>,
  byTld: Map<string, NameSiloPriceRow>,
): NameSiloPriceRow[] {
  const seen = new Set(
    [...catalogueTlds].map((tld) => normalizeCatalogueTld(tld)),
  );
  return [...byTld.entries()]
    .filter(([tld]) => !seen.has(tld))
    .map(([, row]) => row)
    .sort((a, b) => a.tld.localeCompare(b.tld));
}

export async function readLiveNameSiloOverlay(now = Date.now()): Promise<{
  meta: NameSiloLiveMeta;
  byTld: Map<string, NameSiloPriceRow>;
}> {
  const apiKey = process.env.NAMESILO_API_KEY?.trim();
  if (!apiKey) {
    return {
      meta: {
        status: "key_missing",
        fetchedAt: null,
        apiTldCount: null,
        error: "namesilo_api_key_missing",
        wroteDatabase: false,
      },
      byTld: new Map(),
    };
  }
  if (cache && cache.expiresAt > now) {
    return {
      meta: {
        status: "cached",
        fetchedAt: cache.fetchedAt.toISOString(),
        apiTldCount: cache.rows.length,
        error: null,
        wroteDatabase: false,
      },
      byTld: new Map(
        cache.rows.map((row) => [normalizeCatalogueTld(row.tld), row]),
      ),
    };
  }
  try {
    const fetched = await fetchNameSiloAccountPricesQuick(apiKey);
    cache = {
      expiresAt: now + LIVE_TTL_MS,
      rows: fetched.rows,
      fetchedAt: fetched.fetchedAt,
    };
    return {
      meta: {
        status: "live",
        fetchedAt: fetched.fetchedAt.toISOString(),
        apiTldCount: fetched.rows.length,
        error: null,
        wroteDatabase: false,
      },
      byTld: new Map(
        fetched.rows.map((row) => [normalizeCatalogueTld(row.tld), row]),
      ),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "namesilo_live_unavailable";
    return {
      meta: {
        status: "unavailable",
        fetchedAt: null,
        apiTldCount: null,
        error: message.slice(0, 120),
        wroteDatabase: false,
      },
      byTld: new Map(),
    };
  }
}
