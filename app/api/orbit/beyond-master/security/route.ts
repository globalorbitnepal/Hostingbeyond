import { adminSecurityAudit } from "@/lib/beyond-master/security-audit";
import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();
  return adminSecurityAudit(admin.id, request);
}
