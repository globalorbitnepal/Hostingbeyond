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
}): Promise<{ saved: boolean; reason?: string }> {
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
  try {
    await prisma.$transaction(async (tx) => {
      await tx.beyondMasterChatThread.upsert({
        where: { id },
        create: {
          id,
          customerUserId: input.customerUserId,
          title: input.title.slice(0, 120) || "New conversation",
        },
        update: {
          title: input.title.slice(0, 120) || "New conversation",
          updatedAt: new Date(),
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
    return { saved: true };
  } catch {
    return { saved: false, reason: "write_failed" };
  }
}

export async function addThreadAttachments(input: {
  threadId: string;
  customerUserId: string | null;
  title: string;
  files: { fileName: string; contentType: string; data: Buffer }[];
}): Promise<{ saved: number; errors: string[] }> {
  const id = input.threadId.trim();
  const errors: string[] = [];
  if (!/^[A-Za-z0-9-]{8,64}$/.test(id)) {
    return { saved: 0, errors: ["Invalid conversation."] };
  }
  if (input.files.length === 0) return { saved: 0, errors: ["No file sent."] };
  const existing = await prisma.beyondMasterChatAttachment.count({
    where: { threadId: id },
  });
  if (existing + input.files.length > MAX_ATTACHMENTS_PER_THREAD) {
    return {
      saved: 0,
      errors: ["This conversation already has the maximum number of files."],
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
        title: input.title.slice(0, 120) || "New conversation",
      },
      update: { updatedAt: new Date() },
    });
    await prisma.beyondMasterChatAttachment.create({
      data: {
        threadId: id,
        fileName: file.fileName.slice(0, 160) || "attachment",
        contentType: file.contentType,
        sizeBytes: file.data.byteLength,
        data: new Uint8Array(file.data),
      },
    });
    saved += 1;
  }
  return { saved, errors };
}

export async function listChatThreads(options?: {
  query?: string;
  limit?: number;
}) {
  const query = options?.query?.trim();
  const rows = await prisma.beyondMasterChatThread.findMany({
    where: query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { id: { contains: query } },
            {
              customer: {
                is: {
                  OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { email: { contains: query, mode: "insensitive" } },
                  ],
                },
              },
            },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    take: Math.min(options?.limit ?? 50, 100),
    select: {
      id: true,
      title: true,
      status: true,
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

export async function readChatThread(id: string) {
  const row = await prisma.beyondMasterChatThread.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      status: true,
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

export async function readChatAttachment(
  threadId: string,
  attachmentId: string,
) {
  const row = await prisma.beyondMasterChatAttachment.findFirst({
    where: { id: attachmentId, threadId },
    select: { fileName: true, contentType: true, data: true },
  });
  if (!row) return null;
  return {
    fileName: row.fileName,
    contentType: row.contentType,
    data: new Uint8Array(row.data),
  };
}
