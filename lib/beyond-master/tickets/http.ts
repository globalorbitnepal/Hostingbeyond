import {
  verifyCustomerJwt,
  CUSTOMER_SESSION_COOKIE,
} from "@/lib/customer/session";
import {
  consumeRateLimit,
  clientKeyFromRequest,
  rateLimitResponse,
} from "@/lib/http/fixed-window-rate-limit";
import { consumePrismaRateLimit } from "@/lib/beyond-master/postgres-rate-limit";
import {
  isRateLimitMemoryFallbackError,
  shouldUsePostgresRateLimitStore,
} from "@/lib/beyond-master/rate-limit";
import { classifySupportIntent } from "@/lib/beyond-master/tickets/intent";
import { enqueueThreadForHumanSupport } from "@/lib/beyond-master/human-support";
import { getBeyondMasterTicketRepository } from "@/lib/beyond-master/tickets/repository";
import {
  draftIdempotencyKey,
  parseTicketDraft,
  plainTicketText,
} from "@/lib/beyond-master/tickets/validate";
import type { TicketStatus } from "@/lib/beyond-master/tickets/types";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "@/lib/beyond-master/tickets/types";
import {
  isMailTransportConfigured,
  mailProviderConfigFlags,
} from "@/lib/support/mail-provider";
import { prisma } from "@/lib/prisma";

export type TicketCustomer = { customerUserId: string; email: string | null };

let customerOverride: TicketCustomer | null = null;

const TALK_HUMAN_EXPLICIT =
  /talk to (a )?human|speak to (a )?human|human support|live (support|agent|person)|real person/i;

export function setBeyondMasterTicketCustomerForTests(
  customer: TicketCustomer | null,
) {
  if (process.env.NODE_ENV === "production") return;
  customerOverride = customer;
}

