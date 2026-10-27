import {
  nameSiloParsedToNullable,
  parseNameSiloSupplierPrice,
} from "@/lib/domains/providers/namesilo-price-parse";
import { DomainProviderError } from "@/lib/domains/providers/types";
import type { ProviderTldPricing } from "@/lib/domains/providers/provider";

const API_BASE =
  process.env.NAMESILO_API_URL?.trim()?.replace(/\/$/, "") ||
  "https://www.namesilo.com/api";
const TIMEOUT_MS = 60_000;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 750;

const META_REPLY_KEYS = new Set([
  "code",
  "detail",
  "message",
  "balance",
  "domains",
  "domain",
]);

export type NameSiloPriceRow = {
  tld: string;
  register: number | null;
  renew: number | null;
  transfer: number | null;
  /** Fields present in API payload but failed validation. */
  invalidFields: string[];
};

export function parseNameSiloGetPricesReply(
  reply: Record<string, unknown>,
): NameSiloPriceRow[] {
  const rows: NameSiloPriceRow[] = [];
  for (const [key, val] of Object.entries(reply)) {
    if (META_REPLY_KEYS.has(key) || !val || typeof val !== "object") continue;
    const record = val as Record<string, unknown>;
    const reg = record.registration ?? record.register;
    const renew = record.renew ?? record.renewal;
    const transfer = record.transfer;
    if (reg == null && renew == null && transfer == null) continue;
    const tld = key.startsWith(".")
      ? key.toLowerCase()
      : `.${key.toLowerCase()}`;
    const regParsed = parseNameSiloSupplierPrice(reg);
    const renewParsed = parseNameSiloSupplierPrice(renew);
    const transferParsed = parseNameSiloSupplierPrice(transfer);
    const invalidFields: string[] = [];
    if (regParsed.kind === "invalid") invalidFields.push("register");
    if (renewParsed.kind === "invalid") invalidFields.push("renew");
    if (transferParsed.kind === "invalid") invalidFields.push("transfer");
    rows.push({
      tld,
      register: nameSiloParsedToNullable(regParsed),
      renew: nameSiloParsedToNullable(renewParsed),
      transfer: nameSiloParsedToNullable(transferParsed),
      invalidFields,
    });
  }
  return rows;
}

async function fetchNameSiloAccountPricesOnce(
  apiKey: string,
  options?: { retailPrices?: boolean; timeoutMs?: number },
): Promise<{
  rows: NameSiloPriceRow[];
  apiCode: string;
  fetchedAt: Date;
}> {
  const params = new URLSearchParams({
    version: "1",
    type: "json",
    key: apiKey,
  });
  if (options?.retailPrices) {
    params.set("retail_prices", "1");
  }
  const controller = new AbortController();
  const timeoutMs = options?.timeoutMs ?? TIMEOUT_MS;
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}/getPrices?${params}`, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new DomainProviderError(
        "provider_failure",
        "namesilo_malformed_json",
      );
    }
    const reply =
      json && typeof json === "object" && "reply" in json
        ? (json as { reply: Record<string, unknown> }).reply
        : (json as Record<string, unknown>);
    const code = reply?.code != null ? String(reply.code) : "";
    if (!res.ok || code !== "300") {
      throw new DomainProviderError(
        "provider_failure",
        `namesilo_getPrices_${code || res.status}`,
      );
    }
    const rows = parseNameSiloGetPricesReply(reply);
    if (rows.length === 0) {
      throw new DomainProviderError(
        "provider_failure",
        "namesilo_getPrices_empty",
      );
    }
    return {
      rows,
      apiCode: code,
      fetchedAt: new Date(),
    };
  } catch (error) {
    if (error instanceof DomainProviderError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new DomainProviderError("timeout");
    }
    throw new DomainProviderError("provider_failure");
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchNameSiloAccountPrices(
  apiKey: string,
  options?: { retailPrices?: boolean },
): Promise<{
  rows: NameSiloPriceRow[];
  apiCode: string;
  fetchedAt: Date;
}> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fetchNameSiloAccountPricesOnce(apiKey, options);
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
      }
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new DomainProviderError("provider_failure");
}

/** Single short attempt for Orbit display — does not persist prices. */
export async function fetchNameSiloAccountPricesQuick(apiKey: string) {
  return fetchNameSiloAccountPricesOnce(apiKey, { timeoutMs: 10_000 });
}

export function toProviderTldPricing(
  row: NameSiloPriceRow,
): ProviderTldPricing {
  return {
    tld: row.tld,
    register: row.register,
    renew: row.renew,
    transfer: row.transfer,
    restore: null,
    currency: "USD",
  };
}
