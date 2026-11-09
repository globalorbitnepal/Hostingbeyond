import { prisma } from "@/lib/prisma";

import { requestIp, resolveRequestCountry } from "./request-country";

type CustomerRequestContext = {
  headers: Headers;
  cookies?: { get(name: string): { value: string } | undefined };
};

/**
 * Records a customer sign-in so Orbit can show country, IP, and device.
 *
 * `ActivityLog.adminUserId` stays null (this is a customer event) and the
 * customer is referenced through `resource` — no schema change required.
 */
export async function recordCustomerSignInActivity(input: {
  userId: string;
  email?: string;
  method: string;
  request: CustomerRequestContext;
}) {
  const country = resolveRequestCountry(input.request);
  const ip = requestIp(input.request);
  try {
    await prisma.activityLog.create({
      data: {
        action: "LOGIN",
        resource: `CustomerUser:${input.userId}`,
        details: JSON.stringify({
          email: input.email ?? null,
          method: input.method,
          country,
          ip,
          userAgent: input.request.headers.get("user-agent") ?? null,
        }),
      },
    });
  } catch {
    // Never block a sign-in on audit logging.
  }
}

export type CustomerSignInInfo = {
  country: string | null;
  ip: string | null;
  method: string | null;
  at: string | null;
};

/** Latest recorded sign-in per customer, keyed by customer id. */
export async function latestSignInByUserId(
  userIds: string[],
): Promise<Map<string, CustomerSignInInfo>> {
  const map = new Map<string, CustomerSignInInfo>();
  if (userIds.length === 0) return map;

  const rows = await prisma.activityLog.findMany({
    where: {
      action: "LOGIN",
      resource: { in: userIds.map((id) => `CustomerUser:${id}`) },
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(1000, Math.max(120, userIds.length * 4)),
    select: { resource: true, details: true, createdAt: true },
  });

  for (const row of rows) {
    const userId = row.resource?.replace("CustomerUser:", "");
    if (!userId || map.has(userId)) continue;
    let parsed: Record<string, unknown> = {};
    try {
      parsed = row.details
        ? (JSON.parse(row.details) as Record<string, unknown>)
        : {};
    } catch {
      parsed = {};
    }
    map.set(userId, {
      country: typeof parsed.country === "string" ? parsed.country : null,
      ip: typeof parsed.ip === "string" ? parsed.ip : null,
      method: typeof parsed.method === "string" ? parsed.method : null,
      at: row.createdAt.toISOString(),
    });
  }
  return map;
}
