/** Real transfer readiness checks — registrar availability + public registry data. */

export type NameSiloTransferAvailability =
  | {
      ok: true;
      domain: string;
      /** NameSilo supplier transfer price in USD. */
      supplierTransfer: number | null;
      supplierRenew: number | null;
      premium: boolean;
    }
  | { ok: false; domain: string; reason: string };

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value.trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * NameSilo documents `available.domain` as a single object for a one-domain
 * request. Guard both shapes so a multi-domain reply cannot crash the parser.
 */
export function parseNameSiloTransferAvailability(
  payload: unknown,
  fallbackDomain: string,
): NameSiloTransferAvailability {
  const root = asRecord(payload);
  const reply = asRecord(root?.reply) ?? root;
  const domainKey = fallbackDomain.trim().toLowerCase();

  const availableNode = asRecord(reply?.available);
  const availableDomain = availableNode?.domain;
  const availableRow = Array.isArray(availableDomain)
    ? asRecord(availableDomain[0])
    : asRecord(availableDomain);

  if (availableRow) {
    return {
      ok: true,
      domain:
        typeof availableRow.domain === "string"
          ? availableRow.domain.toLowerCase()
          : domainKey,
      supplierTransfer: asNumber(availableRow.price),
      supplierRenew: asNumber(availableRow.renew),
      premium: asNumber(availableRow.premium) === 1,
    };
  }

  const unavailableNode = asRecord(reply?.unavailable);
  const unavailableDomain = unavailableNode?.domain;
  const unavailableRow = Array.isArray(unavailableDomain)
    ? asRecord(unavailableDomain[0])
    : asRecord(unavailableDomain);
  if (unavailableRow) {
    return {
      ok: false,
      domain:
        typeof unavailableRow.domain === "string"
          ? unavailableRow.domain.toLowerCase()
          : domainKey,
      reason:
        typeof unavailableRow.reason === "string" &&
        unavailableRow.reason.trim()
          ? unavailableRow.reason.trim()
          : "This domain cannot be transferred.",
    };
  }

  return {
    ok: false,
    domain: domainKey,
    reason:
      typeof reply?.detail === "string" && reply.detail.trim()
        ? reply.detail.trim()
        : "The registrar did not confirm transfer availability.",
  };
}

export type TransferRequirement = {
  id: "registered" | "unlocked" | "age" | "auth";
  label: string;
  detail: string;
  state: "pass" | "fail" | "unknown";
};

/** ICANN forbids transfers within 60 days of registration or a prior transfer. */
export const TRANSFER_MIN_AGE_DAYS = 60;

export function daysSince(iso: string | null, now = new Date()): number | null {
  if (!iso) return null;
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return null;
  return Math.floor((now.getTime() - then.getTime()) / 86_400_000);
}

/** Lock is reported by RDAP/WHOIS status, not by our own registration row. */
export function isRegistryLocked(statuses: string[]): boolean | null {
  if (!statuses.length) return null;
  const lowered = statuses.map((row) => row.toLowerCase());
  if (lowered.some((row) => row.includes("transfer prohibited"))) return true;
  if (lowered.some((row) => row.includes("ok") || row.includes("active")))
    return false;
  return null;
}

export function addYears(iso: string | null, years: number): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  date.setUTCFullYear(date.getUTCFullYear() + years);
  return date.toISOString().slice(0, 10);
}

export function buildTransferRequirements(input: {
  registrarAvailable: boolean;
  registrarReason?: string;
  registeredOn: string | null;
  statuses: string[];
  now?: Date;
}): TransferRequirement[] {
  const now = input.now ?? new Date();
  const locked = isRegistryLocked(input.statuses);
  const age = daysSince(input.registeredOn, now);

  const registered: TransferRequirement = input.registrarAvailable
    ? {
        id: "registered",
        label: "Domain is registered at another registrar",
        detail: "Confirmed by the live registrar check.",
        state: "pass",
      }
    : {
        id: "registered",
        label: "Domain is registered at another registrar",
        detail:
          input.registrarReason ??
          "We could not confirm this domain is registered.",
        state: "fail",
      };

  const unlocked: TransferRequirement =
    locked === true
      ? {
          id: "unlocked",
          label: "Transfer lock is off",
          detail:
            "The registry reports this domain as transfer-locked. Turn the lock off at your current registrar, then run the check again.",
          state: "fail",
        }
      : locked === false
        ? {
            id: "unlocked",
            label: "Transfer lock is off",
            detail: "The registry reports this domain as unlocked.",
            state: "pass",
          }
        : {
            id: "unlocked",
            label: "Transfer lock is off",
            detail:
              "We could not read the lock status from the registry. Confirm it in your current registrar's panel.",
            state: "unknown",
          };

  const ageCheck: TransferRequirement =
    age == null
      ? {
          id: "age",
          label: `At least ${TRANSFER_MIN_AGE_DAYS} days old`,
          detail:
            "Registration date is hidden by the registry. Confirm the domain is past the 60-day ICANN lock.",
          state: "unknown",
        }
      : age >= TRANSFER_MIN_AGE_DAYS
        ? {
            id: "age",
            label: `At least ${TRANSFER_MIN_AGE_DAYS} days old`,
            detail: `Registered ${age} days ago.`,
            state: "pass",
          }
        : {
            id: "age",
            label: `At least ${TRANSFER_MIN_AGE_DAYS} days old`,
            detail: `Registered only ${age} days ago. ICANN blocks transfers inside the first ${TRANSFER_MIN_AGE_DAYS} days.`,
            state: "fail",
          };

  const auth: TransferRequirement = {
    id: "auth",
    label: "Auth / EPP code ready",
    detail:
      "Copy the authorization code from your current registrar. We ask for it before payment.",
    state: "unknown",
  };

  return [registered, unlocked, ageCheck, auth];
}

export function transferRequirementsReady(requirements: TransferRequirement[]) {
  return requirements.every((row) => row.state !== "fail");
}

/** Customer-facing reason list — never echo a checklist label as a negation. */
export function transferBlockedSummary(
  requirements: TransferRequirement[],
): string[] {
  const out: string[] = [];
  for (const row of requirements) {
    if (row.state !== "fail") continue;
    if (row.id === "registered") out.push("the domain is not registered");
    else if (row.id === "unlocked")
      out.push("the transfer lock is still on at your current registrar");
    else if (row.id === "age")
      out.push(
        `the domain is still inside the ${TRANSFER_MIN_AGE_DAYS}-day ICANN transfer lock`,
      );
    else out.push(row.label.toLowerCase());
  }
  return out;
}

/** NameSilo wording used when a domain is free to register instead. */
export function looksUnregistered(reason: string | undefined): boolean {
  if (!reason) return false;
  return /not currently registered|not registered|available to register|no match/i.test(
    reason,
  );
}
