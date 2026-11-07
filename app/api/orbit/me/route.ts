import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import { orbitCustomerDirectoryStats } from "@/lib/orbit/customer-directory";
import { orbitAccessForAdmin } from "@/lib/orbit/staff-access";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const access = orbitAccessForAdmin(admin.id);
  if (access === "none") {
    return NextResponse.json(
      { error: "Orbit access is not configured for this account." },
      { status: 403 },
    );
  }
  if (access === "support_only") {
    return NextResponse.json({
      admin: { id: admin.id, displayName: admin.displayName },
      orbitAccess: access,
      stats: {
        credentials: 0,
        media: 0,
        pages: 0,
        totalCustomers: 0,
        googleSignups: 0,
      },
      recentActivity: [],
    });
  }

  const [
    credentialCount,
    mediaCount,
    pageCount,
    recentActivity,
    customerStats,
  ] = await Promise.all([
    prisma.webAuthnCredential.count(),
    prisma.mediaAsset.count().catch(() => 0),
    prisma.pageContent.count().catch(() => 0),
    prisma.activityLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    orbitCustomerDirectoryStats(),
  ]);

  return NextResponse.json({
    admin: { id: admin.id, displayName: admin.displayName },
    orbitAccess: access,
    stats: {
      credentials: credentialCount,
      media: mediaCount,
      pages: pageCount || 1,
      totalCustomers: customerStats.totalCustomers,
      googleSignups: customerStats.oauthByProvider.google ?? 0,
    },
    recentActivity,
  });
}
