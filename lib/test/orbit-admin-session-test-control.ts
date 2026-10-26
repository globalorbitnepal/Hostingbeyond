import type { AdminUser } from "@prisma/client";

type SessionOverride = () => Promise<AdminUser | null>;

let sessionOverride: SessionOverride | null = null;

function testHooksEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}

/** Test-only. Used from route `*.test.ts` to avoid Next `cookies()` in node:test. */
export function setOrbitAdminSessionTestOverride(fn: SessionOverride | null) {
  if (!testHooksEnabled()) return;
  sessionOverride = fn;
}

export function getOrbitAdminSessionTestOverride(): SessionOverride | null {
  if (!testHooksEnabled()) return null;
  return sessionOverride;
}
