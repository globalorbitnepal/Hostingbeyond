import { confirmDomainRegistrationProposal } from "@/lib/beyond-master/commerce/domain-register";
import { confirmHostingCheckoutProposal } from "@/lib/beyond-master/commerce/hosting-checkout";
import { confirmNameserverProposal } from "@/lib/beyond-master/commerce/nameservers";
import { auditCommerceEvent } from "@/lib/beyond-master/commerce/audit";
import { beyondMasterCommerceStore } from "@/lib/beyond-master/commerce/store";
import { commerceProposalView } from "@/lib/beyond-master/commerce/view";
import {
  CUSTOMER_SESSION_COOKIE,
  verifyCustomerJwt,
} from "@/lib/customer/session";
import { beyondMasterTicketCustomerOverride } from "@/lib/beyond-master/tickets/http";
import { prisma } from "@/lib/prisma";

function cookieValue(request: Request, name: string) {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

async function customerSession(request: Request) {
  const override = beyondMasterTicketCustomerOverride();
  if (override) {
    return { customerUserId: override.customerUserId, email: override.email };
  }
  const verified = await verifyCustomerJwt(
    cookieValue(request, CUSTOMER_SESSION_COOKIE),
  );
  if (!verified) return null;
  const row = await prisma.customerUser.findUnique({
    where: { id: verified.customerUserId },
    select: { email: true },
  });
  return {
    customerUserId: verified.customerUserId,
    email: row?.email ?? "",
  };
}

export async function postCommerceConfirm(request: Request) {
  const session = await customerSession(request);
  if (!session) {
    return Response.json(
      { error: "Sign in to confirm this action." },
      { status: 401 },
    );
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Send valid JSON." }, { status: 400 });
  }
  const publicId =
    body &&
    typeof body === "object" &&
    typeof (body as { proposalId?: unknown }).proposalId === "string"
      ? (body as { proposalId: string }).proposalId
      : "";
  if (!publicId) {
    return Response.json({ error: "Missing proposal id." }, { status: 400 });
  }
  const proposal = await beyondMasterCommerceStore().findByPublicId(publicId);
  if (!proposal || proposal.customerUserId !== session.customerUserId) {
    return Response.json({ error: "Proposal not found." }, { status: 404 });
  }
  if (proposal.kind === "domain_register") {
    const result = await confirmDomainRegistrationProposal({
      customerUserId: session.customerUserId,
      userEmail: session.email ?? "",
      publicId,
    });
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json({ ok: true, proposal: result.view });
  }
  if (proposal.kind === "nameserver_update") {
    const result = await confirmNameserverProposal({
      customerUserId: session.customerUserId,
      publicId,
    });
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json({ ok: true, proposal: result.view });
  }
  const result = await confirmHostingCheckoutProposal({
    customerUserId: session.customerUserId,
    publicId,
  });
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }
  return Response.json({
    ok: true,
    proposal: result.view,
    checkoutUrl: result.checkoutUrl ?? null,
  });
}

export async function postCommerceCancel(request: Request) {
  const session = await customerSession(request);
  if (!session) {
    return Response.json({ error: "Sign in required." }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Send valid JSON." }, { status: 400 });
  }
  const publicId =
    body &&
    typeof body === "object" &&
    typeof (body as { proposalId?: unknown }).proposalId === "string"
      ? (body as { proposalId: string }).proposalId
      : "";
  if (!publicId) {
    return Response.json({ error: "Missing proposal id." }, { status: 400 });
  }
  const store = beyondMasterCommerceStore();
  const existing = await store.findByPublicId(publicId);
  if (!existing || existing.customerUserId !== session.customerUserId) {
    return Response.json({ error: "Proposal not found." }, { status: 404 });
  }
  const cancelled = await store.cancelPending(publicId, session.customerUserId);
  if (!cancelled) {
    return Response.json({ error: "Proposal not found." }, { status: 404 });
  }
  if (cancelled.status === "cancelled") {
    await auditCommerceEvent({
      event: "CANCELLED",
      customerUserId: session.customerUserId,
      proposalId: cancelled.publicId,
      kind: cancelled.kind,
      status: cancelled.status,
    });
  }
  return Response.json({
    ok: true,
    proposal: commerceProposalView(cancelled),
  });
}
