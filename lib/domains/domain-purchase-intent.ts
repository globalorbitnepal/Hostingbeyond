import { routes } from "@/config/routes";
import {
  BULK_SEARCH_LIMIT_MESSAGE,
  MAX_BULK_DOMAIN_SEARCH,
  domainListExceedsBulkLimit,
} from "@/lib/domains/bulk-search-limit";

export function parseDomainListFromSearchParams(
  params: Record<string, string | string[] | undefined>,
): string[] {
  const rawDomains = params.domains;
  const rawDomain = params.domain;
  const list: string[] = [];

  if (typeof rawDomains === "string" && rawDomains.trim()) {
    list.push(
      ...rawDomains
        .split(/[\s,]+/)
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean),
    );
  } else if (Array.isArray(rawDomains)) {
    for (const chunk of rawDomains) {
      list.push(
        ...chunk
          .split(/[\s,]+/)
          .map((d) => d.trim().toLowerCase())
          .filter(Boolean),
      );
    }
  }

  if (typeof rawDomain === "string" && rawDomain.trim()) {
    list.unshift(rawDomain.trim().toLowerCase());
  }

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const domain of list) {
    if (seen.has(domain)) continue;
    seen.add(domain);
    unique.push(domain);
    if (unique.length >= 200) break;
  }
  return unique;
}

/** Register from the TLD price table — start domain search, not account signup. */
export function domainTldSearchHref(tld: string): string {
  const ext = tld.trim().toLowerCase();
  const dotted = ext.startsWith(".") ? ext : `.${ext}`;
  return `${routes.domainSearch}?q=${encodeURIComponent(`yourname${dotted}`)}`;
}

export function businessEmailBookingHref(
  planId: string,
  term = "monthly",
): string {
  const params = new URLSearchParams({
    email: planId.trim() || "starter",
    term,
  });
  return `${routes.domainSearch}?${params.toString()}`;
}

export function domainCheckoutPath(domains: string[]): string {
  if (domains.length === 1) {
    return `${routes.domainCheckout}?domain=${encodeURIComponent(domains[0]!)}`;
  }
  return `${routes.domainCheckout}?domains=${encodeURIComponent(domains.join(","))}`;
}

export function loginPathForDomainCheckout(domains: string[]): string {
  const next = domainCheckoutPath(domains);
  return `${routes.login}?next=${encodeURIComponent(next)}`;
}

export function signupPathForDomainCheckout(domains: string[]): string {
  const next = domainCheckoutPath(domains);
  return `${routes.signup}?next=${encodeURIComponent(next)}`;
}

/** Visible copy when checkout URL contained more than the per-request bulk limit. */
export function bulkSearchLimitRedirectMessage(
  limit = MAX_BULK_DOMAIN_SEARCH,
): string {
  return `${BULK_SEARCH_LIMIT_MESSAGE} Your full list is shown below — search the first ${limit} unique names, then run another search for the rest.`;
}

/**
 * Redirect target for checkout URLs with too many unique domains.
 * Preserves the full parsed list in `domains` (newline-separated) for the bulk UI.
 */
export function buildBulkSearchOverLimitRedirect(domains: string[]): string {
  const params = new URLSearchParams();
  params.set("bulk_limit", "1");
  params.set("limit", String(MAX_BULK_DOMAIN_SEARCH));
  const preserved = parseDomainListFromSearchParams({
    domains: domains.join("\n"),
  });
  if (preserved.length) {
    params.set("domains", preserved.join("\n"));
  }
  return `${routes.bulkDomainSearch}?${params.toString()}`;
}

export function parseBulkSearchHubParams(
  params: Record<string, string | string[] | undefined>,
): {
  initialBulkText: string;
  bulkLimitMessage: string | null;
} {
  const domains = parseDomainListFromSearchParams(params);
  const initialBulkText = domains.join("\n");
  const flag = params.bulk_limit;
  const show =
    flag === "1" ||
    flag === "true" ||
    (typeof flag === "string" && flag.trim() === "1");
  const bulkLimitMessage = show ? bulkSearchLimitRedirectMessage() : null;
  return { initialBulkText, bulkLimitMessage };
}

export function shouldRedirectCheckoutDomainsToBulkSearch(
  domains: string[],
): boolean {
  return domainListExceedsBulkLimit(domains);
}
