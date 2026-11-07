import {
  generateGuestCapabilityToken,
  guestCapabilityTokenLooksValid,
  hashGuestCapabilityToken,
  safeEqualHex,
} from "@/lib/beyond-master/guest-thread-capability";
import { humanSupportEnqueueBlockedReason } from "@/lib/beyond-master/history/thread-write-policy";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/orbit/session";

export const SUPPORT_QUEUE_OPEN = "open";
export const SUPPORT_QUEUE_ASSIGNED = "assigned";
export const SUPPORT_QUEUE_CLOSED = "closed";

export type HumanSupportQueueRow = {
  threadId: string;
  title: string;
  status: string | null;
  queueStatus: string | null;
  customer: { id: string; name: string | null; email: string } | null;
  assigned: { id: string; displayName: string } | null;
  ticketReference: string | null;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
};

export async function listHumanSupportQueue(options?: {
  status?: "open" | "assigned" | "all";
  limit?: number;
  /** Support-only staff: only unclaimed open items and threads assigned to this admin. */
  restrictToSupportViewerId?: string;
}): Promise<HumanSupportQueueRow[]> {
  const limit = Math.min(options?.limit ?? 50, 100);
  const status = options?.status ?? "open";
  const viewerId = options?.restrictToSupportViewerId;
  const statusWhere =
    status === "all"
      ? { supportQueueStatus: { not: null } }
      : {
          supportQueueStatus:
            status === "open" ? SUPPORT_QUEUE_OPEN : SUPPORT_QUEUE_ASSIGNED,
        };
  const scopeWhere = viewerId
    ? {
        AND: [
          statusWhere,
          {
            OR: [
              {
                supportQueueStatus: SUPPORT_QUEUE_OPEN,
                supportAssignedAdminId: null,
              },
              { supportAssignedAdminId: viewerId },
            ],
          },
        ],
      }
    : null;
  const where = scopeWhere ?? statusWhere;
  const rows = await prisma.beyondMasterChatThread.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      status: true,
      supportQueueStatus: true,
      supportTicketReference: true,
      createdAt: true,
      updatedAt: true,
      customer: { select: { id: true, name: true, email: true } },
      supportAssignedAdmin: {
        select: { id: true, displayName: true },
      },
      _count: { select: { messages: true } },
    },
  });
  return rows.map((row) => ({
    threadId: row.id,
    title: row.title,
    status: row.status,
    queueStatus: row.supportQueueStatus,
    ticketReference: row.supportTicketReference,
    customer: row.customer,
    assigned: row.supportAssignedAdmin,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    messageCount: row._count.messages,
  }));
}

export async function enqueueThreadForHumanSupport(input: {
  threadId: string;
  customerUserId: string | null;
  ticketReference: string | null;
  guestCapabilityToken?: string | null;
}): Promise<
  { ok: true; guestCapabilityToken?: string } | { ok: false; reason: string }
