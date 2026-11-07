import { Prisma } from "@prisma/client";

import {
  generateGuestCapabilityToken,
  guestCapabilityTokenLooksValid,
  hashGuestCapabilityToken,
  safeEqualHex,
} from "@/lib/beyond-master/guest-thread-capability";
import { threadWriteBlockedReason } from "@/lib/beyond-master/history/thread-write-policy";
import { prisma } from "@/lib/prisma";

export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
export const MAX_ATTACHMENTS_PER_THREAD = 5;

export const ALLOWED_ATTACHMENT_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "text/csv",
]);

export type ChatSnapshotMessage = {
  role: "user" | "assistant" | "notice";
  body: string;
  createdAt: string;
};

export function attachmentTypeAllowed(contentType: string) {
  return ALLOWED_ATTACHMENT_TYPES.has(contentType.split(";")[0]!.trim());
}

export async function saveChatSnapshot(input: {
  threadId: string;
  customerUserId: string | null;
  title: string;
  messages: ChatSnapshotMessage[];
  supportTicketReference?: string | null;
  /** Required for guest threads: proves possession of the server-issued capability. */
  guestCapabilityToken?: string | null;
}): Promise<{
  saved: boolean;
  reason?: string;
  guestCapabilityToken?: string;
}> {
  const id = input.threadId.trim();
  if (!/^[A-Za-z0-9-]{8,64}$/.test(id))
    return { saved: false, reason: "bad_id" };
  const messages = input.messages
    .filter((message) => message.body.trim().length > 0)
    .slice(-60)
    .map((message) => ({
      role: message.role,
      body: message.body.slice(0, 16_000),
      createdAt: new Date(message.createdAt),
    }));
  if (messages.length === 0) return { saved: false, reason: "empty" };

  const existing = await prisma.beyondMasterChatThread.findUnique({
    where: { id },
    select: { customerUserId: true, guestKey: true },
  });

  const rawGuestToken = input.guestCapabilityToken?.trim() ?? "";
  let guestTokenOut: string | undefined;
  let guestKeyHashForWrite: string | undefined;

  if (!input.customerUserId) {
    if (existing?.guestKey) {
      if (!guestCapabilityTokenLooksValid(rawGuestToken)) {
        return { saved: false, reason: "guest_capability_required" };
      }
      guestKeyHashForWrite = hashGuestCapabilityToken(rawGuestToken);
      guestTokenOut = rawGuestToken;
      if (!safeEqualHex(guestKeyHashForWrite, existing.guestKey)) {
        return { saved: false, reason: "forbidden" };
      }
    } else {
      if (guestCapabilityTokenLooksValid(rawGuestToken)) {
        guestKeyHashForWrite = hashGuestCapabilityToken(rawGuestToken);
        guestTokenOut = rawGuestToken;
      } else {
        const issued = generateGuestCapabilityToken();
        guestKeyHashForWrite = hashGuestCapabilityToken(issued);
        guestTokenOut = issued;
      }
    }
  }

  const guestKeyMatches = input.customerUserId
    ? true
    : Boolean(
        guestKeyHashForWrite &&
        (!existing?.guestKey ||
          safeEqualHex(guestKeyHashForWrite, existing.guestKey)),
      );

  const blocked = threadWriteBlockedReason(
    existing,
    input.customerUserId,
    guestKeyMatches,
  );
  if (blocked) {
    return { saved: false, reason: blocked };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const ticketRef = input.supportTicketReference?.trim().slice(0, 32);
      await tx.beyondMasterChatThread.upsert({
        where: { id },
        create: {
          id,
          customerUserId: input.customerUserId,
          guestKey:
            !input.customerUserId && guestKeyHashForWrite
              ? guestKeyHashForWrite
              : undefined,
          title: input.title.slice(0, 120) || "New conversation",
          ...(ticketRef ? { supportTicketReference: ticketRef } : {}),
        },
        update: {
          title: input.title.slice(0, 120) || "New conversation",
          updatedAt: new Date(),
          ...(ticketRef ? { supportTicketReference: ticketRef } : {}),
          ...(!input.customerUserId &&
          guestKeyHashForWrite &&
          !existing?.guestKey
            ? { guestKey: guestKeyHashForWrite }
            : {}),
        },
      });
      await tx.beyondMasterChatMessage.deleteMany({ where: { threadId: id } });
      await tx.beyondMasterChatMessage.createMany({
        data: messages.map((message) => ({
          threadId: id,
          role: message.role,
          body: message.body,
          createdAt: Number.isNaN(message.createdAt.getTime())
            ? new Date()
            : message.createdAt,
        })),
      });
    });
    return {
      saved: true,
      ...(guestTokenOut ? { guestCapabilityToken: guestTokenOut } : {}),
    };
  } catch {
    return { saved: false, reason: "write_failed" };
  }
}

