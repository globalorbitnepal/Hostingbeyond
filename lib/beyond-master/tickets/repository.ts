import { Prisma } from "@prisma/client";

import { recordTicketNotification } from "@/lib/beyond-master/tickets/notify";
import {
  createMemoryTicketRepository,
  type TicketFailure,
  type TicketRepository,
} from "@/lib/beyond-master/tickets/memory";
import type {
  AdminQueueInput,
  AdminTicketCounts,
  AdminTicketListItem,
  AdminTicketView,
  CustomerTicketMessage,
  CustomerTicketView,
  NotificationRecord,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/lib/beyond-master/tickets/types";
import { TICKET_STATUSES } from "@/lib/beyond-master/tickets/types";
import {
  newPublicId,
  ticketReference,
} from "@/lib/beyond-master/tickets/validate";
import { prisma } from "@/lib/prisma";

const UNAVAILABLE: TicketFailure = {
  ok: false,
  status: 503,
  code: "tickets_unavailable",
  error:
    "Support tickets could not be saved. Email hello@hostingbeyond.com and do not assume a ticket exists.",
};

function asFailure(error: unknown): TicketFailure {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2021" || error.code === "P2022")
  ) {
    return UNAVAILABLE;
  }
  return {
    ok: false,
    status: 503,
    code: "database",
    error: "Support tickets could not be saved. Nothing was confirmed.",
  };
}

function customerView(ticket: {
  reference: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  domainName: string | null;
  serviceLabel: string | null;
  handoff: boolean;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  notification: unknown;
  messages: {
    publicId: string;
    authorType: string;
    visibility: string;
    body: string;
    createdAt: Date;
  }[];
}): CustomerTicketView {
  const notification = notificationOf(ticket.notification);
  return {
    reference: ticket.reference,
    subject: ticket.subject,
    description: ticket.description,
    category: ticket.category as TicketCategory,
    priority: ticket.priority as TicketPriority,
    status: ticket.status as TicketStatus,
    domainName: ticket.domainName,
    serviceLabel: ticket.serviceLabel,
    handoff: ticket.handoff,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    resolvedAt: ticket.resolvedAt?.toISOString() ?? null,
    notification,
    messages: ticket.messages
      .filter((message) => message.visibility === "customer")
      .map(publicMessage),
  };
}

function publicMessage(message: {
  publicId: string;
  authorType: string;
  body: string;
  createdAt: Date;
}): CustomerTicketMessage {
  const authorType =
    message.authorType === "support" || message.authorType === "system"
      ? message.authorType
      : "customer";
  return {
    publicId: message.publicId,
    authorType,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
  };
}

function notificationOf(value: unknown): NotificationRecord {
  const record =
    value && typeof value === "object" ? (value as NotificationRecord) : null;
  return {
    customerDelivered: false,
    supportDelivered: false,
    customerReason: record?.customerReason ?? "not_recorded",
    supportReason: record?.supportReason ?? "not_recorded",
  };
}

async function ownedDomain(
  customerUserId: string,
  domainId: string | null,
  domainName: string | null,
) {
  if (!domainId) return { ok: true as const, domainId: null, domainName };
  const row = await prisma.domainRegistration.findFirst({
    where: { id: domainId, userId: customerUserId },
    select: { id: true, domain: true },
  });
  if (!row) return { ok: false as const };
  return { ok: true as const, domainId: row.id, domainName: row.domain };
}

async function ownedService(
  customerUserId: string,
  serviceId: string | null,
  serviceLabel: string | null,
) {
  if (!serviceId) return { ok: true as const, serviceId: null, serviceLabel };
  const row = await prisma.hostingOrder.findFirst({
    where: { id: serviceId, userId: customerUserId },
    select: { id: true, productSlug: true },
  });
  if (!row) return { ok: false as const };
  return {
    ok: true as const,
    serviceId: row.id,
    serviceLabel: serviceLabel ?? row.productSlug,
  };
}

