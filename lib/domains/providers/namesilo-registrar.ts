import { isEnvStrictTrue } from "@/lib/integrations/env-flags";
import {
  fetchNameSiloAccountPrices,
  toProviderTldPricing,
} from "@/lib/domains/providers/namesilo-pricing";
import {
  parseNameSiloDnsRecords,
  type ValidatedDnsRecord,
} from "@/lib/domains/providers/namesilo-dns";
import { DomainProviderError } from "@/lib/domains/providers/types";
import type {
  DomainRegistrarProvider,
  ProviderDnsRecord,
  ProviderDomainDetails,
  ProviderRegisterInput,
  ProviderRegisterResult,
  ProviderTransferResult,
} from "@/lib/domains/providers/provider";
import { ProviderMethodNotImplementedError } from "@/lib/domains/providers/provider";

const API_BASE =
  process.env.NAMESILO_API_URL?.trim()?.replace(/\/$/, "") ||
  "https://www.namesilo.com/api";
const TIMEOUT_MS = 60_000;

let cached: DomainRegistrarProvider | null = null;

function apiKey(): string {
  const key = process.env.NAMESILO_API_KEY?.trim();
  if (!key) throw new DomainProviderError("unconfigured");
  return key;
}

function billableBlocked(): void {
  if (isEnvStrictTrue(process.env.NAMESILO_ALLOW_BILLABLE)) return;
  throw new DomainProviderError(
    "provider_failure",
    "namesilo_billable_operations_disabled",
  );
}

