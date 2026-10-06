import { NextResponse } from "next/server";

import type { DomainResult } from "@/lib/domains/availability";
import { parseBulkInput } from "@/lib/domains/availability";
import { lookupDomainNames, lookupErrorMessage } from "@/lib/domains/lookup";
import { normalizeDomainSearchInput } from "@/lib/domains/normalize";
import {
  buildRecommendationFqdns,
  getRecommendationTldPool,
  recommendationResultLimit,
  sortByRecommendationPriority,
} from "@/lib/domains/recommendation-tlds";
import {
  clientKeyFromRequest,
  rateLimitDomainSearch,
} from "@/lib/domains/rate-limit";
export const runtime = "nodejs";

const MAX_BULK = 50;

type SearchScope = "full" | "primary" | "alternatives";

type SearchBody = {
  query?: string;
  tlds?: string[];
  bulk?: string;
  /** `primary` = anchor only; `alternatives` = other extensions; default `full`. */
  scope?: SearchScope;
};

function isRegisterableRecommendation(result: DomainResult) {
  if (result.status === "available") return true;
  if (result.status === "premium" && result.register != null) return true;
  return false;
}

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
    const recommendationPool = await getRecommendationTldPool();
    const requested = (body?.tlds ?? []).filter((item) =>
      recommendationPool.includes(item.toLowerCase()),
    );
    const extensions = tld
      ? [tld, ...recommendationPool.filter((item) => item !== tld)]
      : [...new Set([...requested, ...recommendationPool])];

    const anchorDomain = tld
      ? `${name}${tld}`
      : `${name}${extensions[0] ?? ".com"}`;

    const scope: SearchScope =
      body?.scope === "primary" ||
      body?.scope === "alternatives" ||
      body?.scope === "full"
        ? body.scope
        : "full";

    let names: string[];
    if (scope === "primary") {
      names = [anchorDomain];
    } else if (scope === "alternatives") {
      names = buildRecommendationFqdns(name, anchorDomain, recommendationPool);
    } else {
      names = extensions.map((item) => `${name}${item}`);
    }

    const { results, source } = await lookupDomainNames(names, {
      query,
      tlds: extensions,
    });

    let responseResults = results;
    if (scope === "alternatives") {
      const limit = recommendationResultLimit();
      responseResults = results
        .filter(isRegisterableRecommendation)
        .sort((a, b) => sortByRecommendationPriority(a.tld, b.tld))
        .slice(0, limit);
    }

    return NextResponse.json({
      results: responseResults,
      source,
      anchorDomain,
      query,
      scope,
      extensionsChecked: names.length,
      recommendationPoolSize: recommendationPool.length,
      alternativesComplete: scope === "alternatives",
    });
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
