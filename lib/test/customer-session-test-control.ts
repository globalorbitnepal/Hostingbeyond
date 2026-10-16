import type { CustomerUser } from "@prisma/client";

type SessionOverride = () => Promise<CustomerUser | null>;

let sessionOverride: SessionOverride | null = null;

function testHooksEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}

/** Test-only. Not reachable from HTTP; setters are only used in `*.integration.test.ts`. */
export function setCustomerSessionTestOverride(fn: SessionOverride | null) {
  if (!testHooksEnabled()) return;
  sessionOverride = fn;
}

export function getCustomerSessionTestOverride(): SessionOverride | null {
  if (!testHooksEnabled()) return null;
  return sessionOverride;
}
