import { updateCustomerNameservers } from "@/lib/domains/domain-management-service";
import { normalizeNameserverList } from "@/lib/domains/nameserver-host";
import { requireActiveDomainRegistration } from "@/lib/domains/require-domain-ownership";
import { prisma } from "@/lib/prisma";
import { auditCommerceEvent } from "@/lib/beyond-master/commerce/audit";
import {
  beyondMasterCommerceStore,
  commerceExpiresAt,
  commerceIdempotencyKey,
  commerceProposalPublicId,
} from "@/lib/beyond-master/commerce/store";
import type { CommerceProposal } from "@/lib/beyond-master/commerce/types";
import {
  beginCommerceConfirm,
  finishCommerceExecution,
} from "@/lib/beyond-master/commerce/workflow";
import { commerceProposalView } from "@/lib/beyond-master/commerce/view";

const NS_CHANGE =
  /\b(change|update|set|point|use)\b.*\bnameservers?\b|\bnameservers?\b.*\b(to|change|update)\b|नेमसर्भर|nameserver/i;

const NS_HOST =
  /\b(ns[1-9][a-z0-9.-]*|[a-z0-9][a-z0-9.-]*\.(?:ns|dns|hosting)[a-z0-9.-]*)\b/gi;

export function wantsNameserverChange(message: string): boolean {
  return NS_CHANGE.test(message.trim());
}

function extractNameservers(message: string): string[] {
  const matches = [...message.matchAll(NS_HOST)].map((m) =>
    m[1]!.toLowerCase(),
  );
  return [...new Set(matches)].slice(0, 5);
}

function extractDomain(message: string): string | null {
  const match = message.match(
    /\b((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24})\b/i,
  );
  return match?.[1]?.toLowerCase() ?? null;
}

export async function prepareNameserverProposal(input: {
  customerUserId: string;
  message: string;
}): Promise<
  | { ok: true; view: ReturnType<typeof commerceProposalView> }
  | { ok: false; error: string }
> {
  const domain = extractDomain(input.message);
  if (!domain) {
    return { ok: false, error: "Name the domain for the nameserver change." };
  }
  const proposed = extractNameservers(input.message);
  if (proposed.length < 2) {
    return {
      ok: false,
      error:
        "Include at least two nameserver hostnames (for example ns1.example.com and ns2.example.com).",
    };
  }
  const normalized = normalizeNameserverList(proposed);
  if (!normalized.ok) {
    return { ok: false, error: normalized.error };
  }
  const owned = await requireActiveDomainRegistration(
    input.customerUserId,
    domain,
  );
  if (!owned.ok) {
    return { ok: false, error: owned.error };
  }
  const row = await prisma.domainRegistration.findUnique({
    where: { id: owned.registration.id },
    select: { nameservers: true },
  });
  const current = Array.isArray(row?.nameservers)
    ? (row!.nameservers as string[])
    : [];

  const idempotencyKey = commerceIdempotencyKey(
    input.customerUserId,
    "nameserver_update",
    `${domain}:${normalized.nameservers.join(",")}`,
  );
  const proposal: CommerceProposal = {
    publicId: commerceProposalPublicId(),
    customerUserId: input.customerUserId,
    kind: "nameserver_update",
    idempotencyKey,
    status: "pending",
    expiresAt: commerceExpiresAt(),
    claimToken: null,
    payload: {
      domain,
      current,
      proposed: normalized.nameservers,
    },
    resultMessage: null,
    verified: null,
    executionErrorCode: null,
  };
  const saved = await beyondMasterCommerceStore().insert(proposal);
  if (saved.publicId === proposal.publicId) {
    await auditCommerceEvent({
      event: "PROPOSAL_CREATED",
      customerUserId: input.customerUserId,
      proposalId: saved.publicId,
      kind: saved.kind,
      status: saved.status,
    });
  }
  return { ok: true, view: commerceProposalView(saved) };
}

async function revalidateNameserverPayload(input: {
  customerUserId: string;
  payload: { domain: string; proposed: string[] };
}): Promise<{ ok: true } | { ok: false; error: string; code: string }> {
  const owned = await requireActiveDomainRegistration(
    input.customerUserId,
    input.payload.domain,
  );
  if (!owned.ok) {
    return { ok: false, error: owned.error, code: "not_owned" };
  }
  const normalized = normalizeNameserverList(input.payload.proposed);
  if (!normalized.ok) {
    return { ok: false, error: normalized.error, code: "invalid_nameservers" };
  }
  if (normalized.nameservers.join(",") !== input.payload.proposed.join(",")) {
    return {
      ok: false,
      error: "Nameserver list changed. Start a new proposal.",
      code: "payload_mismatch",
    };
  }
  return { ok: true };
}

export async function confirmNameserverProposal(input: {
  customerUserId: string;
  publicId: string;
}): Promise<
  | { ok: true; view: ReturnType<typeof commerceProposalView> }
  | { ok: false; error: string; status: number }
> {
  const start = await beginCommerceConfirm({
    customerUserId: input.customerUserId,
    publicId: input.publicId,
    expectedKind: "nameserver_update",
  });
  if (!start.ok) {
    return { ok: false, error: start.error, status: start.status };
  }
  if (start.mode === "replay") {
    return { ok: true, view: start.view };
  }
  const payload = start.proposal.payload as {
    domain: string;
    proposed: string[];
  };
  const validated = await revalidateNameserverPayload({
    customerUserId: input.customerUserId,
    payload,
  });
  if (!validated.ok) {
    await finishCommerceExecution({
      proposal: start.proposal,
      success: false,
      resultMessage: validated.error,
      verified: false,
      errorCode: validated.code,
    });
    return { ok: false, error: validated.error, status: 409 };
  }
  const result = await updateCustomerNameservers(
    input.customerUserId,
    payload.domain,
    payload.proposed,
  );
  if (!result.ok) {
    await finishCommerceExecution({
      proposal: start.proposal,
      success: false,
      resultMessage: result.error,
      verified: false,
      errorCode: `nameserver_${result.status}`,
    });
    return { ok: false, error: result.error, status: result.status };
  }
  const finished = await finishCommerceExecution({
    proposal: start.proposal,
    success: true,
    resultMessage: `Nameservers updated for ${payload.domain}.`,
    verified: true,
    errorCode: null,
  });
  return { ok: true, view: commerceProposalView(finished) };
}
