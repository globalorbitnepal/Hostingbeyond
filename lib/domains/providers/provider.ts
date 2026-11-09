import type { SupplierPricing } from "@/lib/domains/providers/types";

export type ProviderTldPricing = SupplierPricing & {
  tld: string;
  restore: number | null;
  /** Provider-supported max registration term in years, when known. */
  maxRegisterYears?: number | null;
  /** Minimum registration period in years from DNA catalogue. */
  minRegistrationPeriod?: number | null;
  /** Register total USD per period (years). */
  registerPricesByPeriod?: Record<number, number>;
  renewPricesByPeriod?: Record<number, number>;
};

export type ProviderDomainDetails = {
  domain: string;
  status: string;
  expiresAt: string | null;
  nameservers: string[];
  transferLock: boolean;
  /** Registrar WHOIS privacy (free at NameSilo, included at DNA). */
  privacyEnabled?: boolean | null;
};

export type ProviderRegisterInput = {
  domain: string;
  periodYears: number;
  contacts: unknown;
  nameservers: string[];
};

export type ProviderRegisterResult = {
  outcome: "success" | "failed" | "unknown";
  providerOrderId?: string;
  domain: string;
  expiresAt: string | null;
  errorCode?: string;
  errorMessageInternal?: string;
};

/** One DNS resource record as the registrar stores it. */
export type ProviderDnsRecord = {
  recordId: string;
  /** A, AAAA, CNAME, MX, TXT, NS, SRV, … */
  type: string;
  /** Host label relative to the zone (`@` for the apex). */
  host: string;
  value: string;
  ttl: number;
  distance: number;
};

export type ProviderDnsRecordInput = {
  type: string;
  host: string;
  value: string;
  ttl: number;
  distance?: number;
  recordId?: string;
};

export type ProviderTransferResult = {
  outcome: "success" | "failed" | "unknown";
  providerTransferId?: string;
  domain: string;
  status?: string;
  errorCode?: string;
  errorMessageInternal?: string;
};

export interface DomainRegistrarProvider {
  readonly id: string;

  checkAvailability(
    fqdns: string[],
  ): Promise<import("@/lib/domains/providers/types").ProviderAvailabilityRow[]>;

  getPricing(tlds: string[]): Promise<ProviderTldPricing[]>;

  /** Full registrar TLD catalogue (paginated upstream). */
  listAllTldPricing?(): Promise<ProviderTldPricing[]>;

  listAllTldPricingDetailed?(): Promise<
    import("@/lib/domains/providers/tld-catalogue-fetch").TldCatalogueFetchResult
  >;

  registerDomain(input: ProviderRegisterInput): Promise<ProviderRegisterResult>;

  renewDomain(
    domain: string,
    periodYears: number,
  ): Promise<{ expiresAt: string | null }>;

  transferDomain(input: {
    domain: string;
    authCode: string;
    periodYears?: number;
  }): Promise<ProviderTransferResult>;

  getDomainDetails(domain: string): Promise<ProviderDomainDetails>;

  updateNameservers(domain: string, nameservers: string[]): Promise<void>;

  updateDnsRecords?(domain: string, records: unknown[]): Promise<void>;

  /** Zone records for the registrar's own nameservers. */
  listDnsRecords?(domain: string): Promise<ProviderDnsRecord[]>;

  addDnsRecord?(
    domain: string,
    record: ProviderDnsRecordInput,
  ): Promise<ProviderDnsRecord>;

  updateDnsRecord?(
    domain: string,
    record: ProviderDnsRecordInput & { recordId: string },
  ): Promise<void>;

  deleteDnsRecord?(domain: string, recordId: string): Promise<void>;

  /** True when the registrar can edit the zone (hosted DNS, not third-party NS). */
  supportsDnsEditing?(): boolean;

  getAuthCode(domain: string): Promise<string>;

  lockDomain(domain: string): Promise<void>;

  unlockDomain(domain: string): Promise<void>;

  restoreDomain(domain: string): Promise<void>;

  getDomainList(options?: {
    skip?: number;
    take?: number;
  }): Promise<ProviderDomainDetails[]>;

  getDomainStatus(domain: string): Promise<string>;
}

export class ProviderMethodNotImplementedError extends Error {
  constructor(method: string) {
    super(`Provider method not implemented: ${method}`);
    this.name = "ProviderMethodNotImplementedError";
  }
}
