import {
  newConfirmationId,
  newPublicId,
  ticketReference,
} from "@/lib/beyond-master/tickets/validate";
import { recordTicketNotification } from "@/lib/beyond-master/tickets/notify";
import type {
  AdminQueueInput,
  AdminQueueResult,
  AdminTicketCounts,
  AdminTicketListItem,
  AdminTicketView,
  CustomerTicketView,
  NotificationRecord,
  TicketCategory,
  TicketDraftInput,
  TicketPriority,
  TicketStatus,
} from "@/lib/beyond-master/tickets/types";
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "@/lib/beyond-master/tickets/types";

type MessageRow = CustomerTicketView["messages"][number] & {
  visibility: "customer" | "internal";
  authorId: string | null;
};

type ActivityRow = AdminTicketView["activity"][number];

type TicketRow = {
  reference: string;
  customerUserId: string;
  idempotencyKey: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  domainName: string | null;
  domainId: string | null;
  serviceLabel: string | null;
  serviceId: string | null;
  assigneeId: string | null;
  handoff: boolean;
  contextNote: string | null;
  notification: NotificationRecord;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  messages: MessageRow[];
  activity: ActivityRow[];
};

type DraftRow = TicketDraftInput & {
  confirmationId: string;
  customerUserId: string;
  idempotencyKey: string;
  status: "pending" | "submitted" | "cancelled";
  expiresAt: string;
  ticketReference: string | null;
};

export type TicketFailure = {
  ok: false;
  status: number;
  error: string;
  code: string;
};

export type TicketRepository = {
  prepareDraft(input: {
    customerUserId: string;
    draft: TicketDraftInput;
    idempotencyKey: string;
    now: Date;
  }): Promise<{ ok: true; draft: DraftRow } | TicketFailure>;
  cancelDraft(input: {
    customerUserId: string;
    confirmationId: string;
    now: Date;
  }): Promise<{ ok: true; cancelled: boolean } | TicketFailure>;
  submitDraft(input: {
    customerUserId: string;
    confirmationId: string;
    now: Date;
    customerEmail: string | null;
  }): Promise<
    { ok: true; ticket: CustomerTicketView; duplicate: boolean } | TicketFailure
  >;
  listForCustomer(input: {
    customerUserId: string;
    status: TicketStatus | null;
    query: string;
  }): Promise<CustomerTicketView[]>;
  getForCustomer(
    customerUserId: string,
    reference: string,
  ): Promise<CustomerTicketView | null>;
  reply(input: {
    customerUserId: string;
    reference: string;
    body: string;
    now: Date;
  }): Promise<{ ok: true; ticket: CustomerTicketView } | TicketFailure>;
  listForAdmin(input: {
    status: TicketStatus | null;
    query: string;
  }): Promise<AdminTicketView[]>;
  adminQueue(input: AdminQueueInput): Promise<AdminQueueResult | TicketFailure>;
  getForAdmin(reference: string): Promise<AdminTicketView | null>;
  updateForAdmin(input: {
    reference: string;
    adminId: string;
    status?: TicketStatus;
    priority?: TicketPriority;
    assigneeId?: string | null;
    now: Date;
  }): Promise<{ ok: true; ticket: AdminTicketView } | TicketFailure>;
  addInternalNote(input: {
    reference: string;
    adminId: string;
    body: string;
    now: Date;
  }): Promise<{ ok: true; ticket: AdminTicketView } | TicketFailure>;
  replyAsAdmin(input: {
    reference: string;
    adminId: string;
    body: string;
    now: Date;
  }): Promise<{ ok: true; ticket: AdminTicketView } | TicketFailure>;
};

