/** Maximum unique domain names per bulk availability request (frontend + API). */
export const MAX_BULK_DOMAIN_SEARCH = 10;

export const BULK_SEARCH_LIMIT_MESSAGE = `You can check up to ${MAX_BULK_DOMAIN_SEARCH} unique domain names per search. Split longer lists into multiple searches.`;

export const BULK_LIMIT_EXCEEDED_CODE = "bulk_limit_exceeded";

export type BulkLimitExceededPayload = {
  code: typeof BULK_LIMIT_EXCEEDED_CODE;
  error: string;
  limit: number;
};

/** Count unique non-empty domain strings (case-insensitive). */
export function countUniqueDomainInputs(domains: string[]): number {
  const seen = new Set<string>();
  let count = 0;
  for (const raw of domains) {
    const key = raw.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    count += 1;
  }
  return count;
}

export function domainListExceedsBulkLimit(domains: string[]): boolean {
  return countUniqueDomainInputs(domains) > MAX_BULK_DOMAIN_SEARCH;
}

export function bulkLimitExceededResponse(): BulkLimitExceededPayload {
  return {
    code: BULK_LIMIT_EXCEEDED_CODE,
    error: BULK_SEARCH_LIMIT_MESSAGE,
    limit: MAX_BULK_DOMAIN_SEARCH,
  };
}
