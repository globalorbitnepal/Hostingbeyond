import {
  adminCreateKnowledge,
  adminListKnowledge,
} from "@/lib/beyond-master/knowledge/manage";
import { requireOrbitFullAdmin, unauthorizedJson } from "@/lib/orbit/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await requireOrbitFullAdmin();
  if (!admin) return unauthorizedJson();
  return adminListKnowledge(admin.id, request);
}

export async function POST(request: Request) {
  const admin = await requireOrbitFullAdmin();
  if (!admin) return unauthorizedJson();
  return adminCreateKnowledge(admin.id, request);
}
