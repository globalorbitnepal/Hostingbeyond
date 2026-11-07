import type { AdminUser } from "@prisma/client";

import type { ReadOnlyAgentTool } from "@/lib/beyond-master/tools/types";
import {
  GUEST_ALLOWED_READ_ONLY_TOOLS,
  READ_ONLY_AGENT_TOOLS,
} from "@/lib/beyond-master/tools/types";
import {
  orbitAccessForAdmin,
  type OrbitAccessMode,
} from "@/lib/orbit/staff-access";

export type AiPrincipalRole = "guest" | "customer" | "support" | "admin";

export type AiPrincipal =
  | { role: "guest" }
  | { role: "customer"; customerUserId: string }
  | { role: "support" | "admin"; admin: AdminUser };

export function principalFromSession(input: {
  customerUserId: string | null;
  orbitAdmin: AdminUser | null;
  /** When an Orbit session is present; from {@link orbitAccessForAdmin} (server-side only). */
  orbitAccessMode?: OrbitAccessMode | null;
}): AiPrincipal {
  if (input.orbitAdmin) {
    const mode =
      input.orbitAccessMode ?? orbitAccessForAdmin(input.orbitAdmin.id);
    if (mode === "support_only") {
      return { role: "support", admin: input.orbitAdmin };
    }
    if (mode === "full") {
      return { role: "admin", admin: input.orbitAdmin };
    }
    return { role: "guest" };
  }
  if (input.customerUserId) {
    return { role: "customer", customerUserId: input.customerUserId };
  }
  return { role: "guest" };
}

/**
 * Public Beyond Master chat (`/api/beyond-master/chat`): verified customer JWT
 * always wins for tool authorization. Orbit staff cookies never grant another
 * customer's account access; without a customer session, Orbit access mode
 * (from env + verified {@link AdminUser}) maps to support/admin guest tools only.
 */
export function principalForPublicBeyondMasterChat(input: {
  customerUserId: string | null;
  orbitAdmin: AdminUser | null;
  orbitAccessMode?: OrbitAccessMode | null;
}): AiPrincipal {
  if (input.customerUserId) {
    return { role: "customer", customerUserId: input.customerUserId };
  }
  return principalFromSession({
    customerUserId: null,
    orbitAdmin: input.orbitAdmin,
    orbitAccessMode: input.orbitAccessMode,
  });
}

/** Orbit-only routes: reject customer and guest callers. */
export function canAccessOrbit(principal: AiPrincipal): boolean {
  return principal.role === "admin" || principal.role === "support";
}

const PRIVATE_TOOLS: ReadOnlyAgentTool[] = READ_ONLY_AGENT_TOOLS.filter(
  (t) => !GUEST_ALLOWED_READ_ONLY_TOOLS.includes(t),
);

/**
 * Central policy for read-only agent tools. Private tools require the session
 * customer id; never trust ids from the client body.
 */
export function canExecuteReadOnlyTool(
  principal: AiPrincipal,
  tool: ReadOnlyAgentTool,
): boolean {
  if (GUEST_ALLOWED_READ_ONLY_TOOLS.includes(tool)) return true;
  if (principal.role === "support" || principal.role === "admin") {
    return false;
  }
  if (principal.role !== "customer") return false;
  return PRIVATE_TOOLS.includes(tool);
}

export function assertCustomerOwnership(
  principal: AiPrincipal,
  ownerId: string | null | undefined,
):
  | { ok: true; customerUserId: string }
  | { ok: false; code: "forbidden" | "unauthenticated" } {
  if (principal.role !== "customer") {
    return { ok: false, code: "unauthenticated" };
  }
  if (!ownerId || ownerId !== principal.customerUserId) {
    return { ok: false, code: "forbidden" };
  }
  return { ok: true, customerUserId: principal.customerUserId };
}

/** Staff may read any customer's records; customers only their own. */
export function canReadCustomerRecord(
  principal: AiPrincipal,
  recordCustomerId: string | null | undefined,
):
  | { ok: true; customerUserId: string | null }
  | { ok: false; code: "forbidden" } {
  if (principal.role === "admin" || principal.role === "support") {
    return { ok: true, customerUserId: recordCustomerId ?? null };
  }
  if (principal.role === "guest") {
    return { ok: false, code: "forbidden" };
  }
  if (principal.role !== "customer") {
    return { ok: false, code: "forbidden" };
  }
  if (!recordCustomerId || recordCustomerId !== principal.customerUserId) {
    return { ok: false, code: "forbidden" };
  }
  return { ok: true, customerUserId: principal.customerUserId };
}
