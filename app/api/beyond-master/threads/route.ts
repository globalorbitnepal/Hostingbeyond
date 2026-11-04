import { saveChatSnapshot } from "@/lib/beyond-master/history/store";
import {
  CUSTOMER_SESSION_COOKIE,
  verifyCustomerJwt,
} from "@/lib/customer/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cookieValue(request: Request, name: string) {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Send valid JSON." }, { status: 400 });
  }
  const body = payload as {
    threadId?: unknown;
    title?: unknown;
    messages?: { role?: unknown; body?: unknown; createdAt?: unknown }[];
  };
  if (typeof body.threadId !== "string" || !Array.isArray(body.messages)) {
    return Response.json({ error: "Invalid conversation." }, { status: 400 });
  }
  const verified = await verifyCustomerJwt(
    cookieValue(request, CUSTOMER_SESSION_COOKIE),
  );
  const messages = body.messages.flatMap<{
    role: "user" | "assistant" | "notice";
    body: string;
    createdAt: string;
  }>((message) => {
    const role =
      message.role === "user" ||
      message.role === "assistant" ||
      message.role === "notice"
        ? message.role
        : null;
    if (!role || typeof message.body !== "string") return [];
    return [
      {
        role,
        body: message.body,
        createdAt:
          typeof message.createdAt === "string"
            ? message.createdAt
            : new Date().toISOString(),
      },
    ];
  });
  const result = await saveChatSnapshot({
    threadId: body.threadId,
    customerUserId: verified?.customerUserId ?? null,
    title: typeof body.title === "string" ? body.title : "New conversation",
    messages,
  });
  return Response.json(result, { status: result.saved ? 200 : 400 });
}

export async function GET() {
  return Response.json({ ok: true });
}
