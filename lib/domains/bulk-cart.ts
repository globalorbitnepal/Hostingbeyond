import {
  BULK_SEARCH_LIMIT_MESSAGE,
  domainListExceedsBulkLimit,
  MAX_BULK_DOMAIN_SEARCH,
} from "@/lib/domains/bulk-search-limit";
import { validateDomainForRegistration } from "@/lib/domains/validate-registration";
import { normalizeDomainSearchInput } from "@/lib/domains/normalize";

export type BulkCartItem = {
  domain: string;
  status: string;
  register: number;
  renew: number;
  transfer: number;
  currency: string;
};

export type BulkCartValidationResult =
  | {
      ok: true;
      items: BulkCartItem[];
      rejected: Array<{ input: string; error: string }>;
    }
  | {
      ok: false;
      code: "bulk_limit_exceeded";
      limit: number;
      error: string;
    };

export async function validateDomainsForBulkCart(
  domains: string[],
): Promise<BulkCartValidationResult> {
  if (domainListExceedsBulkLimit(domains)) {
    return {
      ok: false,
      code: "bulk_limit_exceeded",
      limit: MAX_BULK_DOMAIN_SEARCH,
      error: BULK_SEARCH_LIMIT_MESSAGE,
    };
  }

  const unique: string[] = [];
  const seen = new Set<string>();
  for (const raw of domains) {
    const trimmed = raw.trim().toLowerCase();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    unique.push(trimmed);
  }

  const items: BulkCartItem[] = [];
  const rejected: Array<{ input: string; error: string }> = [];

  for (const input of unique) {
    const normalized = normalizeDomainSearchInput(input);
    if (!normalized.ok) {
      rejected.push({ input, error: normalized.error });
      continue;
    }
    const validated = await validateDomainForRegistration(normalized.query);
    if (!validated.ok) {
      rejected.push({ input, error: validated.error });
      continue;
    }
    const { result } = validated;
    if (result.status !== "available" && result.status !== "premium") {
      rejected.push({
        input,
        error: "Domain is not available to register.",
      });
      continue;
    }
    if (result.register == null) {
      rejected.push({
        input,
        error: "Pricing unavailable for this extension.",
      });
      continue;
    }
    items.push({
      domain: result.domain,
      status: result.status,
      register: result.register,
      renew: result.renew ?? 0,
      transfer: result.transfer ?? 0,
      currency: "USD",
    });
  }

  return { ok: true, items, rejected };
}