function cookieValue(request: Request, name: string) {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export function beyondMasterTicketCustomerOverride() {
  if (process.env.NODE_ENV === "production") return null;
  return customerOverride;
}

export async function ticketCustomerFromRequest(
  request: Request,
): Promise<TicketCustomer | null> {
  if (process.env.NODE_ENV !== "production" && customerOverride)
    return customerOverride;
  const verified = await verifyCustomerJwt(
    cookieValue(request, CUSTOMER_SESSION_COOKIE),
  );
  if (!verified) return null;
  let email: string | null = null;
  try {
    const row = await prisma.customerUser.findUnique({
      where: { id: verified.customerUserId },
      select: { email: true },
    });
    email = row?.email ?? null;
  } catch {
    email = null;
  }
  return { customerUserId: verified.customerUserId, email };
}

export function crossSitePost(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  let host: string;
  try {
    host = new URL(origin).host;
  } catch {
    return true;
  }
  const expected =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  return !expected || host !== expected;
}

async function limited(request: Request, customerUserId: string) {
  const key = `beyond-master-ticket:${customerUserId}:${clientKeyFromRequest(request)}`;
  const env = process.env;
  if (!shouldUsePostgresRateLimitStore(env)) {
    return consumeRateLimit(key, 8, 10 * 60 * 1000);
  }
  try {
    return await consumePrismaRateLimit({
      bucketKey: key,
      maxRequests: 8,
      windowMs: 10 * 60 * 1000,
    });
  } catch (error) {
    if (isRateLimitMemoryFallbackError(error)) {
      return consumeRateLimit(key, 8, 10 * 60 * 1000);
    }
    return false;
  }
}

function statusFilter(value: string | null): TicketStatus | null {
  if (!value) return null;
  return (TICKET_STATUSES as readonly string[]).includes(value)
    ? (value as TicketStatus)
    : null;
}

export async function supportEventForChat(
  message: string,
  customerUserId: string | null,
  options?: { threadId?: string | null; guestCapabilityToken?: string | null },
) {
  const intent = classifySupportIntent(message);
  if (intent.kind === "none" && TALK_HUMAN_EXPLICIT.test(message.trim())) {
    const threadId = options?.threadId?.trim() ?? "";
    let issuedGuestToken: string | undefined;
    let queued = false;
    if (threadId && /^[A-Za-z0-9-]{8,64}$/.test(threadId)) {
      const enq = await enqueueThreadForHumanSupport({
        threadId,
        customerUserId: null,
        ticketReference: null,
        guestCapabilityToken: options?.guestCapabilityToken ?? null,
      });
      queued = enq.ok;
      if (enq.ok && "guestCapabilityToken" in enq && enq.guestCapabilityToken) {
        issuedGuestToken = enq.guestCapabilityToken;
      }
    }
    // Never announce a queue placement that the backend did not confirm.
    return {
      kind: "human_queue" as const,
      queued,
      message: queued
        ? "Your conversation is queued for staff in Orbit. Sign in to open a tracked ticket; guests cannot access account data here."
        : "I could not place this conversation in the staff queue automatically. Sign in and submit a support ticket so a person can pick it up; guests cannot access account data here.",
      ...(issuedGuestToken ? { guestCapabilityToken: issuedGuestToken } : {}),
    };
  }
  if (intent.kind === "none") return null;
  if (!customerUserId) {
    return {
      kind: "signin" as const,
      loginPath: "/login",
      handoff: intent.handoff,
      message: intent.handoff
        ? "A person can review a ticket after you sign in. Live chat with an agent is not available. Sign in, then submit the review card."
        : "Sign in to prepare a support ticket. This chat cannot open one for a guest.",
    };
  }
  if (intent.kind === "offer" || intent.missing.length > 0) {
    return {
      kind: "details" as const,
      category: intent.category,
      missing:
        intent.kind === "offer"
          ? ["confirmation", ...intent.missing]
          : intent.missing,
      domainName: intent.domainName,
      handoff: intent.handoff,
      message:
        "I can prepare a support request, but I will not create a ticket until you press Submit Ticket. Include the domain and say that you want technical support.",
    };
  }
  const threadId = options?.threadId?.trim() ?? "";
  if (intent.handoff && threadId && /^[A-Za-z0-9-]{8,64}$/.test(threadId)) {
    await enqueueThreadForHumanSupport({
      threadId,
      customerUserId,
      ticketReference: null,
      guestCapabilityToken: options?.guestCapabilityToken ?? null,
    });
  }
  const draft = {
    category: intent.category,
    priority: intent.priority,
    subject: intent.subject,
    description: intent.description,
    domainName: intent.domainName,
    domainId: null,
    serviceId: null,
    serviceLabel: null,
    handoff: intent.handoff,
    contextNote: intent.handoff
      ? "Customer asked for a human. No live agent is connected to this chat."
      : null,
  };
  const prepared = await getBeyondMasterTicketRepository().prepareDraft({
    customerUserId,
    draft,
    idempotencyKey: draftIdempotencyKey(customerUserId, draft),
    now: new Date(),
  });
  if (!prepared.ok) {
    return { kind: "unavailable" as const, message: prepared.error };
  }
  return {
    kind: "review" as const,
    confirmationId: prepared.draft.confirmationId,
    category: prepared.draft.category,
    priority: prepared.draft.priority,
    subject: prepared.draft.subject,
    domain: prepared.draft.domainName,
    description: prepared.draft.description,
    handoff: prepared.draft.handoff,
  };
}

export async function postTicketDraft(request: Request) {
  if (crossSitePost(request))
    return Response.json(
      { error: "Cross-site request blocked." },
      { status: 403 },
    );
  const customer = await ticketCustomerFromRequest(request);
  if (!customer) {
    return Response.json(
      { error: "Sign in to prepare a support ticket.", loginPath: "/login" },
      { status: 401 },
    );
  }
  if (!(await limited(request, customer.customerUserId))) {
    return Response.json(rateLimitResponse(), { status: 429 });
  }
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Send valid JSON." }, { status: 400 });
  }
  const parsed = parseTicketDraft(payload);
  if (!parsed.ok)
    return Response.json({ error: parsed.error }, { status: 400 });
  const prepared = await getBeyondMasterTicketRepository().prepareDraft({
    customerUserId: customer.customerUserId,
    draft: parsed.draft,
    idempotencyKey: draftIdempotencyKey(customer.customerUserId, parsed.draft),
    now: new Date(),
  });
  if (!prepared.ok)
    return Response.json(
      { error: prepared.error },
      { status: prepared.status },
    );
  return Response.json({
    confirmationId: prepared.draft.confirmationId,
    category: prepared.draft.category,
    priority: prepared.draft.priority,
    subject: prepared.draft.subject,
    domain: prepared.draft.domainName,
    description: prepared.draft.description,
    handoff: prepared.draft.handoff,
    expiresAt: prepared.draft.expiresAt,
  });
}

