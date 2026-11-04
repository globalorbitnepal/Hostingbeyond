import { adminListTickets } from "@/lib/beyond-master/tickets/http";
import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();
  return adminListTickets(admin.id, request);
}