> {
  const id = input.threadId.trim();
  if (!/^[A-Za-z0-9-]{8,64}$/.test(id)) {
    return { ok: false, reason: "bad_thread" };
  }
  try {
    const existing = await prisma.beyondMasterChatThread.findUnique({
      where: { id },
      select: { customerUserId: true, guestKey: true },
    });

    const rawGuestToken = input.guestCapabilityToken?.trim() ?? "";
    let guestKeyMatches = true;
    if (!input.customerUserId && existing?.guestKey) {
      if (!guestCapabilityTokenLooksValid(rawGuestToken)) {
        return { ok: false, reason: "guest_capability_required" };
      }
      const h = hashGuestCapabilityToken(rawGuestToken);
      guestKeyMatches = safeEqualHex(h, existing.guestKey);
    }

    const blocked = humanSupportEnqueueBlockedReason(
      existing,
      input.customerUserId,
      guestKeyMatches,
    );
    if (blocked) return { ok: false, reason: blocked };

    const ticketRef = input.ticketReference?.trim().slice(0, 32) ?? null;

    if (!existing) {
      let guestKey: string | undefined;
      let issuedGuestToken: string | undefined;
      if (!input.customerUserId) {
        if (guestCapabilityTokenLooksValid(rawGuestToken)) {
          guestKey = hashGuestCapabilityToken(rawGuestToken);
        } else {
          issuedGuestToken = generateGuestCapabilityToken();
          guestKey = hashGuestCapabilityToken(issuedGuestToken);
        }
      }
      await prisma.beyondMasterChatThread.create({
        data: {
          id,
          customerUserId: input.customerUserId,
          guestKey,
          title: "Human support",
          supportQueueStatus: SUPPORT_QUEUE_OPEN,
          supportTicketReference: ticketRef,
        },
      });
      return {
        ok: true,
        ...(issuedGuestToken ? { guestCapabilityToken: issuedGuestToken } : {}),
      };
    }

    await prisma.beyondMasterChatThread.update({
      where: { id },
      data: {
        supportQueueStatus: SUPPORT_QUEUE_OPEN,
        supportTicketReference: ticketRef ?? undefined,
        updatedAt: new Date(),
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: "write_failed" };
  }
}

export async function assignHumanSupportThread(input: {
  threadId: string;
  adminUserId: string;
  /** Support-only staff cannot claim an unassigned queue item; full admins can. */
  allowClaimOpen: boolean;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    if (!input.allowClaimOpen) {
      return { ok: false, reason: "claim_forbidden" };
    }
    const row = await prisma.beyondMasterChatThread.updateMany({
      where: {
        id: input.threadId,
        supportQueueStatus: SUPPORT_QUEUE_OPEN,
        supportAssignedAdminId: null,
      },
      data: {
        supportQueueStatus: SUPPORT_QUEUE_ASSIGNED,
        supportAssignedAdminId: input.adminUserId,
        updatedAt: new Date(),
      },
    });
    if (row.count === 0) return { ok: false, reason: "not_open" };
    return { ok: true };
  } catch {
    return { ok: false, reason: "write_failed" };
  }
}

export async function reassignHumanSupportThread(input: {
  threadId: string;
  adminUserId: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    const row = await prisma.beyondMasterChatThread.updateMany({
      where: {
        id: input.threadId,
        supportQueueStatus: SUPPORT_QUEUE_ASSIGNED,
      },
      data: {
        supportAssignedAdminId: input.adminUserId,
        updatedAt: new Date(),
      },
    });
    if (row.count === 0) return { ok: false, reason: "not_assigned" };
    return { ok: true };
  } catch {
    return { ok: false, reason: "write_failed" };
  }
}

export async function staffReplyOnHumanSupportThread(input: {
  threadId: string;
  adminUserId: string;
  body: string;
  /** Support-only staff must assign (claim) an open thread before replying. */
  restrictOpenRepliesToFullAdmin?: boolean;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const body = input.body.trim();
  if (body.length < 1 || body.length > 16_000) {
    return { ok: false, reason: "bad_body" };
  }
  try {
    const thread = await prisma.beyondMasterChatThread.findUnique({
      where: { id: input.threadId },
      select: {
        id: true,
        supportQueueStatus: true,
        supportAssignedAdminId: true,
      },
    });
    if (!thread || !thread.supportQueueStatus) {
      return { ok: false, reason: "not_queued" };
    }
    const isAssignedToOther =
      thread.supportQueueStatus === SUPPORT_QUEUE_ASSIGNED &&
      thread.supportAssignedAdminId &&
      thread.supportAssignedAdminId !== input.adminUserId;
    const isUnclaimedOpen =
      thread.supportQueueStatus === SUPPORT_QUEUE_OPEN &&
      !thread.supportAssignedAdminId;
    if (isAssignedToOther) {
      return { ok: false, reason: "forbidden" };
    }
    if (isUnclaimedOpen && input.restrictOpenRepliesToFullAdmin) {
      return { ok: false, reason: "claim_first" };
    }
    if (isUnclaimedOpen) {
      // Atomic claim: only one staff can win if two reply concurrently on an open row.
      const claimed = await prisma.beyondMasterChatThread.updateMany({
        where: {
          id: input.threadId,
          supportQueueStatus: SUPPORT_QUEUE_OPEN,
          supportAssignedAdminId: null,
        },
        data: {
          supportAssignedAdminId: input.adminUserId,
          supportQueueStatus: SUPPORT_QUEUE_ASSIGNED,
          updatedAt: new Date(),
        },
      });
      if (claimed.count === 0) {
        return { ok: false, reason: "not_open" };
      }
    }
    await prisma.$transaction(async (tx) => {
      await tx.beyondMasterChatMessage.create({
        data: {
          threadId: input.threadId,
          role: "notice",
          body: `[staff] ${body}`,
        },
      });
      await tx.beyondMasterChatThread.update({
        where: { id: input.threadId },
        data: { updatedAt: new Date() },
      });
    });
    await logActivity({
      adminUserId: input.adminUserId,
      action: "BEYOND_MASTER_SUPPORT_MESSAGE",
      resource: input.threadId,
      details: `len=${body.length}`,
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: "write_failed" };
  }
}