export async function addThreadAttachments(input: {
  threadId: string;
  customerUserId: string | null;
  title: string;
  files: { fileName: string; contentType: string; data: Buffer }[];
  guestCapabilityToken?: string | null;
}): Promise<{
  saved: number;
  errors: string[];
  files: { id: string; fileName: string; sizeBytes: number }[];
}> {
  const id = input.threadId.trim();
  const errors: string[] = [];
  const stored: { id: string; fileName: string; sizeBytes: number }[] = [];
  if (!/^[A-Za-z0-9-]{8,64}$/.test(id)) {
    return { saved: 0, errors: ["Invalid conversation."], files: [] };
  }

  const existing = await prisma.beyondMasterChatThread.findUnique({
    where: { id },
    select: { customerUserId: true, guestKey: true },
  });

  const rawGuestToken = input.guestCapabilityToken?.trim() ?? "";
  let guestKeyHashForWrite: string | undefined;

  if (!input.customerUserId) {
    if (existing?.guestKey) {
      if (!guestCapabilityTokenLooksValid(rawGuestToken)) {
        return {
          saved: 0,
          errors: ["Guest capability token required."],
          files: [],
        };
      }
      guestKeyHashForWrite = hashGuestCapabilityToken(rawGuestToken);
      if (!safeEqualHex(guestKeyHashForWrite, existing.guestKey)) {
        return {
          saved: 0,
          errors: ["You do not have access to this conversation."],
          files: [],
        };
      }
    } else {
      if (guestCapabilityTokenLooksValid(rawGuestToken)) {
        guestKeyHashForWrite = hashGuestCapabilityToken(rawGuestToken);
      } else {
        const issued = generateGuestCapabilityToken();
        guestKeyHashForWrite = hashGuestCapabilityToken(issued);
      }
    }
  }

  const guestKeyMatches = input.customerUserId
    ? true
    : Boolean(
        guestKeyHashForWrite &&
        (!existing?.guestKey ||
          safeEqualHex(guestKeyHashForWrite, existing.guestKey)),
      );

  const blocked = threadWriteBlockedReason(
    existing,
    input.customerUserId,
    guestKeyMatches,
  );
  if (blocked) {
    return {
      saved: 0,
      errors: ["You do not have access to this conversation."],
      files: [],
    };
  }

  if (input.files.length === 0)
    return { saved: 0, errors: ["No file sent."], files: [] };
  const attachmentCount = await prisma.beyondMasterChatAttachment.count({
    where: { threadId: id },
  });
  if (attachmentCount + input.files.length > MAX_ATTACHMENTS_PER_THREAD) {
    return {
      saved: 0,
      errors: ["This conversation already has the maximum number of files."],
      files: [],
    };
  }
  let saved = 0;
  for (const file of input.files) {
    if (file.data.byteLength === 0) {
      errors.push(`${file.fileName}: empty file.`);
      continue;
    }
    if (file.data.byteLength > MAX_ATTACHMENT_BYTES) {
      errors.push(`${file.fileName}: larger than 5 MB.`);
      continue;
    }
    if (!attachmentTypeAllowed(file.contentType)) {
      errors.push(`${file.fileName}: unsupported file type.`);
      continue;
    }
    await prisma.beyondMasterChatThread.upsert({
      where: { id },
      create: {
        id,
        customerUserId: input.customerUserId,
        guestKey:
          !input.customerUserId && guestKeyHashForWrite
            ? guestKeyHashForWrite
            : undefined,
        title: input.title.slice(0, 120) || "New conversation",
      },
      update: {
        updatedAt: new Date(),
        ...(!input.customerUserId && guestKeyHashForWrite && !existing?.guestKey
          ? { guestKey: guestKeyHashForWrite }
          : {}),
      },
    });
    const created = await prisma.beyondMasterChatAttachment.create({
      data: {
        threadId: id,
        fileName: file.fileName.slice(0, 160) || "attachment",
        contentType: file.contentType,
        sizeBytes: file.data.byteLength,
        data: new Uint8Array(file.data),
      },
      select: { id: true, fileName: true, sizeBytes: true },
    });
    stored.push(created);
    saved += 1;
  }
  return { saved, errors, files: stored };
}