export async function postTicketSubmit(request: Request) {
  if (crossSitePost(request))
    return Response.json(
      { error: "Cross-site request blocked." },
      { status: 403 },
    );
  const customer = await ticketCustomerFromRequest(request);
  if (!customer)
    return Response.json(
      { error: "Sign in to submit a ticket.", loginPath: "/login" },
      { status: 401 },
    );
  if (!(await limited(request, customer.customerUserId)))
    return Response.json(rateLimitResponse(), { status: 429 });
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Send valid JSON." }, { status: 400 });
  }
  if (!payload || typeof payload !== "object" || "customerId" in payload) {
    return Response.json(
      { error: "Send the confirmation id only." },
      { status: 400 },
    );
  }
  const threadIdRaw = (payload as { threadId?: unknown }).threadId;
  const threadId =
    typeof threadIdRaw === "string" && /^[A-Za-z0-9-]{8,64}$/.test(threadIdRaw)
      ? threadIdRaw
      : null;
  const confirmationId = (payload as { confirmationId?: unknown })
    .confirmationId;
  if (
    typeof confirmationId !== "string" ||
    !/^cfm_[A-Za-z0-9_-]{16,}$/.test(confirmationId)
  ) {
    return Response.json(
      { error: "A valid confirmation id is required." },
      { status: 400 },
    );
  }
  const submitted = await getBeyondMasterTicketRepository().submitDraft({
    customerUserId: customer.customerUserId,
    confirmationId,
    now: new Date(),
    customerEmail: customer.email,
  });
  if (!submitted.ok)
    return Response.json(
      { error: submitted.error },
      { status: submitted.status },
    );
  if (threadId) {
    await prisma.beyondMasterChatThread.updateMany({
      where: { id: threadId, customerUserId: customer.customerUserId },
      data: {
        supportTicketReference: submitted.ticket.reference,
        updatedAt: new Date(),
      },
    });
  }
  return Response.json({
    reference: submitted.ticket.reference,
    status: submitted.ticket.status,
    duplicate: submitted.duplicate,
    notification: submitted.ticket.notification,
    handoff: submitted.ticket.handoff,
  });
}

export async function postTicketCancel(
  request: Request,
  confirmationId: string,
) {
  if (crossSitePost(request))
    return Response.json(
      { error: "Cross-site request blocked." },
      { status: 403 },
    );
  const customer = await ticketCustomerFromRequest(request);
  if (!customer)
    return Response.json(
      { error: "Sign in to cancel a request." },
      { status: 401 },
    );
  const cancelled = await getBeyondMasterTicketRepository().cancelDraft({
    customerUserId: customer.customerUserId,
    confirmationId,
    now: new Date(),
  });
  if (!cancelled.ok)
    return Response.json(
      { error: cancelled.error },
      { status: cancelled.status },
    );
  return Response.json({ cancelled: true });
}

export async function getCustomerTickets(request: Request) {
  const customer = await ticketCustomerFromRequest(request);
  if (!customer)
    return Response.json(
      { error: "Sign in to view tickets." },
      { status: 401 },
    );
  const url = new URL(request.url);
  const status = statusFilter(url.searchParams.get("status"));
  if (url.searchParams.get("status") && !status) {
    return Response.json({ error: "Unknown ticket status." }, { status: 400 });
  }
  try {
    const tickets = await getBeyondMasterTicketRepository().listForCustomer({
      customerUserId: customer.customerUserId,
      status,
      query: url.searchParams.get("q") ?? "",
    });
    return Response.json({ tickets });
  } catch {
    return Response.json(
      { error: "Tickets could not be listed." },
      { status: 503 },
    );
  }
}

