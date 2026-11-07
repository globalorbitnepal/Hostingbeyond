import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getSessionAdmin, ORBIT_SESSION_COOKIE } from "@/lib/orbit/session";
import {
  canOrbitBeyondMasterSupport,
  isOrbitFullAdmin,
  orbitAccessForAdmin,
} from "@/lib/orbit/staff-access";
import { getOrbitAdminSessionTestOverride } from "@/lib/test/orbit-admin-session-test-control";

export async function requireOrbitAdmin() {
  const override = getOrbitAdminSessionTestOverride();
  const admin = override
    ? await override()
    : await getSessionAdmin((await cookies()).get(ORBIT_SESSION_COOKIE)?.value);
  if (!admin) return null;
  if (orbitAccessForAdmin(admin.id) === "none") return null;
  return admin;
}

/** Super-admin / unrestricted Orbit areas (settings, billing, CMS, …). */
export async function requireOrbitFullAdmin() {
  const admin = await requireOrbitAdmin();
  if (!admin) return null;
  if (!isOrbitFullAdmin(admin.id)) return null;
  return admin;
}

/** Beyond Master human support queue + scoped conversation read (full or support-only staff). */
export async function requireOrbitBeyondMasterSupport() {
  const admin = await requireOrbitAdmin();
  if (!admin) return null;
  if (!canOrbitBeyondMasterSupport(admin.id)) return null;
  return admin;
}

export function unauthorizedJson(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenJson(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}
