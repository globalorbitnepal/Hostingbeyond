import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getSessionAdmin, ORBIT_SESSION_COOKIE } from "@/lib/orbit/session";
import { getOrbitAdminSessionTestOverride } from "@/lib/test/orbit-admin-session-test-control";

export async function requireOrbitAdmin() {
  const override = getOrbitAdminSessionTestOverride();
  if (override) return override();
  const jar = await cookies();
  const token = jar.get(ORBIT_SESSION_COOKIE)?.value;
  const admin = await getSessionAdmin(token);
  if (!admin) return null;
  return admin;
}

export function unauthorizedJson(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenJson(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}
