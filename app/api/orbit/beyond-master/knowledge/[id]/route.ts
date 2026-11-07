import {
  adminGetKnowledge,
  adminUpdateKnowledge,
} from "@/lib/beyond-master/knowledge/manage";
import { requireOrbitFullAdmin, unauthorizedJson } from "@/lib/orbit/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const admin = await requireOrbitFullAdmin();
  if (!admin) return unauthorizedJson();
  const { id } = await context.params;
  return adminGetKnowledge(admin.id, decodeURIComponent(id));
}

export async function PATCH(request: Request, context: Context) {
  const admin = await requireOrbitFullAdmin();
  if (!admin) return unauthorizedJson();
  const { id } = await context.params;
  return adminUpdateKnowledge(admin.id, decodeURIComponent(id), request);
}
