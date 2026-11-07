import { z } from "zod";

import {
  assignHumanSupportThread,
  listHumanSupportQueue,
  reassignHumanSupportThread,
  staffReplyOnHumanSupportThread,
} from "@/lib/beyond-master/human-support";
import { supportStaffCanAccessQueuedThread } from "@/lib/beyond-master/history/store";
import { prisma } from "@/lib/prisma";
import {
  forbiddenJson,
  requireOrbitBeyondMasterSupport,
  unauthorizedJson,
} from "@/lib/orbit/api";
import { isOrbitFullAdmin } from "@/lib/orbit/staff-access";
import { logActivity } from "@/lib/orbit/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await requireOrbitBeyondMasterSupport();
  if (!admin) return unauthorizedJson();
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const normalized =
    status === "assigned" || status === "all" ? status : "open";
  const threads = await listHumanSupportQueue({
    status: normalized,
    limit: 80,
    ...(isOrbitFullAdmin(admin.id)
      ? {}
      : { restrictToSupportViewerId: admin.id }),
  });
  return Response.json({
    threads,
    canClaimOpen: isOrbitFullAdmin(admin.id),
  });
}

const postSchema = z.union([
  z.object({
    action: z.literal("assign"),
    threadId: z.string().min(8).max(64),
  }),
  z.object({
    action: z.literal("reassign"),
    threadId: z.string().min(8).max(64),
    toAdminUserId: z.string().min(1),
  }),
  z.object({
    action: z.literal("message"),
    threadId: z.string().min(8).max(64),
    body: z.string().min(1).max(16000),
  }),
  z.object({
    action: z.literal("link_ticket"),
    threadId: z.string().min(8).max(64),
    reference: z.string().regex(/^BM-[0-9]+$/),
  }),
]);

export async function POST(request: Request) {
  const admin = await requireOrbitBeyondMasterSupport();
  if (!admin) return unauthorizedJson();
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "Send valid JSON." }, { status: 400 });
  }
  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const body = parsed.data;
  switch (body.action) {
    case "assign": {
      const result = await assignHumanSupportThread({
        threadId: body.threadId,
        adminUserId: admin.id,
        allowClaimOpen: isOrbitFullAdmin(admin.id),
      });
      if (!result.ok)
        return Response.json({ error: result.reason }, { status: 400 });
      await logActivity({
        adminUserId: admin.id,
        action: "BEYOND_MASTER_SUPPORT_QUEUE",
        resource: body.threadId,
        details: "assign",
      });
      return Response.json({ ok: true });
    }
    case "reassign": {
      if (!isOrbitFullAdmin(admin.id)) return forbiddenJson();
      const target = await prisma.adminUser.findUnique({
        where: { id: body.toAdminUserId },
        select: { id: true },
      });
      if (!target)
        return Response.json({ error: "Unknown staff user." }, { status: 400 });
      const result = await reassignHumanSupportThread({
        threadId: body.threadId,
        adminUserId: target.id,
      });
      if (!result.ok)
        return Response.json({ error: result.reason }, { status: 400 });
      await logActivity({
        adminUserId: admin.id,
        action: "BEYOND_MASTER_SUPPORT_QUEUE",
        resource: body.threadId,
        details: `reassign:${target.id}`,
      });
      return Response.json({ ok: true });
    }
    case "message": {
      const result = await staffReplyOnHumanSupportThread({
        threadId: body.threadId,
        adminUserId: admin.id,
        body: body.body,
        restrictOpenRepliesToFullAdmin: !isOrbitFullAdmin(admin.id),
      });
      if (!result.ok)
        return Response.json({ error: result.reason }, { status: 400 });
      return Response.json({ ok: true });
    }
    case "link_ticket": {
      const ticket = await prisma.beyondMasterTicket.findFirst({
        where: { reference: body.reference },
        select: { reference: true, customerUserId: true },
      });
      if (!ticket)
        return Response.json({ error: "Ticket not found." }, { status: 404 });
      const thread = await prisma.beyondMasterChatThread.findUnique({
        where: { id: body.threadId },
        select: {
          id: true,
          customerUserId: true,
          supportQueueStatus: true,
          supportAssignedAdminId: true,
        },
      });
      if (!thread)
        return Response.json({ error: "Not found." }, { status: 404 });
      if (
        !isOrbitFullAdmin(admin.id) &&
        !supportStaffCanAccessQueuedThread(thread, admin.id)
      ) {
        return forbiddenJson();
      }
      if (
        thread.customerUserId &&
        thread.customerUserId !== ticket.customerUserId
      ) {
        return Response.json(
          { error: "Ticket does not belong to this customer." },
          { status: 403 },
        );
      }
      await prisma.beyondMasterChatThread.update({
        where: { id: body.threadId },
        data: {
          supportTicketReference: ticket.reference,
          updatedAt: new Date(),
        },
      });
      await logActivity({
        adminUserId: admin.id,
        action: "BEYOND_MASTER_SUPPORT_QUEUE",
        resource: body.threadId,
        details: `link:${ticket.reference}`,
      });
      return Response.json({ ok: true });
    }
    default:
      return Response.json({ error: "Unknown action." }, { status: 400 });
  }
}
