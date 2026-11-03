/**
 * Renewal term policy — fail closed before any wallet charge or provider call.
 *
 * `POST /api/domains/checkout/renew` previously forwarded `periodYears`
 * straight from the request body into the wallet charge and
 * `provider.renewDomain(domain, period)`. Fractional, zero, negative, or
 * absurdly large values would have been priced and submitted without check.
 *
 * The ceiling is the registry-wide maximum registration/renewal period for
 * gTLDs (10 years), which the supplier catalogue in this repository also
 * reports (`maxRegisterYears: 10` in `lib/domains/providers/namesilo-pricing.ts`).
 */

export const MIN_RENEWAL_YEARS = 1;
export const MAX_RENEWAL_YEARS = 10;

export type RenewalTermResult =
  { ok: true; periodYears: number } | { ok: false; error: string };

/**
 * Accepts a missing value (defaults to one year) or an integer within
 * [MIN_RENEWAL_YEARS, MAX_RENEWAL_YEARS]. Rejects strings, floats, NaN, and
 * out-of-range numbers rather than coercing them.
 */
export function parseRenewalPeriodYears(raw: unknown): RenewalTermResult {
  if (raw === undefined || raw === null) {
    return { ok: true, periodYears: MIN_RENEWAL_YEARS };
  }
  if (typeof raw !== "number" || !Number.isInteger(raw)) {
    return {
      ok: false,
      error: `Renewal period must be a whole number of years between ${MIN_RENEWAL_YEARS} and ${MAX_RENEWAL_YEARS}.`,
    };
  }
  if (raw < MIN_RENEWAL_YEARS || raw > MAX_RENEWAL_YEARS) {
    return {
      ok: false,
      error: `Renewal period must be between ${MIN_RENEWAL_YEARS} and ${MAX_RENEWAL_YEARS} years.`,
    };
  }
  return { ok: true, periodYears: raw };
}

/** Total renewal price for a validated term; never returns a negative amount. */
export function renewalTotalForPeriod(
  renewPerYear: number,
  periodYears: number,
): number | null {
  if (!Number.isFinite(renewPerYear) || renewPerYear <= 0) return null;
  if (!Number.isInteger(periodYears)) return null;
  if (periodYears < MIN_RENEWAL_YEARS || periodYears > MAX_RENEWAL_YEARS) {
    return null;
  }
  return Math.round(renewPerYear * periodYears * 100) / 100;
}
