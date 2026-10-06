import type { DomainResult } from "@/lib/domains/availability";
import {
  isDomainProviderConfigured,
  lookupDomainNames,
  lookupErrorMessage,
} from "@/lib/domains/lookup";
import { normalizeDomainSearchInput } from "@/lib/domains/normalize";

/** Re-validates one domain before checkout (server-side pricing only). */
export async function validateDomainForRegistration(
  domainInput: string,
): Promise<
  | { ok: true; result: DomainResult }
  | { ok: false; error: string; status: number }
> {
  const normalized = normalizeDomainSearchInput(domainInput);
  if (!normalized.ok) {
    return { ok: false, error: normalized.error, status: 400 };
  }

  if (!isDomainProviderConfigured()) {
    return {
      ok: false,
      error: lookupErrorMessage("lookup_unconfigured"),
      status: 503,
    };
  }

  try {
    const { results } = await lookupDomainNames([normalized.query], {
      query: normalized.query,
    });
    const result = results.find((r) => r.domain === normalized.query);
    if (!result) {
      return {
        ok: false,
        error: lookupErrorMessage("lookup_failed"),
        status: 502,
      };
    }
    if (result.status === "taken") {
      return {
        ok: false,
        error: "This domain is no longer available. Please search again.",
        status: 409,
      };
    }
    if (result.status === "unknown") {
      return {
        ok: false,
        error: lookupErrorMessage("provider_failure"),
        status: 502,
      };
    }
    if (result.status === "invalid") {
      return {
        ok: false,
        error: result.message ?? "Please enter a valid domain name.",
        status: 400,
      };
    }
    if (
      (result.status === "available" || result.status === "premium") &&
      result.register == null
    ) {
      return {
        ok: false,
        error: "Pricing is unavailable for this domain. Please search again.",
        status: 400,
      };
    }
    return { ok: true, result };
  } catch (error) {
    const code = error instanceof Error ? error.message : "lookup_failed";
    const status =
      code === "rate_limit" ? 429 : code === "lookup_unconfigured" ? 503 : 502;
    return {
      ok: false,
      error: lookupErrorMessage(code),
      status,
    };
  }
}
