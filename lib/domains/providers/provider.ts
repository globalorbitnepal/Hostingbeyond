import type { SupplierPricing } from "@/lib/domains/providers/types";

export type ProviderTldPricing = SupplierPricing & {
  tld: string;
  restore: number | null;
  /** Provider-supported max registration term in years, when known. */
  maxRegisterYears?: number | null;
};

export type ProviderDomainDetails = {
  domain: string;
  status: string;
  expiresAt: string | null;
  nameservers: string[];
  transferLock: boolean;
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
