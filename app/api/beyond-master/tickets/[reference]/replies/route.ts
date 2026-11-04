import { postCustomerReply } from "@/lib/beyond-master/tickets/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ reference: string }> };

export async function POST(request: Request, context: Context) {
  const { reference } = await context.params;
  return postCustomerReply(request, decodeURIComponent(reference));
}
