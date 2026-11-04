import type { BeyondMasterDomainSuggestion } from "@/lib/beyond-master/types";
import type { DomainResult } from "@/lib/domains/availability";
import { lookupDomainNames, lookupErrorMessage } from "@/lib/domains/lookup";
import { normalizeDomainSearchInput } from "@/lib/domains/normalize";
import { splitDomain } from "@/lib/domains/tlds";

export type AgentDomainSuggestion = BeyondMasterDomainSuggestion & {
  status: DomainResult["status"];
  currency: "USD";
};

export type AgentDomainSearch = {
  query: string;
  error: string | null;
  results: AgentDomainSuggestion[];
};

const SUGGEST_TLDS = [".com", ".net", ".org", ".online", ".shop", ".dev"];

export function domainSearchHref(query: string): string {
  return `/domain-name-search?q=${encodeURIComponent(query)}`;
}

export async function searchDomainsForAgent(
  queryRaw: string,
): Promise<AgentDomainSearch> {
  const normalized = normalizeDomainSearchInput(queryRaw);
  if (!normalized.ok) {
    return { query: queryRaw.trim(), error: normalized.error, results: [] };
  }
  const anchorTld = (normalized.tld || ".com").toLowerCase();
  const extras = SUGGEST_TLDS.filter((tld) => tld !== anchorTld).slice(0, 5);
  const fqdns = [
    `${normalized.name}${anchorTld}`,
    ...extras.map((tld) => `${normalized.name}${tld}`),
  ];
  try {
    const tlds = [
      ...new Set(fqdns.map((item) => splitDomain(item).tld || ".com")),
    ];
    const { results } = await lookupDomainNames(
      fqdns,
      { query: normalized.query, tlds },
      { fresh: true },
    );
    const seen = new Set<string>();
    const mapped: AgentDomainSuggestion[] = [];
    for (const row of results) {
      const domain = row.domain.toLowerCase();
      if (seen.has(domain)) continue;
      seen.add(domain);
      mapped.push({
        domain,
        status: row.status,
        register: row.register,
        currency: "USD",
        href: domainSearchHref(domain),
      });
    }
    mapped.sort((a, b) => {
      const rank = (status: DomainResult["status"]) =>
        status === "available" ? 0 : status === "premium" ? 1 : 2;
      return (
        rank(a.status) - rank(b.status) || a.domain.localeCompare(b.domain)
      );
    });
    return {
      query: normalized.query,
      error: null,
      results: mapped.slice(0, 8),
    };
  } catch (error) {
    const code = error instanceof Error ? error.message : "lookup_failed";
    return {
      query: normalized.query,
      error: lookupErrorMessage(code),
      results: [],
    };
  }
}

export function formatDomainSearchForPrompt(search: AgentDomainSearch): string {
  if (search.error && search.results.length === 0) {
    return `Live domain search for ${search.query} failed: ${search.error}. Do not invent availability. Point the customer to /domain-name-search.`;
  }
  if (search.results.length === 0) {
    return `Live domain search for ${search.query} returned no rows. Point the customer to /domain-name-search. Do not invent availability.`;
  }
  const lines = [
    `Live domain search for ${search.query}. Quote only these rows. Do not invent other availability or prices.`,
  ];
  for (const row of search.results) {
    const price =
      row.register != null
        ? `${row.register.toFixed(2)} ${row.currency}/year first year`
        : "price on the domain search page";
    lines.push(`${row.domain} ${row.status} ${price} ${row.href}`);
  }
  lines.push("Registration completes only on /domain-name-search or /cart.");
  return lines.join("\n");
}

export function formatDomainSearchForCustomer(
  search: AgentDomainSearch,
): string {
  if (search.error && search.results.length === 0) {
    return `${search.error} You can also search live names at /domain-name-search.`;
  }
  if (search.results.length === 0) {
    return `I could not list live results for ${search.query} here. Open /domain-name-search to check availability and prices.`;
  }
  const lines = [`Here is a live check for ${search.query}:`];
  for (const row of search.results) {
    const price =
      row.register != null ? ` · from $${row.register.toFixed(2)}/yr` : "";
    lines.push(`• ${row.domain} — ${row.status}${price}`);
  }
  lines.push(
    `Open ${domainSearchHref(search.query)} to register an available name. I cannot complete checkout from this chat.`,
  );
  return lines.join("\n");
}
