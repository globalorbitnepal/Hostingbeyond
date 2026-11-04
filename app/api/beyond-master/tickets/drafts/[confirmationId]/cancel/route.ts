import { postTicketCancel } from "@/lib/beyond-master/tickets/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ confirmationId: string }> };

export async function POST(request: Request, context: Context) {
  const { confirmationId } = await context.params;
  return postTicketCancel(request, confirmationId);
}