export function createMemoryTicketRepository(): TicketRepository & {
  seedOwnership(customerUserId: string, domainId: string, domain: string): void;
} {
  const drafts: DraftRow[] = [];
  const tickets: TicketRow[] = [];
  let nextNumber = 999;
  const ownedDomains = new Map<string, { id: string; domain: string }>();
  const ownedServices = new Map<string, { id: string; label: string }>();

  function customerView(ticket: TicketRow): CustomerTicketView {
    return {
      reference: ticket.reference,
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      domainName: ticket.domainName,
      serviceLabel: ticket.serviceLabel,
      handoff: ticket.handoff,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      resolvedAt: ticket.resolvedAt,
      notification: ticket.notification,
      messages: ticket.messages
        .filter((message) => message.visibility === "customer")
        .map(({ publicId, authorType, body, createdAt }) => ({
          publicId,
          authorType:
            authorType as CustomerTicketView["messages"][number]["authorType"],
          body,
          createdAt,
        })),
    };
  }

  function adminView(ticket: TicketRow): AdminTicketView {
    return {
      ...customerView(ticket),
      customerUserId: ticket.customerUserId,
      assigneeId: ticket.assigneeId,
      domainId: ticket.domainId,
      serviceId: ticket.serviceId,
      contextNote: ticket.contextNote,
      internalNotes: ticket.messages
        .filter((message) => message.visibility === "internal")
        .map(({ publicId, authorType, body, createdAt }) => ({
          publicId,
          authorType:
            authorType as CustomerTicketView["messages"][number]["authorType"],
          body,
          createdAt,
        })),
      activity: ticket.activity,
    };
  }

  return {
    async prepareDraft({ customerUserId, draft, idempotencyKey, now }) {
      const domain = resolveOwned(
        ownedDomains,
        customerUserId,
        draft.domainId,
        draft.domainName,
      );
      if (!domain.ok)
        return fail(403, "That domain is not on this account.", "ownership");
      const service = resolveOwned(
        ownedServices,
        customerUserId,
        draft.serviceId,
        draft.serviceLabel,
      );
      if (!service.ok)
        return fail(403, "That service is not on this account.", "ownership");
      const existing = drafts.find(
        (row) => row.idempotencyKey === idempotencyKey,
      );
      if (existing && existing.customerUserId === customerUserId)
        return { ok: true, draft: existing };
      const row: DraftRow = {
        ...draft,
        domainName: domain.label,
        domainId: domain.id,
        serviceLabel: service.label,
        serviceId: service.id,
        confirmationId: newConfirmationId(),
        customerUserId,
        idempotencyKey,
        status: "pending",
        expiresAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
        ticketReference: null,
      };
      drafts.push(row);
      return { ok: true, draft: row };
    },
    async cancelDraft({ customerUserId, confirmationId }) {
      const draft = drafts.find(
        (row) =>
          row.confirmationId === confirmationId &&
          row.customerUserId === customerUserId,
      );
      if (!draft)
        return fail(404, "That support request was not found.", "not_found");
      if (draft.status === "submitted") {
        return fail(
          409,
          "This request was already submitted.",
          "already_submitted",
        );
      }
      draft.status = "cancelled";
      return { ok: true, cancelled: true };
    },
    async submitDraft({ customerUserId, confirmationId, now, customerEmail }) {
      const draft = drafts.find(
        (row) =>
          row.confirmationId === confirmationId &&
          row.customerUserId === customerUserId,
      );
      if (!draft)
        return fail(404, "That support request was not found.", "not_found");
      if (draft.status === "cancelled") {
        return fail(409, "This request was cancelled.", "cancelled");
      }
      if (
        new Date(draft.expiresAt).getTime() <= now.getTime() &&
        draft.status === "pending"
      ) {
        return fail(409, "This request expired. Prepare it again.", "expired");
      }
      const existing = tickets.find(
        (ticket) => ticket.idempotencyKey === draft.confirmationId,
      );
      if (existing)
        return { ok: true, ticket: customerView(existing), duplicate: true };
      if (draft.status !== "pending") {
        return fail(
          409,
          "This request can no longer be submitted.",
          "not_pending",
        );
      }
      nextNumber += 1;
      const reference = ticketReference(nextNumber);
      if (tickets.some((ticket) => ticket.reference === reference)) {
        return fail(
          409,
          "The ticket reference collided. Try again.",
          "reference_collision",
        );
      }
      const createdAt = now.toISOString();
      const notification = await recordTicketNotification({
        reference,
        category: draft.category,
        priority: draft.priority,
        customerEmail,
      });
      const ticket: TicketRow = {
        reference,
        customerUserId,
        idempotencyKey: draft.confirmationId,
        subject: draft.subject,
        description: draft.description,
        category: draft.category,
        priority: draft.priority,
        status: "open",
        domainName: draft.domainName,
        domainId: draft.domainId,
        serviceLabel: draft.serviceLabel,
        serviceId: draft.serviceId,
        assigneeId: null,
        handoff: draft.handoff,
        contextNote: draft.contextNote,
        notification,
        resolvedAt: null,
        createdAt,
        updatedAt: createdAt,
        messages: [
          {
            publicId: newPublicId("msg"),
            authorType: "customer",
            authorId: customerUserId,
            visibility: "customer",
            body: draft.description,
            createdAt,
          },
        ],
        activity: [
          {
            action: draft.handoff ? "human_handoff" : "created",
            actorType: "customer",
            detail: draft.handoff
              ? "Marked for human review. A live agent is not connected."
              : "Ticket created after confirmation.",
            createdAt,
          },
        ],
      };
      tickets.push(ticket);
      draft.status = "submitted";
      draft.ticketReference = reference;
      return { ok: true, ticket: customerView(ticket), duplicate: false };
    },
    async listForCustomer({ customerUserId, status, query }) {
      return tickets
        .filter((ticket) => ticket.customerUserId === customerUserId)
        .filter((ticket) => (status ? ticket.status === status : true))
        .filter((ticket) => matches(ticket, query))
        .map(customerView);
    },
    async getForCustomer(customerUserId, reference) {
      const ticket = tickets.find(
        (row) =>
          row.reference === reference && row.customerUserId === customerUserId,
      );
      return ticket ? customerView(ticket) : null;
    },
    async reply({ customerUserId, reference, body, now }) {
      const ticket = tickets.find(
        (row) =>
          row.reference === reference && row.customerUserId === customerUserId,
      );
      if (!ticket) return fail(404, "That ticket was not found.", "not_found");
      if (ticket.status === "closed") {
        return fail(
          409,
          "This ticket is closed. Open a new request if you still need help.",
          "closed",
        );
      }
      const createdAt = now.toISOString();
      ticket.messages.push({
        publicId: newPublicId("msg"),
        authorType: "customer",
        authorId: customerUserId,
        visibility: "customer",
        body,
        createdAt,
      });
      ticket.status = "waiting_support";
      ticket.resolvedAt = null;
      ticket.updatedAt = createdAt;
      ticket.activity.push({
        action: "customer_reply",
        actorType: "customer",
        detail: null,
        createdAt,
      });
      return { ok: true, ticket: customerView(ticket) };
    },
    async listForAdmin({ status, query }) {
      return tickets
        .filter((ticket) => (status ? ticket.status === status : true))
        .filter((ticket) => matches(ticket, query))
        .map(adminView);
    },
    async adminQueue({
      status,
      priority,
      category,
      query,
      sort,
      page,
      pageSize,
    }) {
      const filtered = tickets
        .filter((ticket) => (status ? ticket.status === status : true))
        .filter((ticket) => (priority ? ticket.priority === priority : true))
        .filter((ticket) => (category ? ticket.category === category : true))
        .filter((ticket) => matches(ticket, query))
        .sort((left, right) =>
          (sort === "created"
            ? right.createdAt
            : right.updatedAt
          ).localeCompare(sort === "created" ? left.createdAt : left.updatedAt),
        );
      const start = (page - 1) * pageSize;
      return {
        ok: true,
        counts: ticketCounts(tickets),
        tickets: filtered.slice(start, start + pageSize).map(listItem),
        total: filtered.length,
        page,
        pageSize,
      };
    },
    async getForAdmin(reference) {
      const ticket = tickets.find((row) => row.reference === reference);
      return ticket ? adminView(ticket) : null;
    },
    async updateForAdmin({
      reference,
      adminId,
      status,
      priority,
      assigneeId,
      now,
    }) {
      const ticket = tickets.find((row) => row.reference === reference);
      if (!ticket) return fail(404, "That ticket was not found.", "not_found");
      const createdAt = now.toISOString();
      if (status && status !== ticket.status) {
        if (!canTransition(ticket.status, status)) {
          return fail(409, "That status change is not allowed.", "status");
        }
        ticket.status = status;
        ticket.resolvedAt =
          status === "resolved" || status === "closed" ? createdAt : null;
        ticket.activity.push({
          action: "status",
          actorType: "admin",
          detail: `${adminId} set ${status}`,
          createdAt,
        });
      }
      if (priority && priority !== ticket.priority) {
        if (!(TICKET_PRIORITIES as readonly string[]).includes(priority)) {
          return fail(400, "Choose a priority.", "priority");
        }
        ticket.priority = priority;
        ticket.activity.push({
          action: "priority",
          actorType: "admin",
          detail: priority,
          createdAt,
        });
      }
      if (assigneeId !== undefined) {
        ticket.assigneeId = assigneeId;
        ticket.activity.push({
          action: "assignment",
          actorType: "admin",
          detail: assigneeId,
          createdAt,
        });
      }
      ticket.updatedAt = createdAt;
      return { ok: true, ticket: adminView(ticket) };
    },
    async addInternalNote({ reference, adminId, body, now }) {
      const ticket = tickets.find((row) => row.reference === reference);
      if (!ticket) return fail(404, "That ticket was not found.", "not_found");
      const createdAt = now.toISOString();
      ticket.messages.push({
        publicId: newPublicId("note"),
        authorType: "support",
        authorId: adminId,
        visibility: "internal",
        body,
        createdAt,
      });
      ticket.activity.push({
        action: "internal_note",
        actorType: "admin",
        detail: null,
        createdAt,
      });
      ticket.updatedAt = createdAt;
      return { ok: true, ticket: adminView(ticket) };
    },
    async replyAsAdmin({ reference, adminId, body, now }) {
      const ticket = tickets.find((row) => row.reference === reference);
      if (!ticket) return fail(404, "That ticket was not found.", "not_found");
      const createdAt = now.toISOString();
      ticket.messages.push({
        publicId: newPublicId("msg"),
        authorType: "support",
        authorId: adminId,
        visibility: "customer",
        body,
        createdAt,
      });
      if (ticket.status !== "closed") ticket.status = "waiting_customer";
      ticket.updatedAt = createdAt;
      ticket.activity.push({
        action: "support_reply",
        actorType: "admin",
        detail: null,
        createdAt,
      });
      return { ok: true, ticket: adminView(ticket) };
    },
    seedOwnership(customerUserId: string, domainId: string, domain: string) {
      ownedDomains.set(`${customerUserId}:${domainId}`, {
        id: domainId,
        domain,
      });
    },
  } as TicketRepository & {
    seedOwnership(
      customerUserId: string,
      domainId: string,
      domain: string,
    ): void;
  };
}

