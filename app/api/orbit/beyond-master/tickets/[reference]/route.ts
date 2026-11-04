import {
  adminGetTicket,
  adminPatchTicket,
} from "@/lib/beyond-master/tickets/http";
import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ reference: string }> };

export async function GET(_request: Request, context: Context) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();
  const { reference } = await context.params;
  return adminGetTicket(admin.id, decodeURIComponent(reference));
}

export async function PATCH(request: Request, context: Context) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();
  const { reference } = await context.params;
  return adminPatchTicket(admin.id, decodeURIComponent(reference), request);
}
