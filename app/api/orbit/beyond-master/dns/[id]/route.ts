import { adminGetDns } from "@/lib/beyond-master/dns/admin-read";
import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();
  const { id } = await context.params;
  return adminGetDns(admin.id, decodeURIComponent(id));
}
