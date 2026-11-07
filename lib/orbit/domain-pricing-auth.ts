import { NextResponse } from "next/server";

import { requireOrbitFullAdmin } from "@/lib/orbit/api";

export type OrbitPricingAdmin = NonNullable<
  Awaited<ReturnType<typeof requireOrbitFullAdmin>>
>;

export function pricingUnauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** Shared guard for domain-pricing route handlers (testable with injected loader). */
export async function authorizeDomainPricingAdmin(
  loader: () => Promise<OrbitPricingAdmin | null> = requireOrbitFullAdmin,
): Promise<OrbitPricingAdmin | Response> {
  const admin = await loader();
  if (!admin) return pricingUnauthorizedResponse();
  return admin;
}
