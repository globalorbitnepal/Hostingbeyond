import { NextResponse } from "next/server";

import type { DomainResult } from "@/lib/domains/availability";
import { parseBulkInput } from "@/lib/domains/availability";
import { lookupDomainNames, lookupErrorMessage } from "@/lib/domains/lookup";
import { normalizeDomainSearchInput } from "@/lib/domains/normalize";
import {
  buildRecommendationFqdns,
  filterRegisterableRecommendations,
  getRecommendationTierPools,
  getSearchableTldCatalogue,
  recommendationResultLimit,
  sortRecommendationResults,
} from "@/lib/domains/recommendation-tlds";
import {
  clientKeyFromRequest,
  rateLimitDomainSearch,
} from "@/lib/domains/rate-limit";
import { runSingleFlowDomainSearch } from "@/lib/domains/single-flow-search";
import {
  runPhasedDomainSearch,
  shouldFetchTier2,
} from "@/lib/domains/search-orchestrator";
import { countProviderSupportedTlds } from "@/lib/domains/tld-catalogue-cache";

export const runtime = "nodejs";

const MAX_BULK = 50;

type SearchScope =
  "full" | "primary" | "alternatives" | "phased" | "single-flow";

type SearchBody = {
  query?: string;
  tlds?: string[];
  bulk?: string;
  scope?: SearchScope;
  /** Tier 2 broader discovery when tier 1 is insufficient. */
  tier?: 1 | 2;
};

function toCustomerResult(row: DomainResult) {
  return {
    domain: row.domain,
    name: row.name,
    tld: row.tld,
    status: row.status,
    registrationPrice: row.register,
    renewalPrice: row.renew,
    transferPrice: row.transfer,
    message: row.message,
  };
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
      return NextResponse.json({
        results,
        source,
        resultsCustomer: results.map(toCustomerResult),
      });
    }

    const scope: SearchScope =
      body?.scope === "primary" ||
      body?.scope === "alternatives" ||
      body?.scope === "full" ||
      body?.scope === "phased" ||
      body?.scope === "single-flow"
        ? body.scope
        : "phased";

    if (scope === "single-flow") {
      const flow = await runSingleFlowDomainSearch(queryRaw);
      const primary = flow.primary;
      const recommendations = flow.recommendations;
      return NextResponse.json({
        anchorDomain: flow.anchorDomain,
        query: flow.query,
        scope: "single-flow",
        source: flow.source,
        primary,
        results: primary ? [primary, ...recommendations] : recommendations,
        recommendations,
        tier1PoolSize: flow.tier1PoolSize,
        tier2PoolSize: flow.tier2PoolSize,
        tier2Fetched: flow.tier2Fetched,
        searchableTldCount: await countProviderSupportedTlds(),
        alternativesComplete: flow.alternativesComplete,
        resultsCustomer: (primary
          ? [primary, ...recommendations]
          : recommendations
        ).map(toCustomerResult),
      });
    }

    if (scope === "phased") {
      const tier = body?.tier === 2 ? 2 : 1;
      const phased = await runPhasedDomainSearch(queryRaw, { tier });
      const primary = phased.primary;
      const recommendations = phased.recommendations;

      return NextResponse.json({
        anchorDomain: phased.anchorDomain,
        query: phased.query,
        scope: "phased",
        tier: phased.tier,
        source: phased.source,
        primary: primary ?? null,
        results: primary ? [primary, ...recommendations] : recommendations,
        recommendations,
        extensionsChecked: phased.extensionsChecked,
        tier1PoolSize: phased.tier1PoolSize,
        tier2PoolSize: phased.tier2PoolSize,
        searchableTldCount: await countProviderSupportedTlds(),
        alternativesComplete: phased.alternativesComplete,
        suggestTier2:
          tier === 1 &&
          shouldFetchTier2(recommendations.length, phased.alternativesComplete),
        timings: phased.timings,
        resultsCustomer: (primary
          ? [primary, ...recommendations]
          : recommendations
        ).map(toCustomerResult),
      });
    }

    const normalized = normalizeDomainSearchInput(queryRaw);
    if (!normalized.ok) {
      return NextResponse.json({ error: normalized.error }, { status: 400 });
    }

    const { name, tld, query } = normalized;
    const tier = body?.tier === 2 ? 2 : 1;
    const { tier1, tier2, catalogueSize } = await getRecommendationTierPools();
    const pool = tier === 2 ? tier2 : tier1;
    const searchable = await getSearchableTldCatalogue();

    const anchorDomain = tld
      ? `${name}${tld}`.toLowerCase()
      : `${name}${tier1[0] ?? ".com"}`.toLowerCase();

    let names: string[];
    if (scope === "primary") {
      names = [anchorDomain];
    } else if (scope === "alternatives") {
      names = buildRecommendationFqdns(name, anchorDomain, pool);
    } else {
      names = searchable.map((item) => `${name}${item}`);
    }

    const { results, source } = await lookupDomainNames(names, {
      query,
      tlds: pool,
    });

    let responseResults = results;
    if (scope === "alternatives") {
      responseResults = sortRecommendationResults(
        filterRegisterableRecommendations(results),
      ).slice(0, recommendationResultLimit());
    }

    return NextResponse.json({
      results: responseResults,
      source,
      anchorDomain,
      query,
      scope,
      tier,
      extensionsChecked: names.length,
      recommendationPoolSize: pool.length,
      catalogueSize,
      alternativesComplete: scope === "alternatives",
      resultsCustomer: responseResults.map(toCustomerResult),
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