export const prismaTicketRepository: TicketRepository = {
  async prepareDraft({ customerUserId, draft, idempotencyKey, now }) {
    try {
      const domain = await ownedDomain(
        customerUserId,
        draft.domainId,
        draft.domainName,
      );
      if (!domain.ok) {
        return {
          ok: false,
          status: 403,
          code: "ownership",
          error: "That domain is not on this account.",
        };
      }
      const service = await ownedService(
        customerUserId,
        draft.serviceId,
        draft.serviceLabel,
      );
      if (!service.ok) {
        return {
          ok: false,
          status: 403,
          code: "ownership",
          error: "That service is not on this account.",
        };
      }
      const existing = await prisma.beyondMasterTicketDraft.findUnique({
        where: { idempotencyKey },
      });
      if (existing && existing.customerUserId === customerUserId) {
        return {
          ok: true,
          draft: {
            ...draft,
            domainName: existing.domainName,
            domainId: existing.domainId,
            serviceId: existing.serviceId,
            serviceLabel: existing.serviceLabel,
            confirmationId: existing.confirmationId,
            customerUserId,
            idempotencyKey,
            status: existing.status as "pending" | "submitted" | "cancelled",
            expiresAt: existing.expiresAt.toISOString(),
            ticketReference: existing.ticketReference,
          },
        };
      }
      const created = await prisma.beyondMasterTicketDraft.create({
        data: {
          confirmationId: `cfm_${crypto.randomUUID().replace(/-/g, "")}`,
          customerUserId,
          idempotencyKey,
          category: draft.category,
          priority: draft.priority,
          subject: draft.subject,
          description: draft.description,
          domainName: domain.domainName,
          domainId: domain.domainId,
          serviceId: service.serviceId,
          serviceLabel: service.serviceLabel,
          handoff: draft.handoff,
          contextNote: draft.contextNote,
          status: "pending",
          expiresAt: new Date(now.getTime() + 30 * 60 * 1000),
        },
      });
      return {
        ok: true,
        draft: {
          ...draft,
          domainName: created.domainName,
          domainId: created.domainId,
          serviceId: created.serviceId,
          serviceLabel: created.serviceLabel,
          confirmationId: created.confirmationId,
          customerUserId,
          idempotencyKey,
          status: "pending",
          expiresAt: created.expiresAt.toISOString(),
          ticketReference: null,
        },
      };
    } catch (error) {
      return asFailure(error);
    }
  },
  async cancelDraft({ customerUserId, confirmationId }) {
    try {
      const updated = await prisma.beyondMasterTicketDraft.updateMany({
        where: { confirmationId, customerUserId, status: "pending" },
        data: { status: "cancelled" },
      });
      if (updated.count === 1) return { ok: true, cancelled: true };
      const existing = await prisma.beyondMasterTicketDraft.findFirst({
        where: { confirmationId, customerUserId },
      });
      if (!existing)
        return {
          ok: false,
          status: 404,
          code: "not_found",
          error: "That support request was not found.",
        };
      if (existing.status === "submitted") {
        return {
          ok: false,
          status: 409,
          code: "already_submitted",
          error: "This request was already submitted.",
        };
      }
      return { ok: true, cancelled: true };
    } catch (error) {
      return asFailure(error);
    }
  },
  async submitDraft({ customerUserId, confirmationId, now, customerEmail }) {
    try {
      const existingTicket = await prisma.beyondMasterTicket.findUnique({
        where: { idempotencyKey: confirmationId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
      if (existingTicket && existingTicket.customerUserId === customerUserId) {
        return {
          ok: true,
          ticket: customerView(existingTicket),
          duplicate: true,
        };
      }
      const created = await prisma.$transaction(async (tx) => {
        const locked = await tx.beyondMasterTicketDraft.updateMany({
          where: {
            confirmationId,
            customerUserId,
            status: "pending",
            expiresAt: { gt: now },
          },
          data: { status: "submitting" },
        });
        if (locked.count !== 1) return null;
        const draft = await tx.beyondMasterTicketDraft.findFirst({
          where: { confirmationId, customerUserId },
        });
        if (!draft) return null;
        await tx.beyondMasterTicketSequence.upsert({
          where: { id: "default" },
          create: { id: "default", nextNumber: 999 },
          update: {},
        });
        const allocated = await tx.beyondMasterTicketSequence.update({
          where: { id: "default" },
          data: { nextNumber: { increment: 1 } },
        });
        const reference = ticketReference(allocated.nextNumber);
        const notification = await recordTicketNotification({
          reference,
          category: draft.category,
          priority: draft.priority,
          customerEmail,
        });
        const ticket = await tx.beyondMasterTicket.create({
          data: {
            reference,
            customerUserId,
            idempotencyKey: confirmationId,
            subject: draft.subject,
            description: draft.description,
            category: draft.category,
            priority: draft.priority,
            status: "open",
            domainName: draft.domainName,
            domainId: draft.domainId,
            serviceLabel: draft.serviceLabel,
            serviceId: draft.serviceId,
            handoff: draft.handoff,
            contextNote: draft.contextNote,
            notification,
            messages: {
              create: {
                publicId: newPublicId("msg"),
                authorType: "customer",
                authorId: customerUserId,
                visibility: "customer",
                body: draft.description,
              },
            },
            activities: {
              create: {
                actorType: "customer",
                actorId: customerUserId,
                action: draft.handoff ? "human_handoff" : "created",
                detail: draft.handoff
                  ? "Marked for human review. A live agent is not connected."
                  : "Ticket created after confirmation.",
              },
            },
          },
          include: { messages: true },
        });
        await tx.beyondMasterTicketDraft.update({
          where: { id: draft.id },
          data: { status: "submitted", ticketReference: reference },
        });
        return ticket;
      });
      if (!created) {
        return {
          ok: false,
          status: 409,
          code: "not_pending",
          error: "This request can no longer be submitted.",
        };
      }
      return { ok: true, ticket: customerView(created), duplicate: false };
    } catch (error) {
      return asFailure(error);
    }
  },
  async listForCustomer({ customerUserId, status, query }) {
    const rows = await prisma.beyondMasterTicket.findMany({
      where: {
        customerUserId,
        ...(status ? { status } : {}),
        ...(query.trim()
          ? {
              OR: [
                { reference: { contains: query.trim(), mode: "insensitive" } },
                { subject: { contains: query.trim(), mode: "insensitive" } },
                { domainName: { contains: query.trim(), mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        messages: {
          where: { visibility: "customer" },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });
    return rows.map(customerView);
  },
  async getForCustomer(customerUserId, reference) {
    const row = await prisma.beyondMasterTicket.findFirst({
      where: { reference, customerUserId },
      include: {
        messages: {
          where: { visibility: "customer" },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    return row ? customerView(row) : null;
  },
  async reply({ customerUserId, reference, body, now }) {
    try {
      const ticket = await prisma.beyondMasterTicket.findFirst({
        where: { reference, customerUserId },
      });
      if (!ticket)
        return {
          ok: false,
          status: 404,
          code: "not_found",
          error: "That ticket was not found.",
        };
      if (ticket.status === "closed") {
        return {
          ok: false,
          status: 409,
          code: "closed",
          error:
            "This ticket is closed. Open a new request if you still need help.",
        };
      }
      await prisma.beyondMasterTicketMessage.create({
        data: {
          publicId: newPublicId("msg"),
          ticketId: ticket.id,
          authorType: "customer",
          authorId: customerUserId,
          visibility: "customer",
          body,
        },
      });
      await prisma.beyondMasterTicket.update({
        where: { id: ticket.id },
        data: { status: "waiting_support", resolvedAt: null, updatedAt: now },
      });
      await prisma.beyondMasterTicketActivity.create({
        data: {
          ticketId: ticket.id,
          actorType: "customer",
          actorId: customerUserId,
          action: "customer_reply",
        },
      });
      const next = await this.getForCustomer(customerUserId, reference);
      if (!next)
        return {
          ok: false,
          status: 404,
          code: "not_found",
          error: "That ticket was not found.",
        };
      return { ok: true, ticket: next };
    } catch (error) {
      return asFailure(error);
    }
  },
  async listForAdmin({ status, query }) {
    const rows = await prisma.beyondMasterTicket.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(query.trim()
          ? {
              OR: [
                { reference: { contains: query.trim(), mode: "insensitive" } },
                { subject: { contains: query.trim(), mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        activities: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });
    return rows.map(adminFrom);
  },
  async adminQueue(input) {
    try {
      const where = queueWhere(input);
      const [statusRows, urgent, total, rows] = await Promise.all([
        prisma.beyondMasterTicket.groupBy({
          by: ["status"],
          _count: { _all: true },
        }),
        prisma.beyondMasterTicket.count({ where: { priority: "urgent" } }),
        prisma.beyondMasterTicket.count({ where }),
        prisma.beyondMasterTicket.findMany({
          where,
          orderBy:
            input.sort === "created"
              ? { createdAt: "desc" }
              : { updatedAt: "desc" },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
          select: {
            reference: true,
            subject: true,
            customerUserId: true,
            category: true,
            priority: true,
            status: true,
            handoff: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
      ]);
      const byStatus = new Map(
        statusRows.map((row) => [row.status, row._count._all]),
      );
      const counts: AdminTicketCounts = {
        total: TICKET_STATUSES.reduce(
          (sum, status) => sum + (byStatus.get(status) ?? 0),
          0,
        ),
        open: byStatus.get("open") ?? 0,
        in_progress: byStatus.get("in_progress") ?? 0,
        waiting_customer: byStatus.get("waiting_customer") ?? 0,
        waiting_support: byStatus.get("waiting_support") ?? 0,
        resolved: byStatus.get("resolved") ?? 0,
        closed: byStatus.get("closed") ?? 0,
        urgent,
      };
      return {
        ok: true as const,
        counts,
        tickets: rows.map(listItemFrom),
        total,
        page: input.page,
        pageSize: input.pageSize,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === "P2021" || error.code === "P2022")
      ) {
        return {
          ok: false as const,
          status: 503,
          code: "migration_pending",
          error:
            "Support ticket management is unavailable until the database migration is applied.",
        };
      }
      return {
        ok: false as const,
        status: 503,
        code: "database",
        error: "Support tickets could not be loaded.",
      };
    }
  },
  async getForAdmin(reference) {
    const row = await prisma.beyondMasterTicket.findUnique({
      where: { reference },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        activities: { orderBy: { createdAt: "asc" } },
      },
    });
    return row ? adminFrom(row) : null;
  },
  async updateForAdmin({
    reference,
    adminId,
    status,
    priority,
    assigneeId,
    now,
  }) {
    try {
      const ticket = await prisma.beyondMasterTicket.findUnique({
        where: { reference },
      });
      if (!ticket)
        return {
          ok: false,
          status: 404,
          code: "not_found",
          error: "That ticket was not found.",
        };
      if (status && status !== ticket.status) {
        if (ticket.status === "closed" && status !== "open") {
          return {
            ok: false,
            status: 409,
            code: "status",
            error: "That status change is not allowed.",
          };
        }
        if (!(TICKET_STATUSES as readonly string[]).includes(status)) {
          return {
            ok: false,
            status: 400,
            code: "status",
            error: "Choose a status.",
          };
        }
      }
      await prisma.beyondMasterTicket.update({
        where: { id: ticket.id },
        data: {
          ...(status
            ? {
                status,
                resolvedAt:
                  status === "resolved" || status === "closed" ? now : null,
              }
            : {}),
          ...(priority ? { priority } : {}),
          ...(assigneeId !== undefined ? { assigneeId } : {}),
          updatedAt: now,
        },
      });
      if (status && status !== ticket.status) {
        await prisma.beyondMasterTicketActivity.create({
          data: {
            ticketId: ticket.id,
            actorType: "admin",
            actorId: adminId,
            action: "status",
            detail: status,
          },
        });
      }
      if (priority && priority !== ticket.priority) {
        await prisma.beyondMasterTicketActivity.create({
          data: {
            ticketId: ticket.id,
            actorType: "admin",
            actorId: adminId,
            action: "priority",
            detail: priority,
          },
        });
      }
      if (assigneeId !== undefined) {
        await prisma.beyondMasterTicketActivity.create({
          data: {
            ticketId: ticket.id,
            actorType: "admin",
            actorId: adminId,
            action: "assignment",
            detail: assigneeId,
          },
        });
      }
      const next = await this.getForAdmin(reference);
      if (!next)
        return {
          ok: false,
          status: 404,
          code: "not_found",
          error: "That ticket was not found.",
        };
      return { ok: true, ticket: next };
    } catch (error) {
      return asFailure(error);
    }
  },
  async addInternalNote({ reference, adminId, body, now }) {
    try {
      const ticket = await prisma.beyondMasterTicket.findUnique({
        where: { reference },
      });
      if (!ticket)
        return {
          ok: false,
          status: 404,
          code: "not_found",
          error: "That ticket was not found.",
        };
      await prisma.beyondMasterTicketMessage.create({
        data: {
          publicId: newPublicId("note"),
          ticketId: ticket.id,
          authorType: "support",
          authorId: adminId,
          visibility: "internal",
          body,
        },
      });
      await prisma.beyondMasterTicketActivity.create({
        data: {
          ticketId: ticket.id,
          actorType: "admin",
          actorId: adminId,
          action: "internal_note",
        },
      });
      await prisma.beyondMasterTicket.update({
        where: { id: ticket.id },
        data: { updatedAt: now },
      });
      const next = await this.getForAdmin(reference);
      if (!next)
        return {
          ok: false,
          status: 404,
          code: "not_found",
          error: "That ticket was not found.",
        };
      return { ok: true, ticket: next };
    } catch (error) {
      return asFailure(error);
    }
  },
  async replyAsAdmin({ reference, adminId, body, now }) {
    try {
      const ticket = await prisma.beyondMasterTicket.findUnique({
        where: { reference },
      });
      if (!ticket)
        return {
          ok: false,
          status: 404,
          code: "not_found",
          error: "That ticket was not found.",
        };
      await prisma.beyondMasterTicketMessage.create({
        data: {
          publicId: newPublicId("msg"),
          ticketId: ticket.id,
          authorType: "support",
          authorId: adminId,
          visibility: "customer",
          body,
        },
      });
      await prisma.beyondMasterTicket.update({
        where: { id: ticket.id },
        data: {
          status: ticket.status === "closed" ? "closed" : "waiting_customer",
          updatedAt: now,
        },
      });
      await prisma.beyondMasterTicketActivity.create({
        data: {
          ticketId: ticket.id,
          actorType: "admin",
          actorId: adminId,
          action: "support_reply",
        },
      });
      const next = await this.getForAdmin(reference);
      if (!next)
        return {
          ok: false,
          status: 404,
          code: "not_found",
          error: "That ticket was not found.",
        };
      return { ok: true, ticket: next };
    } catch (error) {
      return asFailure(error);
    }
  },
};

function queueWhere(
  input: AdminQueueInput,
): Prisma.BeyondMasterTicketWhereInput {
  const query = input.query.trim();
  return {
    ...(input.status ? { status: input.status } : {}),
    ...(input.priority ? { priority: input.priority } : {}),
    ...(input.category ? { category: input.category } : {}),
    ...(query
      ? {
          OR: [
            { reference: { contains: query, mode: "insensitive" } },
            { subject: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

function listItemFrom(ticket: {
  reference: string;
  subject: string;
  customerUserId: string;
  category: string;
  priority: string;
  status: string;
  handoff: boolean;
  createdAt: Date;
  updatedAt: Date;
}): AdminTicketListItem {
  return {
    reference: ticket.reference,
    subject: ticket.subject,
    customerRef: customerRef(ticket.customerUserId),
    category: ticket.category as AdminTicketListItem["category"],
    priority: ticket.priority as AdminTicketListItem["priority"],
    status: ticket.status as AdminTicketListItem["status"],
    handoff: ticket.handoff,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
  };
}

function customerRef(id: string) {
  if (!id || id.includes("@") || id.length <= 8) return "customer";
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
}

function adminFrom(ticket: {
  reference: string;
  customerUserId: string;
  assigneeId: string | null;
  domainId: string | null;
  serviceId: string | null;
  contextNote: string | null;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  domainName: string | null;
  serviceLabel: string | null;
  handoff: boolean;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  notification: unknown;
  messages: {
    publicId: string;
    authorType: string;
    visibility: string;
    body: string;
    createdAt: Date;
  }[];
  activities: {
    action: string;
    actorType: string;
    detail: string | null;
    createdAt: Date;
  }[];
}): AdminTicketView {
  return {
    ...customerView(ticket),
    customerUserId: ticket.customerUserId,
    assigneeId: ticket.assigneeId,
    domainId: ticket.domainId,
    serviceId: ticket.serviceId,
    contextNote: ticket.contextNote,
    internalNotes: ticket.messages
      .filter((message) => message.visibility === "internal")
      .map(publicMessage),
    activity: ticket.activities.map((row) => ({
      action: row.action,
      actorType: row.actorType,
      detail: row.detail,
      createdAt: row.createdAt.toISOString(),
    })),
  };
}

let testRepository: TicketRepository | null = null;

export function setBeyondMasterTicketRepositoryForTests(
  repository: TicketRepository | null,
) {
  if (process.env.NODE_ENV === "production") return;
  testRepository = repository;
}

export function getBeyondMasterTicketRepository(): TicketRepository {
  if (process.env.NODE_ENV !== "production" && testRepository)
    return testRepository;
  return prismaTicketRepository;
}

export function memoryRepositoryForTests() {
  return createMemoryTicketRepository();
}