export async function getCustomerTicket(request: Request, reference: string) {
  const customer = await ticketCustomerFromRequest(request);
  if (!customer)
    return Response.json(
      { error: "Sign in to view tickets." },
      { status: 401 },
    );
  if (!/^BM-[0-9]+$/.test(reference))
    return Response.json({ error: "Unknown ticket." }, { status: 404 });
  const ticket = await getBeyondMasterTicketRepository().getForCustomer(
    customer.customerUserId,
    reference,
  );
  if (!ticket)
    return Response.json(
      { error: "That ticket was not found." },
      { status: 404 },
    );
  return Response.json({ ticket });
}

export async function postCustomerReply(request: Request, reference: string) {
  if (crossSitePost(request))
    return Response.json(
      { error: "Cross-site request blocked." },
      { status: 403 },
    );
  const customer = await ticketCustomerFromRequest(request);
  if (!customer)
    return Response.json({ error: "Sign in to reply." }, { status: 401 });
  if (!(await limited(request, customer.customerUserId)))
    return Response.json(rateLimitResponse(), { status: 429 });
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Send valid JSON." }, { status: 400 });
  }
  const body = plainTicketText(
    payload && typeof payload === "object"
      ? (payload as { body?: unknown }).body
      : null,
    4000,
  );
  if (!body || body.length < 2)
    return Response.json({ error: "Write a reply." }, { status: 400 });
  const replied = await getBeyondMasterTicketRepository().reply({
    customerUserId: customer.customerUserId,
    reference,
    body,
    now: new Date(),
  });
  if (!replied.ok)
    return Response.json({ error: replied.error }, { status: replied.status });
  return Response.json({ ticket: replied.ticket });
}

export async function adminListTickets(
  adminId: string | null,
  request: Request,
) {
  if (!adminId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const rawStatus = url.searchParams.get("status");
  const rawPriority = url.searchParams.get("priority");
  const rawCategory = url.searchParams.get("category");
  const sort = url.searchParams.get("sort") ?? "updated";
  const status = statusFilter(rawStatus);
  const priority = enumFilter(rawPriority, TICKET_PRIORITIES);
  const category = enumFilter(rawCategory, TICKET_CATEGORIES);
  if (rawStatus && !status)
    return Response.json({ error: "Choose a status." }, { status: 400 });
  if (rawPriority && !priority)
    return Response.json({ error: "Choose a priority." }, { status: 400 });
  if (rawCategory && !category)
    return Response.json({ error: "Choose a category." }, { status: 400 });
  if (sort !== "created" && sort !== "updated") {
    return Response.json({ error: "Choose a sort." }, { status: 400 });
  }
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(url.searchParams.get("pageSize") ?? "20");
  if (!Number.isInteger(page) || page < 1 || page > 100) {
    return Response.json({ error: "Choose a page." }, { status: 400 });
  }
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) {
    return Response.json(
      { error: "Page size must be 50 or fewer." },
      { status: 400 },
    );
  }
  const result = await getBeyondMasterTicketRepository().adminQueue({
    status,
    priority,
    category,
    query: url.searchParams.get("q") ?? "",
    sort,
    page,
    pageSize,
  });
  if (!result.ok) {
    if (result.code === "migration_pending") {
      return Response.json({ available: false, message: result.error });
    }
    return Response.json({ error: result.error }, { status: result.status });
  }
  return Response.json({
    available: true,
    counts: result.counts,
    tickets: result.tickets,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  });
}

