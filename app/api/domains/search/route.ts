import { NextResponse } from "next/server";

import { parseBulkInput } from "@/lib/domains/availability";
import { lookupDomainNames, lookupErrorMessage } from "@/lib/domains/lookup";
import { normalizeDomainSearchInput } from "@/lib/domains/normalize";
import {
  clientKeyFromRequest,
  rateLimitDomainSearch,
} from "@/lib/domains/rate-limit";
import { SUGGESTED_TLDS } from "@/lib/domains/tlds";

export const runtime = "nodejs";

const MAX_BULK = 50;

type SearchBody = {
  query?: string;
  tlds?: string[];
  bulk?: string;
};

export async function POST(request: Request) {
  const clientKey = clientKeyFromRequest(request);
  if (!rateLimitDomainSearch(clientKey)) {
    return NextResponse.json(
      { error: lookupErrorMessage("rate_limit") },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as SearchBody | null;
  const queryRaw = body?.query?.trim() ?? "";
  const bulk = body?.bulk?.trim() ?? "";

  if (!queryRaw && !bulk) {
    return NextResponse.json(
      { error: "Please enter a domain name." },
      { status: 400 },
    );
  }

  try {
    if (bulk) {
      const names = parseBulkInput(bulk, MAX_BULK);
      if (names.length === 0) {
        return NextResponse.json(
          { error: "Add at least one domain, one per line." },
          { status: 400 },
        );
      }
      const invalid = names.find((n) => !normalizeDomainSearchInput(n).ok);
      if (invalid) {
        return NextResponse.json(
          { error: "Please enter a valid domain name on every line." },
          { status: 400 },
        );
      }
      const { results, source } = await lookupDomainNames(names, { bulk });
      return NextResponse.json({ results, source });
    }

    const normalized = normalizeDomainSearchInput(queryRaw);
    if (!normalized.ok) {
      return NextResponse.json({ error: normalized.error }, { status: 400 });
    }

    const { name, tld, query } = normalized;
    const requested = (body?.tlds ?? []).filter((item) =>
      SUGGESTED_TLDS.includes(item),
    );
    const extensions = tld
      ? [tld, ...SUGGESTED_TLDS.filter((item) => item !== tld)]
      : [...new Set([...requested, ...SUGGESTED_TLDS])];

    const names = extensions.map((item) => `${name}${item}`);
    const anchorDomain = tld ? `${name}${tld}` : (names[0] ?? `${name}.com`);
    const { results, source } = await lookupDomainNames(names, {
      query,
      tlds: extensions,
    });

    return NextResponse.json({ results, source, anchorDomain, query });
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? lookupErrorMessage("timeout")
        : lookupErrorMessage(
            error instanceof Error ? error.message : "lookup_failed",
          );
    const status =
      error instanceof Error && error.message === "rate_limit"
        ? 429
        : error instanceof Error && error.message === "lookup_unconfigured"
          ? 503
          : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