async function namesiloRequest(
  operation: string,
  params: Record<string, string>,
): Promise<Record<string, unknown>> {
  const key = apiKey();
  const search = new URLSearchParams({
    version: "1",
    type: "json",
    key,
    ...params,
  });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}/${operation}?${search}`, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    const json = (await res.json()) as { reply?: Record<string, unknown> };
    const reply = json.reply ?? (json as Record<string, unknown>);
    const code = reply.code != null ? String(reply.code) : "";
    if (!res.ok || (code && code !== "300")) {
      throw new DomainProviderError(
        "provider_failure",
        `namesilo_${operation}_${code || res.status}`,
      );
    }
    return reply;
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

export function assertNameSiloLifecycleEnabled(): void {
  if (!isEnvStrictTrue(process.env.NAMESILO_LIFECYCLE_ENABLED)) {
    throw new DomainProviderError(
      "provider_failure",
      "namesilo_lifecycle_not_enabled",
    );
  }
}

export function getNameSiloLifecycleProvider(): DomainRegistrarProvider | null {
  if (process.env.NAMESILO_API_KEY?.trim()) {
    if (!cached) cached = buildProvider();
    return cached;
  }
  return null;
}

function buildProvider(): DomainRegistrarProvider {
  return {
    id: "namesilo",

    async checkAvailability(fqdns) {
      const { getNameSiloAvailabilityProvider } =
        await import("@/lib/domains/providers/namesilo-availability");
      const p = getNameSiloAvailabilityProvider();
      if (!p) throw new DomainProviderError("unconfigured");
      return p.checkAvailability(fqdns);
    },

    async getPricing(tlds) {
      const { rows } = await fetchNameSiloAccountPrices(apiKey());
      const want = new Set(
        tlds.map((t) =>
          t.startsWith(".") ? t.toLowerCase() : `.${t.toLowerCase()}`,
        ),
      );
      return rows.filter((r) => want.has(r.tld)).map(toProviderTldPricing);
    },

    async registerDomain(
      _input: ProviderRegisterInput,
    ): Promise<ProviderRegisterResult> {
      billableBlocked();
      return {
        outcome: "failed",
        domain: _input.domain,
        expiresAt: null,
        errorCode: "namesilo_billable_operations_disabled",
      };
    },

    async renewDomain(_domain: string, _periodYears: number) {
      billableBlocked();
      return { expiresAt: null };
    },

    async transferDomain(_input: {
      domain: string;
      authCode: string;
      periodYears?: number;
    }): Promise<ProviderTransferResult> {
      billableBlocked();
      return {
        outcome: "failed",
        domain: _input.domain,
        errorCode: "namesilo_billable_operations_disabled",
      };
    },

    async getDomainDetails(domain: string): Promise<ProviderDomainDetails> {
      const reply = await namesiloRequest("getDomainInfo", { domain });
      const detail =
        reply.domains && typeof reply.domains === "object"
          ? (reply.domains as Record<string, unknown>)
          : reply;
      const expires = detail.expires ?? detail.expiration;
      const nsRaw = detail.nameservers ?? detail.name_servers;
      const nameservers = Array.isArray(nsRaw)
        ? nsRaw.map(String)
        : nsRaw
          ? [String(nsRaw)]
          : [];
      return {
        domain: domain.toLowerCase(),
        status: String(detail.status ?? "unknown"),
        expiresAt: expires ? String(expires) : null,
        nameservers,
        transferLock: String(detail.locked ?? "1") !== "0",
      };
    },

    /** Verified API operation name per migration inventory (D6: NS only this phase). */
    async updateNameservers(domain: string, nameservers: string[]) {
      assertNameSiloLifecycleEnabled();
      const params: Record<string, string> = { domain };
      nameservers.slice(0, 13).forEach((ns, i) => {
        params[`ns${i + 1}`] = ns;
      });
      await namesiloRequest("changeNameServers", params);
    },

    async getAuthCode(domain: string) {
      assertNameSiloLifecycleEnabled();
      const reply = await namesiloRequest("retrieveAuthCode", { domain });
      const code = reply.auth_code ?? reply.code;
      if (!code || code === "300") {
        throw new DomainProviderError("provider_failure", "namesilo_auth_code");
      }
      return String(code);
    },

    async lockDomain(domain: string) {
      assertNameSiloLifecycleEnabled();
      await namesiloRequest("domainLock", { domain });
    },

    async unlockDomain(domain: string) {
      assertNameSiloLifecycleEnabled();
      await namesiloRequest("domainUnlock", { domain });
    },

    async restoreDomain() {
      throw new ProviderMethodNotImplementedError("restoreDomain");
    },

    async getDomainList() {
      throw new ProviderMethodNotImplementedError("getDomainList");
    },

    async getDomainStatus(domain: string) {
      const d = await this.getDomainDetails(domain);
      return d.status;
    },

    supportsDnsEditing() {
      return true;
    },

    async listDnsRecords(domain: string): Promise<ProviderDnsRecord[]> {
      assertNameSiloLifecycleEnabled();
      const reply = await namesiloRequest("dnsListRecords", { domain });
      return parseNameSiloDnsRecords(reply);
    },

    async addDnsRecord(domain: string, record: ValidatedDnsRecord) {
      assertNameSiloLifecycleEnabled();
      const params: Record<string, string> = {
        domain,
        rrtype: record.type,
        rrhost: record.host,
        rrvalue: record.value,
        rrttl: String(record.ttl),
      };
      if (record.type === "MX") {
        params.rrdistance = String(record.distance ?? 10);
      }
      const reply = await namesiloRequest("dnsAddRecord", params);
      const created = parseNameSiloDnsRecords(reply).find(
        (row) =>
          row.type === record.type &&
          row.host === record.host.toLowerCase() &&
          row.value === record.value,
      );
      return (
        created ?? {
          recordId: "",
          type: record.type,
          host: record.host.toLowerCase(),
          value: record.value,
          ttl: record.ttl,
          distance: record.distance ?? 0,
        }
      );
    },

    async updateDnsRecord(
      domain: string,
      record: ValidatedDnsRecord & { recordId: string },
    ) {
      assertNameSiloLifecycleEnabled();
      const params: Record<string, string> = {
        domain,
        rrid: record.recordId,
        rrtype: record.type,
        rrhost: record.host,
        rrvalue: record.value,
        rrttl: String(record.ttl),
      };
      if (record.type === "MX") {
        params.rrdistance = String(record.distance ?? 10);
      }
      await namesiloRequest("dnsUpdateRecord", params);
    },

    async deleteDnsRecord(domain: string, recordId: string) {
      assertNameSiloLifecycleEnabled();
      await namesiloRequest("dnsDeleteRecord", { domain, rrid: recordId });
    },
  };
}

/** @internal */
export function clearNameSiloLifecycleProviderCacheForTests(): void {
  cached = null;
}
