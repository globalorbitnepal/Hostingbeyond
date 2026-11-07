/**
 * Pure rules for who may create or overwrite Beyond Master chat thread rows from
 * customer-facing routes. Staff/Orbit paths use separate authorization.
 */
export type ThreadOwnerSnapshot = {
  customerUserId: string | null;
  guestKey: string | null;
} | null;

export function guestThreadAuthOk(
  existing: ThreadOwnerSnapshot,
  actingCustomerUserId: string | null,
  guestKeyMatches: boolean,
): boolean {
  if (!existing || existing.customerUserId !== null) return false;
  if (actingCustomerUserId !== null) return false;
  // Legacy row: no capability recorded yet — first write issues a token.
  if (!existing.guestKey) return true;
  return guestKeyMatches;
}

export function threadWriteBlockedReason(
  existing: ThreadOwnerSnapshot,
  actingCustomerUserId: string | null,
  guestKeyMatches: boolean,
): "forbidden" | "guest_capability_required" | null {
  if (!existing) return null;

  if (existing.customerUserId !== null) {
    if (
      actingCustomerUserId === null ||
      actingCustomerUserId !== existing.customerUserId
    ) {
      return "forbidden";
    }
    return null;
  }

  if (actingCustomerUserId !== null) {
    return "forbidden";
  }

  if (!guestThreadAuthOk(existing, actingCustomerUserId, guestKeyMatches)) {
    return existing.guestKey ? "forbidden" : "guest_capability_required";
  }

  return null;
}

/** Enqueueing human support on an existing thread (prevents cross-tenant queue takeover). */
export function humanSupportEnqueueBlockedReason(
  existing: ThreadOwnerSnapshot,
  actingCustomerUserId: string | null,
  guestKeyMatches: boolean,
): "forbidden" | "guest_capability_required" | null {
  if (!existing) return null;

  if (existing.customerUserId !== null) {
    if (
      actingCustomerUserId === null ||
      actingCustomerUserId !== existing.customerUserId
    ) {
      return "forbidden";
    }
    return null;
  }

  if (actingCustomerUserId !== null) {
    return "forbidden";
  }

  if (!guestThreadAuthOk(existing, actingCustomerUserId, guestKeyMatches)) {
    return existing.guestKey ? "forbidden" : "guest_capability_required";
  }

  return null;
}
