import { adminListDnsAudit } from "@/lib/beyond-master/dns/admin-read";
import { requireOrbitFullAdmin, unauthorizedJson } from "@/lib/orbit/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await requireOrbitFullAdmin();
  if (!admin) return unauthorizedJson();
  return adminListDnsAudit(admin.id, request);
}
