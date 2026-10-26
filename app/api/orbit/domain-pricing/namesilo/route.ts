import { NextResponse } from "next/server";

import {
  applyNameSiloSupplierSync,
  previewNameSiloSupplierSync,
} from "@/lib/domains/namesilo-supplier-sync";
import { authorizeDomainPricingAdmin } from "@/lib/orbit/domain-pricing-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await authorizeDomainPricingAdmin();
  if (admin instanceof Response) return admin;
  const url = new URL(request.url);
  if (url.searchParams.get("action") !== "preview-sync") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
  try {
    const preview = await previewNameSiloSupplierSync();
    return NextResponse.json(preview);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "namesilo_preview_failed";
    const status = message === "namesilo_api_key_missing" ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  const admin = await authorizeDomainPricingAdmin();
  if (admin instanceof Response) return admin;
  const url = new URL(request.url);
  const body = (await request.json().catch(() => ({}))) as {
    confirm?: boolean;
  };
  if (url.searchParams.get("action") !== "apply-supplier-sync") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
  if (!body.confirm) {
    return NextResponse.json(
      {
        error:
          "Preview required. POST with { confirm: true } after reviewing preview-sync.",
      },
      { status: 400 },
    );
  }
  try {
    const result = await applyNameSiloSupplierSync(admin.id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "namesilo_sync_failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
