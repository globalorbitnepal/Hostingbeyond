import { splitDomain } from "@/lib/domains/tlds";
import { logDomainProvider } from "@/lib/domains/domain-provider-log";
import {
  readDomainNameApiAvailabilityConfig,
  readDomainNameApiLifecycleConfig,
  type DomainNameApiConfig,
} from "@/lib/domains/providers/domain-name-api-config";
import {
  DomainProviderError,
  type ProviderAvailabilityRow,
  type SupplierPricing,
} from "@/lib/domains/providers/types";
import type {
  DomainRegistrarProvider,
  ProviderDomainDetails,
  ProviderRegisterInput,
  ProviderRegisterResult,
  ProviderTldPricing,
  ProviderTransferResult,
} from "@/lib/domains/providers/provider";
import { defaultRegistrationContacts } from "@/lib/domains/contacts";

const REQUEST_TIMEOUT_MS = 15_000;
/** OTE bulk-search can exceed 15s when checking many registered names. */
const AVAILABILITY_TIMEOUT_MS = 35_000;
const REGISTER_TIMEOUT_MS = 45_000;

type FetchLike = typeof fetch;

type BulkSearchItem = {
  domainName?: string;
  tld?: string;
  status?: string;
  price?: number;
  currency?: string;
  isPremium?: boolean;
  reason?: string;
  period?: number;
};

function parseFqdn(fqdn: string): {
  name: string;
  tld: string;
  domain: string;
} {
  const { name, tld } = splitDomain(fqdn);
  const normalizedTld = tld || ".com";
  return {
    name,
    tld: normalizedTld,
    domain: `${name}${normalizedTld}`.toLowerCase(),
  };
}

function mapHttpError(status: number, body: unknown): DomainProviderError {
  const record =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const nested =
    record.error && typeof record.error === "object"
      ? (record.error as Record<string, unknown>)
      : {};
  const message = String(
    nested.message ??
      record.message ??
      (record.error as Record<string, unknown> | undefined)?.message ??
      "",
  ).toLowerCase();
  const code = String(nested.code ?? record.code ?? "").toLowerCase();
  const httpHint = `http_${status}`;

  if (status === 429) {
    return new DomainProviderError("rate_limit");
  }
  if (status === 404) {
    if (
      code.includes("10007") ||
      message.includes("could not be found") ||
      message.includes("not be found")
    ) {
      return new DomainProviderError("domain_not_found");
    }
    return new DomainProviderError("provider_failure");
  }
  if (
    status === 402 ||
    code.includes("350") ||
    message.includes("insufficient") ||
    message.includes("balance")
  ) {
    return new DomainProviderError("insufficient_balance");
  }
  if (status === 400 || message.includes("validation")) {
    return new DomainProviderError("invalid_domain", message || httpHint);
  }
  if (message.includes("tld") && message.includes("not supported")) {
    return new DomainProviderError("tld_unsupported", httpHint);
  }
  return new DomainProviderError("provider_failure", httpHint);
}

function mapAvailabilityStatus(
  raw: string | undefined,
  isPremium: boolean,
): ProviderAvailabilityRow["status"] {
  const status = (raw ?? "").toLowerCase();
  if (status === "available" || status === "1" || status === "true") {
    return isPremium ? "premium" : "available";
  }
  if (
    status === "notavailable" ||
    status === "unavailable" ||
    status === "registered" ||
    status === "not available" ||
    status === "taken" ||
    status === "0" ||
    status === "false"
  ) {
    return "taken";
  }
  if (
    status === "unknown" ||
    status === "error" ||
    status === "pending" ||
    status === ""
  ) {
    return "unknown";
  }
  return "unknown";
}

function toSupplier(item: BulkSearchItem): SupplierPricing {
  const price =
    typeof item.price === "number" && Number.isFinite(item.price)
      ? item.price
      : null;
  return {
    register: price,
    renew: null,
    transfer: null,
    currency: typeof item.currency === "string" ? item.currency : "USD",
  };
}

function normalizeBulkItems(payload: unknown): BulkSearchItem[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  const items = root.infos ?? root.items ?? root;
  if (!Array.isArray(items)) return [];
  return items.filter(
    (item) => item && typeof item === "object",
  ) as BulkSearchItem[];
}