/** Threads visible to support-only staff (human queue + claimable open rows). */
export function supportStaffThreadWhere(
  adminUserId: string,
): Prisma.BeyondMasterChatThreadWhereInput {
  return {
    supportQueueStatus: { not: null },
    OR: [
      { supportAssignedAdminId: adminUserId },
      {
        supportQueueStatus: "open",
        supportAssignedAdminId: null,
      },
    ],
  };
}

/** Unclaimed queue item or thread already assigned to this staff member. */
export function supportStaffCanAccessQueuedThread(
  row: {
    supportQueueStatus: string | null;
    supportAssignedAdminId: string | null;
  },
  staffId: string,
): boolean {
  if (!row.supportQueueStatus) return false;
  if (row.supportAssignedAdminId === staffId) return true;
  return (
    row.supportQueueStatus === "open" && row.supportAssignedAdminId === null
  );
}

export async function listChatThreads(options?: {
  query?: string;
  limit?: number;
  /** When set, only human-support threads this staff may view (not full Orbit list). */
  supportStaffId?: string;
}) {
  const query = options?.query?.trim();
  const supportScope = options?.supportStaffId
    ? supportStaffThreadWhere(options.supportStaffId)
    : null;
  const searchClause: Prisma.BeyondMasterChatThreadWhereInput | null = query
    ? {
        OR: [
          {
            title: {
              contains: query,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          { id: { contains: query } },
          {
            customer: {
              is: {
                OR: [
                  {
                    name: {
                      contains: query,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                  {
                    email: {
                      contains: query,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                ],
              },
            },
          },
        ],
      }
    : null;
  const where: Prisma.BeyondMasterChatThreadWhereInput | undefined =
    supportScope && searchClause
      ? { AND: [supportScope, searchClause] }
      : (supportScope ?? searchClause ?? undefined);
  const rows = await prisma.beyondMasterChatThread.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: Math.min(options?.limit ?? 50, 100),
    select: {
      id: true,
      title: true,
      status: true,
      supportQueueStatus: true,
      supportTicketReference: true,
      createdAt: true,
      updatedAt: true,
      customer: { select: { id: true, name: true, email: true } },
      _count: { select: { messages: true, attachments: true } },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    supportQueueStatus: row.supportQueueStatus,
    supportTicketReference: row.supportTicketReference,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    customer: row.customer
      ? {
          id: row.customer.id,
          name: row.customer.name,
          email: row.customer.email,
        }
      : null,
    messageCount: row._count.messages,
    attachmentCount: row._count.attachments,
  }));
}

export async function readCustomerChatThread(
  id: string,
  customerUserId: string,
) {
  const row = await prisma.beyondMasterChatThread.findFirst({
    where: { id, customerUserId },
    select: {
      id: true,
      title: true,
      status: true,
      supportQueueStatus: true,
      supportTicketReference: true,
      createdAt: true,
      updatedAt: true,
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, body: true, createdAt: true },
      },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    supportQueueStatus: row.supportQueueStatus,
    supportTicketReference: row.supportTicketReference,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    messages: row.messages.map((message) => ({
      ...message,
      createdAt: message.createdAt.toISOString(),
    })),
  };
}

export async function readGuestChatThread(
  id: string,
  guestCapabilityToken: string,
) {
  if (!guestCapabilityTokenLooksValid(guestCapabilityToken)) return null;
  const hash = hashGuestCapabilityToken(guestCapabilityToken);
  const row = await prisma.beyondMasterChatThread.findFirst({
    where: {
      id,
      customerUserId: null,
      guestKey: hash,
    },
    select: {
      id: true,
      title: true,
      status: true,
      supportQueueStatus: true,
      supportTicketReference: true,
      createdAt: true,
      updatedAt: true,
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, body: true, createdAt: true },
      },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    supportQueueStatus: row.supportQueueStatus,
    supportTicketReference: row.supportTicketReference,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    messages: row.messages.map((message) => ({
      ...message,
      createdAt: message.createdAt.toISOString(),
    })),
  };
}

export async function readChatThread(
  id: string,
  options?: { supportStaffId: string },
) {
  const where: Prisma.BeyondMasterChatThreadWhereInput = options?.supportStaffId
    ? { AND: [{ id }, supportStaffThreadWhere(options.supportStaffId)] }
    : { id };
  const row = await prisma.beyondMasterChatThread.findFirst({
    where,
    select: {
      id: true,
      title: true,
      status: true,
      supportQueueStatus: true,
      supportTicketReference: true,
      supportAssignedAdmin: { select: { id: true, displayName: true } },
      createdAt: true,
      updatedAt: true,
      customer: { select: { id: true, name: true, email: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, body: true, createdAt: true },
      },
      attachments: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          fileName: true,
          contentType: true,
          sizeBytes: true,
          createdAt: true,
        },
      },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    supportQueueStatus: row.supportQueueStatus,
    supportTicketReference: row.supportTicketReference,
    assignedStaff: row.supportAssignedAdmin
      ? {
          id: row.supportAssignedAdmin.id,
          displayName: row.supportAssignedAdmin.displayName,
        }
      : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    customer: row.customer
      ? {
          id: row.customer.id,
          name: row.customer.name,
          email: row.customer.email,
        }
      : null,
    messages: row.messages.map((message) => ({
      ...message,
      createdAt: message.createdAt.toISOString(),
    })),
    attachments: row.attachments.map((file) => ({
      ...file,
      createdAt: file.createdAt.toISOString(),
    })),
  };
}

export async function deleteChatThread(id: string) {
  const deleted = await prisma.beyondMasterChatThread.deleteMany({
    where: { id },
  });
  return deleted.count > 0;
}

/** Where clause for attachment fetch — unit-tested for support scope nesting. */
export function readChatAttachmentWhere(
  threadId: string,
  attachmentId: string,
  options?: { supportStaffId: string },
): Prisma.BeyondMasterChatAttachmentWhereInput {
  return {
    id: attachmentId,
    threadId,
    ...(options?.supportStaffId
      ? { thread: supportStaffThreadWhere(options.supportStaffId) }
      : {}),
  };
}

export async function readChatAttachment(
  threadId: string,
  attachmentId: string,
  options?: { supportStaffId: string },
) {
  const row = await prisma.beyondMasterChatAttachment.findFirst({
    where: readChatAttachmentWhere(threadId, attachmentId, options),
    select: { fileName: true, contentType: true, data: true },
  });
  if (!row) return null;
  return {
    fileName: row.fileName,
    contentType: row.contentType,
    data: new Uint8Array(row.data),
  };
}
