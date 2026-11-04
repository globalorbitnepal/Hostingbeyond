import { postDnsConfirm } from "@/lib/beyond-master/dns/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return postDnsConfirm(request);
}
