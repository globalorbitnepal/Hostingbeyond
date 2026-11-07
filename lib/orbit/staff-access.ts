/**
 * Orbit role policy — server-side only (env + verified session AdminUser.id).
 *
 * See docs/ORBIT-STAFF-ACCESS.md for bootstrap and migration.
 */

/** Reject emails, wildcards, booleans, and role names so they never grant access. */
function isPlausibleAdminId(token: string): boolean {
  if (token.length < 2 || token.length > 128) return false;
  const lower = token.toLowerCase();
  if (
    lower === "true" ||
    lower === "false" ||
    lower === "yes" ||
    lower === "no" ||
    lower === "all" ||
    lower === "any" ||
    lower === "full" ||
    lower === "support" ||
    lower === "admin" ||
    lower === "*"
  ) {
    return false;
  }
  return /^[A-Za-z0-9_-]+$/.test(token);
}

function parseIdList(raw: string | undefined): Set<string> {
  if (!raw?.trim()) return new Set();
  return new Set(
    raw
      .split(/[,\n;]+/)
      .map((s) => s.trim())
      .filter((token) => token.length > 0 && isPlausibleAdminId(token)),
  );
}

function legacyOpenOrbitEnabled(
  env: Record<string, string | undefined>,
): boolean {
  const v = env.ORBIT_LEGACY_OPEN_ORBIT?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export type OrbitAccessMode = "full" | "support_only" | "none";

/**
 * Effective access for an authenticated Orbit admin id.
 * - When both lists empty and legacy flag on: all admins are full (migration only).
 * - When legacy off or either list non-empty: explicit lists; unknown id => none.
 */
export function orbitAccessForAdmin(
  adminId: string,
  env: Record<string, string | undefined> = process.env,
): OrbitAccessMode {
  const support = parseIdList(env.ORBIT_SUPPORT_STAFF_IDS);
  const full = parseIdList(env.ORBIT_FULL_ADMIN_IDS);
  const legacy = legacyOpenOrbitEnabled(env);

  if (full.has(adminId) && support.has(adminId)) {
    return "full";
  }
  if (full.has(adminId)) return "full";
  if (support.has(adminId)) return "support_only";

  if (support.size === 0 && full.size === 0 && legacy) {
    return "full";
  }

  return "none";
}

export function isOrbitFullAdmin(
  adminId: string,
  env?: Record<string, string | undefined>,
): boolean {
  return orbitAccessForAdmin(adminId, env) === "full";
}

export function canOrbitBeyondMasterSupport(
  adminId: string,
  env?: Record<string, string | undefined>,
): boolean {
  const m = orbitAccessForAdmin(adminId, env);
  return m === "full" || m === "support_only";
}
