import { prisma } from "@/lib/prisma";
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
  const verified = await verifyCustomerJwt(
    cookieValue(request, CUSTOMER_SESSION_COOKIE),
  );
  if (!verified)
    return Response.json({ error: "Sign in to reply." }, { status: 401 });
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Send valid JSON." }, { status: 400 });
  }
  const body = payload as { threadId?: unknown; body?: unknown };
  const threadId =
    typeof body.threadId === "string" ? body.threadId.trim() : "";
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (
    !/^[A-Za-z0-9-]{8,64}$/.test(threadId) ||
    text.length < 1 ||
    text.length > 16_000
  ) {
    return Response.json({ error: "Invalid message." }, { status: 400 });
  }
  const owns = await prisma.beyondMasterChatThread.findFirst({
    where: { id: threadId, customerUserId: verified.customerUserId },
    select: { id: true },
  });
  if (!owns) return Response.json({ error: "Not found." }, { status: 404 });
  await prisma.$transaction([
    prisma.beyondMasterChatMessage.create({
      data: { threadId, role: "user", body: text },
    }),
    prisma.beyondMasterChatThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    }),
  ]);
  return Response.json({ ok: true });
}
