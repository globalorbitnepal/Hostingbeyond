import { adminReply } from "@/lib/beyond-master/tickets/http";
import { requireOrbitFullAdmin, unauthorizedJson } from "@/lib/orbit/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ reference: string }> };

export async function POST(request: Request, context: Context) {
  const admin = await requireOrbitFullAdmin();
  if (!admin) return unauthorizedJson();
  const { reference } = await context.params;
  return adminReply(admin.id, decodeURIComponent(reference), request);
}