function parsePrice(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function maxYearsFromPriceBlock(block: unknown): number | null {
  if (Array.isArray(block) && block.length > 0) {
    return block.length;
  }
  return null;
}

function parseTldPricingRow(raw: unknown): ProviderTldPricing | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const name = String(item.name ?? "")
    .toLowerCase()
    .replace(/^\./, "");
  if (!name) return null;
  const prices = (item.prices as unknown[])?.[0] as
    Record<string, unknown> | undefined;
  const pick = (key: string) => {
    const block = prices?.[key];
    if (block && typeof block === "object") {
      const o = block as Record<string, unknown>;
      if ("price" in o) return parsePrice(o.price);
      const first = Array.isArray(block) ? block[0] : null;
      if (first && typeof first === "object") {
        return parsePrice((first as Record<string, unknown>).price);
      }
    }
    return null;
  };
  const regBlock = prices?.registration ?? prices?.register;
  const maxRegisterYears =
    maxYearsFromPriceBlock(regBlock) ??
    (typeof item.maxRegistrationPeriod === "number"
      ? item.maxRegistrationPeriod
      : null);

  return {
    tld: `.${name}`,
    register: pick("registration") ?? pick("register"),
    renew: pick("renew"),
    transfer: pick("transfer"),
    restore: pick("restore"),
    currency: "USD",
    maxRegisterYears,
  };
}

function parseDomainInfoResponse(
  data: unknown,
  domain: string,
): ProviderRegisterResult {
  if (!data || typeof data !== "object") {
    return {
      outcome: "failed",
      domain,
      expiresAt: null,
      errorCode: "invalid_response",
    };
  }
  const o = data as Record<string, unknown>;
  const statusRaw = String(o.status ?? o.statusCode ?? "").toLowerCase();
  if (
    statusRaw.includes("fail") ||
    statusRaw.includes("error") ||
    o.success === false
  ) {
    return {
      outcome: "failed",
      domain,
      expiresAt: null,
      errorCode: "provider_rejected",
      errorMessageInternal:
        typeof o.message === "string"
          ? o.message
          : statusRaw || "register_failed",
    };
  }
  const id = String(o.id ?? o.domainId ?? "");
  const expiration = o.expirationDate ?? o.expiresAt;
  return {
    outcome: "success",
    providerOrderId: id || domain,
    domain: String(o.domainName ?? domain),
    expiresAt: expiration ? String(expiration) : null,
  };
}

function buildContactPayload(contacts: unknown) {
  const source =
    contacts && typeof contacts === "object"
      ? (contacts as Record<string, Record<string, string>>)
      : defaultRegistrationContacts();
  const payloadContacts: Array<Record<string, string | boolean>> = [];
  for (const [type, details] of Object.entries(source)) {
    payloadContacts.push({
      contactType: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
      firstName: details.FirstName ?? details.firstName ?? "HostingBeyond",
      lastName: details.LastName ?? details.lastName ?? "Registrant",
      companyName: details.Company ?? details.company ?? "HostingBeyond",
      eMail:
        details.EMail ??
        details.email ??
        process.env.DOMAIN_REGISTRANT_EMAIL?.trim() ??
        "domains@hostingbeyond.local",
      address: details.AddressLine1 ?? details.address ?? "1 Main Street",
      city: details.City ?? details.city ?? "Wilmington",
      state: details.State ?? details.state ?? "DE",
      country: details.Country ?? details.country ?? "US",
      postalCode: details.ZipCode ?? details.postalCode ?? "19801",
      phone: details.Phone ?? details.phone ?? "5555550100",
      phoneCountryCode:
        details.PhoneCountryCode ?? details.phoneCountryCode ?? "1",
      discloseFlag: false,
    });
  }
  return payloadContacts;
}

