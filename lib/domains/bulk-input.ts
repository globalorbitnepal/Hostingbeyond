/** Parses a bulk textarea (one domain per line, commas or spaces allowed). */
export function parseBulkInputTokens(value: string, limit = 50): string[] {
  return value
    .split(/[\s,;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
}

/** Count unique domains in bulk textarea (case-insensitive), without applying the search limit. */
export function countBulkUniqueDomains(value: string): number {
  const tokens = parseBulkInputTokens(value, 10_000);
  const seen = new Set<string>();
  let count = 0;
  for (const token of tokens) {
    const key = token.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    count += 1;
  }
  return count;
}

export function bulkInputExceedsLimit(value: string, limit = 50): boolean {
  return countBulkUniqueDomains(value) > limit;
}

/** Parse textarea input, dedupe (case-insensitive), preserve first-seen order. */
export function parseBulkInputDeduped(value: string, limit = 50): string[] {
  const tokens = parseBulkInputTokens(value, 10_000);
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