export async function adminGetTicket(
  adminId: string | null,
  reference: string,
) {
  if (!adminId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!/^BM-[0-9]+$/.test(reference)) {
    return Response.json(
      { error: "That ticket was not found." },
      { status: 404 },
    );
  }
  const ticket = await getBeyondMasterTicketRepository().getForAdmin(reference);
  if (!ticket)
    return Response.json(
      { error: "That ticket was not found." },
      { status: 404 },
    );
  return Response.json({ ticket });
}

export async function adminPatchTicket(
  adminId: string | null,
  reference: string,
  request: Request,
) {
  if (!adminId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!/^BM-[0-9]+$/.test(reference)) {
    return Response.json(
      { error: "That ticket was not found." },
      { status: 404 },
    );
  }
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Send valid JSON." }, { status: 400 });
  }
  const body =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const status = typeof body.status === "string" ? body.status : undefined;
  const priority =
    typeof body.priority === "string" ? body.priority : undefined;
  if (status && !(TICKET_STATUSES as readonly string[]).includes(status)) {
    return Response.json({ error: "Choose a status." }, { status: 400 });
  }
  if (
    priority &&
    !(TICKET_PRIORITIES as readonly string[]).includes(priority)
  ) {
    return Response.json({ error: "Choose a priority." }, { status: 400 });
  }
  const updated = await getBeyondMasterTicketRepository().updateForAdmin({
    reference,
    adminId,
    status: status as TicketStatus | undefined,
    priority: priority as (typeof TICKET_PRIORITIES)[number] | undefined,
    assigneeId:
      body.assigneeId === null
        ? null
        : typeof body.assigneeId === "string"
          ? body.assigneeId
          : undefined,
    now: new Date(),
  });
  if (!updated.ok)
    return Response.json({ error: updated.error }, { status: updated.status });
  return Response.json({ ticket: updated.ticket });
}

export async function adminNote(
  adminId: string | null,
  reference: string,
  request: Request,
) {
  if (!adminId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!/^BM-[0-9]+$/.test(reference)) {
    return Response.json(
      { error: "That ticket was not found." },
      { status: 404 },
    );
  }
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Send valid JSON." }, { status: 400 });
  }
  const body = plainTicketText(
    payload && typeof payload === "object"
      ? (payload as { body?: unknown }).body
      : null,
    4000,
  );
  if (!body)
    return Response.json({ error: "Write an internal note." }, { status: 400 });
  const noted = await getBeyondMasterTicketRepository().addInternalNote({
    reference,
    adminId,
    body,
    now: new Date(),
  });
  if (!noted.ok)
    return Response.json({ error: noted.error }, { status: noted.status });
  const customerView = await getBeyondMasterTicketRepository().getForCustomer(
    noted.ticket.customerUserId,
    reference,
  );
  return Response.json({
    ticket: noted.ticket,
    hiddenFromCustomer: !customerView?.messages.some(
      (message) => message.body === body,
    ),
  });
}

export async function adminReply(
  adminId: string | null,
  reference: string,
  request: Request,
) {
  if (!adminId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!/^BM-[0-9]+$/.test(reference)) {
    return Response.json(
      { error: "That ticket was not found." },
      { status: 404 },
    );
  }
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Send valid JSON." }, { status: 400 });
  }
  const body = plainTicketText(
    payload && typeof payload === "object"
      ? (payload as { body?: unknown }).body
      : null,
    4000,
  );
  if (!body) return Response.json({ error: "Write a reply." }, { status: 400 });
  const replied = await getBeyondMasterTicketRepository().replyAsAdmin({
    reference,
    adminId,
    body,
    now: new Date(),
  });
  if (!replied.ok)
    return Response.json({ error: replied.error }, { status: replied.status });
  const configured = isMailTransportConfigured(mailProviderConfigFlags());
  return Response.json({
    ticket: replied.ticket,
    emailDelivered: false,
    emailNotice: configured
      ? "Reply saved. Email delivery was not confirmed."
      : "Reply saved successfully. Email notification is not configured.",
  });
}

function enumFilter<T extends string>(
  value: string | null,
  allowed: readonly T[],
): T | null {
  if (!value) return null;
  return (allowed as readonly string[]).includes(value) ? (value as T) : null;
}
