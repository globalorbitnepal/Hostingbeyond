/**
 * Beyond Master numeric policy — one source of truth for shipped limits.
 *
 * These are application-level guards, not provider billing caps. Changing them
 * is a product decision and must be reflected in
 * `docs/BEYOND-MASTER-PRODUCTION-RELEASE.md` (AI cap $5, guest 15/hour).
 */

/** Application cap: USD 5.00 / month (warn $3, critical $4). */
export const BEYOND_MASTER_MONTHLY_CAP_CENTS = 500;
export const BEYOND_MASTER_BUDGET_WARN_CENTS = 300;
export const BEYOND_MASTER_BUDGET_CRITICAL_CENTS = 400;

/** Default reservation before a paid provider call, reconciled after usage. */
export const BEYOND_MASTER_DEFAULT_RESERVE_CENTS = 25;

/** Guest chat: 15 requests per rolling fixed window of one hour. */
export const BEYOND_MASTER_GUEST_RATE_LIMIT = 15;
export const BEYOND_MASTER_GUEST_RATE_WINDOW_MS = 60 * 60 * 1000;

/** Authenticated customer account tools. */
export const BEYOND_MASTER_TOOLS_RATE_LIMIT = 30;
export const BEYOND_MASTER_TOOLS_RATE_WINDOW_MS = 10 * 60 * 1000;

/** Default provider timeout / output sizing (overridable by env within bounds). */
export const BEYOND_MASTER_AI_TIMEOUT_MS = 45_000;
export const BEYOND_MASTER_AI_MAX_OUTPUT_TOKENS = 900;
export const BEYOND_MASTER_AI_RATE_LIMIT = 20;
export const BEYOND_MASTER_AI_RATE_WINDOW_MS = 600_000;

/** Stale AI budget reservation threshold (10 minutes). */
export const BEYOND_MASTER_AI_RESERVATION_STALE_MS = 600_000;
