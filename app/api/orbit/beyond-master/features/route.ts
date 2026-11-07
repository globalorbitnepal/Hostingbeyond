import { NextResponse } from "next/server";

import {
  commerceCapabilitySnapshot,
  OPERATOR_FEATURE_KEYS,
  operatorFeatureLabel,
  readOperatorFeatures,
  writeOperatorFeatures,
  type OperatorFeatureKey,
} from "@/lib/beyond-master/operator-features";
import { crossOriginBrowserMutationBlocked } from "@/lib/http/same-origin-mutation";
import {
  forbiddenJson,
  requireOrbitFullAdmin,
  unauthorizedJson,
} from "@/lib/orbit/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireOrbitFullAdmin();
  if (!admin) return unauthorizedJson();
  const features = await readOperatorFeatures();
  return NextResponse.json(
    {
      features,
      labels: Object.fromEntries(
        OPERATOR_FEATURE_KEYS.map((key) => [key, operatorFeatureLabel(key)]),
      ),
      commerce: commerceCapabilitySnapshot(),
      commerceNote:
        "Purchases, DNS writes, and provisioning stay off unless both server env gates are enabled. This screen cannot turn those on.",
    },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function PATCH(request: Request) {
  const admin = await requireOrbitFullAdmin();
  if (!admin) return unauthorizedJson();
  if (crossOriginBrowserMutationBlocked(request)) {
    return forbiddenJson("Cross-origin request blocked.");
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send valid JSON." }, { status: 400 });
  }
  const patch: Partial<Record<OperatorFeatureKey, boolean>> = {};
  const source =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  for (const key of OPERATOR_FEATURE_KEYS) {
    if (typeof source[key] === "boolean") patch[key] = source[key];
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "No feature flags were provided." },
      { status: 400 },
    );
  }
  const features = await writeOperatorFeatures(patch);
  return NextResponse.json({ features });
}