async function apiRequestWithTimeout(
  config: DomainNameApiConfig,
  fetchImpl: FetchLike,
  method: string,
  endpoint: string,
  data: unknown,
  timeoutMs: number,
): Promise<unknown> {
  const url = `${config.baseUrl.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headers: Record<string, string> = {
      accept: "application/json",
      "X-API-KEY": config.apiKey,
      __reseller: config.resellerId,
      "User-Agent": "HostingBeyond-DomainSearch/1.0",
    };
    let target = url;
    const init: RequestInit = {
      method,
      headers,
      cache: "no-store",
      signal: controller.signal,
    };
    if (method === "GET" || method === "DELETE") {
      if (data && typeof data === "object") {
        target += `?${new URLSearchParams(data as Record<string, string>).toString()}`;
      }
    } else {
      headers["content-type"] = "application/json";
      init.body = JSON.stringify(data ?? {});
    }
    init.headers = headers;
    const response = await fetchImpl(target, init);
    const json = (await response.json().catch(() => null)) as unknown;
    if (!response.ok) throw mapHttpError(response.status, json);
    return json;
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

export function createDomainNameApiProvider(
  config: DomainNameApiConfig,
  fetchImpl: FetchLike = fetch,
): DomainRegistrarProvider {
  return {
    id: "domain-name-api",

    async checkAvailability(
      fqdns: string[],
    ): Promise<ProviderAvailabilityRow[]> {
      if (!fqdns.length) return [];

      const body = fqdns.map((fqdn) => {
        const { domain } = parseFqdn(fqdn);
        return { domainName: domain };
      });

      const url = `${config.baseUrl.replace(/\/$/, "")}/domains/bulk-search`;
      const controller = new AbortController();
      const timer = setTimeout(
        () => controller.abort(),
        AVAILABILITY_TIMEOUT_MS,
      );

      try {
        const response = await fetchImpl(url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            accept: "application/json",
            "X-API-KEY": config.apiKey,
            __reseller: config.resellerId,
            "User-Agent": "HostingBeyond-DomainSearch/1.0",
          },
          body: JSON.stringify(body),
          cache: "no-store",
          signal: controller.signal,
        });

        const json = (await response.json().catch(() => null)) as unknown;

        if (!response.ok) {
          logDomainProvider("dna_api_error", {
            status: response.status,
            environment: config.environment,
            domainCount: fqdns.length,
          });
          throw mapHttpError(response.status, json);
        }

        const items = normalizeBulkItems(json);
        if (!items.length) {
          throw new DomainProviderError("provider_failure");
        }

        const rows: ProviderAvailabilityRow[] = items.map((item) => {
          const domainRaw = String(item.domainName ?? "").toLowerCase();
          const parsed = parseFqdn(domainRaw || (fqdns[0] ?? ""));
          const tldFromApi = item.tld
            ? `.${String(item.tld).replace(/^\./, "")}`
            : parsed.tld;
          const isPremium = Boolean(item.isPremium);
          const status = mapAvailabilityStatus(item.status, isPremium);
          const supplier = toSupplier(item);

          logDomainProvider("dna_availability_row", {
            domain: parsed.domain || domainRaw,
            status,
            environment: config.environment,
            supplierRegister: supplier.register,
            currency: supplier.currency,
          });

          return {
            domain: domainRaw || parsed.domain,
            name: parsed.name,
            tld: tldFromApi,
            status,
            supplier,
            message:
              typeof item.reason === "string" && item.reason.trim()
                ? item.reason.trim()
                : undefined,
          };
        });

        return rows;
      } catch (error) {
        if (error instanceof DomainProviderError) throw error;
        if (error instanceof Error && error.name === "AbortError") {
          throw new DomainProviderError("timeout");
        }
        logDomainProvider("dna_request_failed", {
          environment: config.environment,
          domainCount: fqdns.length,
          error: error instanceof Error ? error.name : "unknown",
        });
        throw new DomainProviderError("provider_failure");
      } finally {
        clearTimeout(timer);
      }
    },

    async getPricing(tlds: string[]): Promise<ProviderTldPricing[]> {
      if (!tlds.length) return [];
      const json = (await apiRequestWithTimeout(
        config,
        fetchImpl,
        "GET",
        "products/tlds",
        {
          MaxResultCount: String(Math.min(500, tlds.length + 50)),
          SkipCount: "0",
        },
        REQUEST_TIMEOUT_MS,
      )) as { items?: unknown[] };
      const items = Array.isArray(json.items) ? json.items : [];
      const wanted = new Set(
        tlds.map((t) => t.replace(/^\./, "").toLowerCase()),
      );
      const out: ProviderTldPricing[] = [];

      for (const raw of items) {
        const row = parseTldPricingRow(raw);
        if (!row) continue;
        const bare = row.tld.replace(/^\./, "");
        if (!wanted.has(bare)) continue;
        out.push(row);
      }
      return out;
    },

    async listAllTldPricing(): Promise<ProviderTldPricing[]> {
      const pageSize = 100;
      let skip = 0;
      const out: ProviderTldPricing[] = [];
      for (;;) {
        const json = (await apiRequestWithTimeout(
          config,
          fetchImpl,
          "GET",
          "products/tlds",
          {
            MaxResultCount: String(pageSize),
            SkipCount: String(skip),
          },
          REQUEST_TIMEOUT_MS,
        )) as { items?: unknown[] };
        const items = Array.isArray(json.items) ? json.items : [];
        if (!items.length) break;
        for (const raw of items) {
          const row = parseTldPricingRow(raw);
          if (row) out.push(row);
        }
        skip += items.length;
        if (items.length < pageSize) break;
      }
      return out;
    },

    async registerDomain(
      input: ProviderRegisterInput,
    ): Promise<ProviderRegisterResult> {
      const domain = input.domain.toLowerCase();
      const payload = {
        domainName: domain,
        period: input.periodYears,
        nameServers: input.nameservers?.length
          ? input.nameservers
          : ["ns1.hostingbeyond.com", "ns2.hostingbeyond.com"],
        contacts: buildContactPayload(input.contacts),
        tldAttributes: {} as Record<string, string>,
      };
      try {
        const response = await apiRequestWithTimeout(
          config,
          fetchImpl,
          "POST",
          "domains/register-with-contacts",
          payload,
          REGISTER_TIMEOUT_MS,
        );
        return parseDomainInfoResponse(response, domain);
      } catch (error) {
        if (error instanceof DomainProviderError && error.code === "timeout") {
          return {
            outcome: "unknown",
            domain,
            expiresAt: null,
            errorCode: "timeout",
            errorMessageInternal: "Register request timed out",
          };
        }
        const code =
          error instanceof DomainProviderError
            ? error.code
            : "provider_failure";
        const internal =
          error instanceof DomainProviderError
            ? error.message
            : error instanceof Error
              ? error.message
              : "register_failed";
        return {
          outcome: "failed",
          domain,
          expiresAt: null,
          errorCode: code,
          errorMessageInternal: internal,
        };
      }
    },

    async renewDomain(
      domain: string,
      periodYears: number,
    ): Promise<{ expiresAt: string | null }> {
      const response = (await apiRequestWithTimeout(
        config,
        fetchImpl,
        "POST",
        "domains/renew",
        { domainName: domain.toLowerCase(), period: periodYears },
        REGISTER_TIMEOUT_MS,
      )) as Record<string, unknown>;
      const exp = response.expirationDate ?? response.expiresAt;
      return { expiresAt: exp ? String(exp) : null };
    },

    async transferDomain(input: {
      domain: string;
      authCode: string;
      periodYears?: number;
    }): Promise<ProviderTransferResult> {
      const domain = input.domain.toLowerCase();
      try {
        const response = await apiRequestWithTimeout(
          config,
          fetchImpl,
          "POST",
          "domains/transfer",
          {
            domainName: domain,
            authCode: input.authCode,
            period: input.periodYears ?? 1,
            contacts: buildContactPayload(defaultRegistrationContacts()),
          },
          REGISTER_TIMEOUT_MS,
        );
        const parsed = parseDomainInfoResponse(response, domain);
        return {
          outcome: parsed.outcome,
          providerTransferId: parsed.providerOrderId,
          domain,
          status: "SUBMITTED",
          errorCode: parsed.errorCode,
          errorMessageInternal: parsed.errorMessageInternal,
        };
      } catch (error) {
        if (error instanceof DomainProviderError && error.code === "timeout") {
          return {
            outcome: "unknown",
            domain,
            errorCode: "timeout",
            errorMessageInternal: "Transfer request timed out",
          };
        }
        return {
          outcome: "failed",
          domain,
          errorCode:
            error instanceof DomainProviderError
              ? error.code
              : "provider_failure",
          errorMessageInternal:
            error instanceof Error ? error.message : "transfer_failed",
        };
      }
    },

    async getDomainDetails(domain: string): Promise<ProviderDomainDetails> {
      const response = (await apiRequestWithTimeout(
        config,
        fetchImpl,
        "GET",
        "domains/info",
        { DomainName: domain.toLowerCase() },
        REQUEST_TIMEOUT_MS,
      )) as Record<string, unknown>;
      const ns = Array.isArray(response.nameServers)
        ? (response.nameServers as string[])
        : [];
      return {
        domain: String(response.domainName ?? domain),
        status: String(response.status ?? response.statusCode ?? "unknown"),
        expiresAt: response.expirationDate
          ? String(response.expirationDate)
          : null,
        nameservers: ns,
        transferLock: Boolean(response.lockStatus ?? response.isLocked),
      };
    },

    async updateNameservers(
      domain: string,
      nameservers: string[],
    ): Promise<void> {
      await apiRequestWithTimeout(
        config,
        fetchImpl,
        "PUT",
        "domains/nameservers",
        { domainName: domain.toLowerCase(), nameServers: nameservers },
        REQUEST_TIMEOUT_MS,
      );
    },

    async getAuthCode(domain: string): Promise<string> {
      const response = (await apiRequestWithTimeout(
        config,
        fetchImpl,
        "GET",
        "domains/auth-code",
        { domainName: domain.toLowerCase() },
        REQUEST_TIMEOUT_MS,
      )) as Record<string, unknown>;
      return String(response.authCode ?? "");
    },

    async lockDomain(domain: string): Promise<void> {
      await apiRequestWithTimeout(
        config,
        fetchImpl,
        "POST",
        "domains/lock",
        { domainName: domain.toLowerCase() },
        REQUEST_TIMEOUT_MS,
      );
    },

    async unlockDomain(domain: string): Promise<void> {
      await apiRequestWithTimeout(
        config,
        fetchImpl,
        "POST",
        "domains/unlock",
        { domainName: domain.toLowerCase() },
        REQUEST_TIMEOUT_MS,
      );
    },

    async restoreDomain(_domain: string): Promise<void> {
      throw new DomainProviderError("provider_failure");
    },

    async getDomainList(): Promise<ProviderDomainDetails[]> {
      const response = (await apiRequestWithTimeout(
        config,
        fetchImpl,
        "GET",
        "domains",
        { MaxResultCount: "200", SkipCount: "0" },
        REQUEST_TIMEOUT_MS,
      )) as { items?: Record<string, unknown>[] };
      const items = response.items ?? [];
      return items.map((item) => ({
        domain: String(item.domainName ?? ""),
        status: String(item.statusCode ?? item.status ?? ""),
        expiresAt: item.expirationDate ? String(item.expirationDate) : null,
        nameservers: [],
        transferLock: Boolean(item.lockStatus),
      }));
    },

    async getDomainStatus(domain: string): Promise<string> {
      const details = await this.getDomainDetails(domain);
      return details.status;
    },
  };
}

export function getDomainNameApiLifecycleProvider(
  fetchImpl?: FetchLike,
): DomainRegistrarProvider | null {
  const config = readDomainNameApiLifecycleConfig();
  if (!config) return null;
  return createDomainNameApiProvider(config, fetchImpl);
}

export function getDomainNameApiAvailabilityProvider(
  fetchImpl?: FetchLike,
): DomainRegistrarProvider | null {
  const config = readDomainNameApiAvailabilityConfig();
  if (!config) return null;
  return createDomainNameApiProvider(config, fetchImpl);
}

/** Lifecycle (OTE by default) — register, renew, transfer. */
export function getDomainNameApiProvider(
  fetchImpl?: FetchLike,
): DomainRegistrarProvider | null {
  return getDomainNameApiLifecycleProvider(fetchImpl);
}

/** @internal */
export function mapHttpErrorForTests(status: number, body: unknown) {
  return mapHttpError(status, body);
}

/** @internal */
export function mapAvailabilityStatusForTests(
  raw: string | undefined,
  isPremium: boolean,
) {
  return mapAvailabilityStatus(raw, isPremium);
}
