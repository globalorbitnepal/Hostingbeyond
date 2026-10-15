import type { DomainResult } from "@/lib/domains/availability";
import { parseBulkInput } from "@/lib/domains/availability";
import { lookupDomainNames } from "@/lib/domains/lookup";
import { normalizeDomainSearchInput } from "@/lib/domains/normalize";
import { splitDomain } from "@/lib/domains/tlds";

export type BulkPreparedLine =
  | { kind: "lookup"; raw: string; fqdn: string }
  | { kind: "invalid"; raw: string; domain: string; message: string };

/** Parse textarea input, dedupe (case-insensitive), preserve first-seen order. */
export function parseBulkInputDeduped(value: string, limit = 50): string[] {
  const tokens = parseBulkInput(value, limit + 20);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const token of tokens) {
    const key = token.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(token.trim());
    if (out.length >= limit) break;
  }
  return out;
}

export function classifyBulkLine(raw: string): BulkPreparedLine {
  const trimmed = raw.trim();
  const normalized = normalizeDomainSearchInput(trimmed);
  if (!normalized.ok) {
    const { name, tld } = splitDomain(trimmed);
    const domain =
      name && tld
        ? `${name}${tld}`.toLowerCase()
        : name
          ? `${name}.com`.toLowerCase()
          : trimmed.toLowerCase() || "invalid";
    return {
      kind: "invalid",
      raw: trimmed,
      domain,
      message: normalized.error,
    };
  }
  const fqdn = (
    normalized.tld ? normalized.query : `${normalized.name}.com`
  ).toLowerCase();
  return { kind: "lookup", raw: trimmed, fqdn };
}

export function invalidBulkResult(
  line: BulkPreparedLine & { kind: "invalid" },
): DomainResult {
  const { name, tld } = splitDomain(line.domain);
  return {
    domain: line.domain,
    name: name || line.domain.split(".")[0] || "",
    tld: tld || ".com",
    status: "invalid",
    register: null,
    renew: null,
    transfer: null,
    message: line.message,
  };
}

export function unknownBulkResult(
  fqdn: string,
  message = "Temporarily unavailable — registry check did not complete. Please try again.",
): DomainResult {
  const { name, tld } = splitDomain(fqdn);
  return {
    domain: fqdn.toLowerCase(),
    name,
    tld: tld || ".com",
    status: "unknown",
    register: null,
    renew: null,
    transfer: null,
    message,
  };
}

/** Run registrar lookup for a bulk shortlist; invalid lines never block valid ones. */
export async function runBulkDomainSearch(
  bulkText: string,
  limit = 50,
): Promise<{ results: DomainResult[]; source: "registrar" | "catalog" }> {
  const lines = parseBulkInputDeduped(bulkText, limit).map(classifyBulkLine);
  const fqdns = lines
    .filter(
      (line): line is BulkPreparedLine & { kind: "lookup" } =>
        line.kind === "lookup",
    )
    .map((line) => line.fqdn);

  let lookedUp: DomainResult[] = [];
  let source: "registrar" | "catalog" = "registrar";
  if (fqdns.length) {
    const response = await lookupDomainNames(fqdns, { bulk: bulkText });
    lookedUp = response.results;
    source = response.source;
  }

  const byDomain = new Map(
    lookedUp.map((row) => [row.domain.toLowerCase(), row]),
  );
  const results = lines.map((line) => {
    if (line.kind === "invalid") return invalidBulkResult(line);
    return byDomain.get(line.fqdn) ?? unknownBulkResult(line.fqdn);
  });

  return { results, source };
}
