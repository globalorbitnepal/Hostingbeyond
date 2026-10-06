import type { DomainResult } from "@/lib/domains/availability";

/** Wholesale / registrar cost — never send to the browser. */
export type SupplierPricing = {
  register: number | null;
  renew: number | null;
  transfer: number | null;
  currency: string;
};

export type ProviderAvailabilityRow = {
  domain: string;
  name: string;
  tld: string;
  status: DomainResult["status"];
  supplier: SupplierPricing;
  message?: string;
};

export type DomainProviderErrorCode =
  | "timeout"
  | "provider_failure"
  | "domain_not_found"
  | "invalid_domain"
  | "tld_unsupported"
  | "insufficient_balance"
  | "rate_limit"
  | "unconfigured"
  | "live_api_blocked_in_dev";

export class DomainProviderError extends Error {
  readonly code: DomainProviderErrorCode;

  constructor(code: DomainProviderErrorCode, message?: string) {
    super(message ?? code);
    this.name = "DomainProviderError";
    this.code = code;
  }
}

export type MappedDomainLookup = {
  result: DomainResult;
  supplier: SupplierPricing;
};
