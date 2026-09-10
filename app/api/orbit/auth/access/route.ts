import { NextRequest, NextResponse } from "next/server";

import {
  createAdminSession,
  createJwtOnlySession,
  ensureOrbitAdmin,
  getEnrollmentSecret,
  logActivity,
  ORBIT_SESSION_COOKIE,
  SESSION_TTL_MS,
  verifyEnrollmentSecret,
} from "@/lib/orbit/session";

export const runtime = "nodejs";

/**
 * Orbit access via server enrollment secret (ORBIT_ENROLLMENT_SECRET).
 * Primary gate for Super Admin — verified server-side only.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { accessKey?: string };
    const accessKey = body.accessKey?.trim() ?? "";

    if (!getEnrollmentSecret()) {
      console.error("[orbit] ORBIT_ENROLLMENT_SECRET is not loaded");
      return NextResponse.json(
        { error: "Orbit access is not configured on the server" },
        { status: 503 },
      );
    }

    if (!verifyEnrollmentSecret(accessKey)) {
      await logActivity({
        action: "LOGIN_FAILED",
        resource: "access-key",
        details: "Invalid Orbit access key",
      }).catch(() => undefined);
      return NextResponse.json(
        { error: "Invalid access key" },
        { status: 401 },
      );
    }

    let session: { token: string; expiresAt: Date };
    let adminId = "orbit-super-admin";

    try {
      const admin = await ensureOrbitAdmin();
      adminId = admin.id;
      session = await createAdminSession(admin.id, {
        userAgent: request.headers.get("user-agent"),
        ipAddress:
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          undefined,
      });
      await logActivity({
        adminUserId: admin.id,
        action: "LOGIN",
        resource: "session",
        details: "Access key login",
      });
    } catch (dbError) {
      console.error("[orbit] DB session unavailable, using JWT-only", dbError);
      session = await createJwtOnlySession();
    }

    const response = NextResponse.json({
      ok: true,
      admin: { id: adminId, displayName: "Super Admin" },
    });

    response.cookies.set(ORBIT_SESSION_COOKIE, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: session.expiresAt,
      maxAge: Math.floor(SESSION_TTL_MS / 1000),
    });

    return response;
  } catch (error) {
    console.error("[orbit] access login", error);
    return NextResponse.json(
      { error: "Unable to open Orbit" },
      { status: 500 },
    );
  }
}
