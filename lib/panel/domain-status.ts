/**
 * Domain lifecycle helpers shared by the customer dashboard and My Domains.
 *
 * Kept pure and dependency-free so the risk logic is unit-tested rather than
 * guessed at in three different components.
 */

export type DomainLifecycleStatus =
  "ACTIVE" | "PENDING_REGISTRATION" | "EXPIRED" | "SUSPENDED" | "FAILED";

export type DomainHealth =
  "healthy" | "expiring" | "critical" | "expired" | "pending";

/** Renewal/expiry windows used across the panel. */
export const EXPIRY_WARNING_DAYS = 45;
export const EXPIRY_CRITICAL_DAYS = 14;

export function daysUntil(
  date: Date | string | null | undefined,
): number | null {
  if (!date) return null;
  const target = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(target.getTime())) return null;
  const ms = target.getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

export function domainHealth(
  status: string,
  expiresAt: Date | string | null | undefined,
): DomainHealth {
  if (status === "EXPIRED") return "expired";
  if (status !== "ACTIVE") return "pending";

  const days = daysUntil(expiresAt);
  if (days === null) return "healthy";
  if (days <= 0) return "expired";
  if (days <= EXPIRY_CRITICAL_DAYS) return "critical";
  if (days <= EXPIRY_WARNING_DAYS) return "expiring";
  return "healthy";
}

export function domainStatusLabel(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: "Active",
    PENDING_REGISTRATION: "Setting up",
    EXPIRED: "Expired",
    SUSPENDED: "Suspended",
    FAILED: "Failed",
  };
  return map[status] ?? status;
}

/**
 * Formats a domain calendar date (expiry, registration) as `D MMM YYYY`.
 *
 * Pinned to UTC and a fixed locale on purpose: these components render on the
 * server *and* hydrate in the browser, so a locale/timezone-dependent call such
 * as `toLocaleDateString()` would produce different text on each side and
 * trigger a hydration mismatch (plus a date that shifts by a day for visitors
 * ahead of UTC). Expiry is a date, not an instant, so UTC is the correct frame.
 */
export function formatDomainDate(
  value: Date | string | null | undefined,
): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Same reasoning as `formatDomainDate`, for timestamps shown in the panel. */
export function formatPanelDateTime(
  value: Date | string | null | undefined,
): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hour12: false,
  }).format(date);
}

/** Short, human expiry copy: "in 23 days", "today", "12 days ago". */
export function expiryCopy(
  expiresAt: Date | string | null | undefined,
): string {
  const days = daysUntil(expiresAt);
  if (days === null) return "No expiry on file";
  if (days > 1) return `Renews in ${days} days`;
  if (days === 1) return "Renews tomorrow";
  if (days === 0) return "Expires today";
  if (days === -1) return "Expired yesterday";
  return `Expired ${Math.abs(days)} days ago`;
}

export type DomainHealthTone = {
  /** Tailwind classes for a small status pill. */
  pill: string;
  /** Tailwind text colour for supporting copy. */
  text: string;
  label: string;
};

export function healthTone(health: DomainHealth): DomainHealthTone {
  switch (health) {
    case "expired":
      return {
        pill: "bg-red-50 text-red-700 ring-1 ring-red-200",
        text: "text-red-700",
        label: "Expired",
      };
    case "critical":
      return {
        pill: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
        text: "text-amber-700",
        label: "Action needed",
      };
    case "expiring":
      return {
        pill: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
        text: "text-amber-700",
        label: "Expiring soon",
      };
    case "pending":
      return {
        pill: "bg-sky-50 text-sky-800 ring-1 ring-sky-200",
        text: "text-sky-700",
        label: "Setting up",
      };
    default:
      return {
        pill: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
        text: "text-emerald-700",
        label: "Active",
      };
  }
}

/**
 * Counts used for dashboard alerts. Only real, actionable states count —
 * pending registrations are not "expiring".
 */
export function summarizeDomains(
  domains: Array<{ status: string; expiresAt: Date | string | null }>,
) {
  let active = 0;
  let expiring = 0;
  let expired = 0;
  let pending = 0;

  for (const domain of domains) {
    const health = domainHealth(domain.status, domain.expiresAt);
    if (health === "healthy") active += 1;
    else if (health === "expiring" || health === "critical") expiring += 1;
    else if (health === "expired") expired += 1;
    else pending += 1;
  }

  return { total: domains.length, active, expiring, expired, pending };
}