function fail(status: number, error: string, code: string): TicketFailure {
  return { ok: false, status, error, code };
}

function ticketCounts(rows: TicketRow[]): AdminTicketCounts {
  const count = (status: TicketStatus) =>
    rows.filter((row) => row.status === status).length;
  return {
    total: rows.length,
    open: count("open"),
    in_progress: count("in_progress"),
    waiting_customer: count("waiting_customer"),
    waiting_support: count("waiting_support"),
    resolved: count("resolved"),
    closed: count("closed"),
    urgent: rows.filter((row) => row.priority === "urgent").length,
  };
}

function listItem(ticket: TicketRow): AdminTicketListItem {
  return {
    reference: ticket.reference,
    subject: ticket.subject,
    customerRef: customerRef(ticket.customerUserId),
    category: ticket.category,
    priority: ticket.priority,
    status: ticket.status,
    handoff: ticket.handoff,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };
}

function customerRef(id: string) {
  if (!id || id.includes("@") || id.length <= 8) return "customer";
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
}

function matches(ticket: TicketRow, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    ticket.reference.toLowerCase().includes(needle) ||
    ticket.subject.toLowerCase().includes(needle) ||
    ticket.description.toLowerCase().includes(needle) ||
    (ticket.domainName ?? "").includes(needle)
  );
}

function canTransition(from: TicketStatus, to: TicketStatus) {
  if (!(TICKET_STATUSES as readonly string[]).includes(to)) return false;
  if (from === to) return true;
  if (from === "closed") return to === "open";
  return true;
}

function resolveOwned(
  map: Map<string, { id: string; label?: string; domain?: string }>,
  customerUserId: string,
  id: string | null,
  fallback: string | null,
): { ok: true; id: string | null; label: string | null } | { ok: false } {
  if (!id) return { ok: true, id: null, label: fallback };
  const row = map.get(`${customerUserId}:${id}`);
  if (!row) return { ok: false };
  return { ok: true, id: row.id, label: row.domain ?? row.label ?? fallback };
}
