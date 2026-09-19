import { NextResponse } from "next/server";

import {
  checkDomains,
  parseBulkInput,
  type DomainResult,
} from "@/lib/domains/availability";
import { SUGGESTED_TLDS, splitDomain } from "@/lib/domains/tlds";

export const runtime = "nodejs";

const MAX_BULK = 50;

type SearchBody = {
  query?: string;
  /** Extensions to check when the query has no extension of its own. */
  tlds?: string[];
  /** Raw textarea content for bulk lookups. */
  bulk?: string;
};

/**
 * Availability lookup. Results come from lib/domains/availability today;
 * set DOMAIN_LOOKUP_URL to forward the same payload to a registrar instead.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SearchBody | null;
  const query = body?.query?.trim() ?? "";
  const bulk = body?.bulk?.trim() ?? "";

  if (!query && !bulk) {
    return NextResponse.json(
      { error: "Enter a domain name to check." },
      { status: 400 },
    );
  }

  const upstream = process.env.DOMAIN_LOOKUP_URL;
  if (upstream) {
    try {
      const response = await fetch(upstream, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(process.env.DOMAIN_LOOKUP_TOKEN
            ? { authorization: `Bearer ${process.env.DOMAIN_LOOKUP_TOKEN}` }
            : {}),
        },
        body: JSON.stringify({ query, bulk, tlds: body?.tlds }),
        cache: "no-store",
      });
      if (response.ok) {
        const json = (await response.json()) as { results?: DomainResult[] };
        if (Array.isArray(json.results)) {
          return NextResponse.json({
            results: json.results,
            source: "registrar",
          });
        }
      }
    } catch {
      /* fall through to the built-in lookup */
    }
  }

  if (bulk) {
    const names = parseBulkInput(bulk, MAX_BULK);
    if (names.length === 0) {
      return NextResponse.json(
        { error: "Add at least one domain, one per line." },
        { status: 400 },
      );
    }
    return NextResponse.json({
      results: checkDomains(names),
      source: "hostingbeyond",
    });
  }

  const { name, tld } = splitDomain(query);
  if (!name) {
    return NextResponse.json(
      { error: "Use letters, numbers or hyphens only." },
      { status: 400 },
    );
  }

  const requested = (body?.tlds ?? []).filter((item) =>
    SUGGESTED_TLDS.includes(item),
  );
  const extensions = tld
    ? [tld, ...SUGGESTED_TLDS.filter((item) => item !== tld)]
    : [...new Set([...requested, ...SUGGESTED_TLDS])];

  return NextResponse.json({
    results: checkDomains(extensions.map((item) => `${name}${item}`)),
    source: "hostingbeyond",
  });
}
