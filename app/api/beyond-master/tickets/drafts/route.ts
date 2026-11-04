import { postTicketDraft } from "@/lib/beyond-master/tickets/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return postTicketDraft(request);
}
