import {
  createCustomerDnsRecord,
  deleteCustomerDnsRecord,
  listCustomerDnsRecords,
  updateCustomerDnsRecord,
} from "@/lib/domains/dns-management-service";
import { requireActiveDomainRegistration } from "@/lib/domains/require-domain-ownership";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  cancelDnsProposal,
  confirmDnsProposal,
  type DnsPorts,
  type DnsStore,
} from "@/lib/beyond-master/dns/workflow";
import { prismaDnsStore } from "@/lib/beyond-master/dns/prisma-store";
import {
  CUSTOMER_SESSION_COOKIE,
  verifyCustomerJwt,
} from "@/lib/customer/session";
import { beyondMasterTicketCustomerOverride } from "@/lib/beyond-master/tickets/http";
import {
  beyondMasterCapabilityEnabled,
  capabilityDisabledMessage,
} from "@/lib/beyond-master/capabilities";

let storeOverride: DnsStore | null = null;
let portsOverride: DnsPorts | null = null;

export function setBeyondMasterDnsForTests(
  input: { store: DnsStore; ports: DnsPorts } | null,
) {
  if (process.env.NODE_ENV === "production") return;
  storeOverride = input?.store ?? null;
  portsOverride = input?.ports ?? null;
}

export function beyondMasterDnsRuntime() {
  return {
    ports: portsOverride ?? productionDnsPorts(),
    store: storeOverride ?? prismaDnsStore(),
  };
}

export function productionDnsPorts(): DnsPorts {
  return {
    async own(userId, domain) {
      const owned = await requireActiveDomainRegistration(userId, domain);
      if (!owned.ok) return owned;
      return { ok: true, domain: owned.registration.domain };
    },
    async list(userId, domain) {
      const listed = await listCustomerDnsRecords(userId, domain);
      if (!listed.ok) return listed;
      return { ok: true, records: listed.records };
    },
    async write(input) {
      if (input.action === "add") {
        const result = await createCustomerDnsRecord(
          input.userId,
          input.domain,
          {
            type: input.change.type,
            host: input.change.host,
            value: input.change.value,
            ttl: input.change.ttl,
            priority: input.change.priority,
          },
        );
        return result.ok ? { ok: true } : { ok: false, error: result.error };
      }
      if (!input.recordId) return { ok: false, error: "Missing record id." };
      if (input.action === "update") {
        const result = await updateCustomerDnsRecord(
          input.userId,
          input.domain,
          input.recordId,
          {
            type: input.change.type,
            host: input.change.host,
            value: input.change.value,
            ttl: input.change.ttl,
            priority: input.change.priority,
          },
        );
        return result.ok ? { ok: true } : { ok: false, error: result.error };
      }
      const result = await deleteCustomerDnsRecord(
        input.userId,
        input.domain,
        input.recordId,
      );
      return result.ok ? { ok: true } : { ok: false, error: result.error };
    },
    async audit(entry) {
      await prisma.domainAuditLog.create({
        data: {
          action: "BEYOND_MASTER_DNS",
          resource: "BeyondMasterDnsProposal",
          resourceId: String(entry.proposalId ?? ""),
          details: entry as Prisma.InputJsonValue,
        },
      });
    },
    now: () => new Date(),
  };
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

async function customerId(request: Request) {
  const override = beyondMasterTicketCustomerOverride();
  if (override) return override.customerUserId;
  const verified = await verifyCustomerJwt(
    cookieValue(request, CUSTOMER_SESSION_COOKIE),
  );
  return verified?.customerUserId ?? null;
}

export async function postDnsConfirm(request: Request) {
  const userId = await customerId(request);
  if (!userId)
    return Response.json(
      { error: "Sign in to confirm a DNS change." },
      { status: 401 },
    );
  // DNS writes are gated off for the limited support release.
  if (!beyondMasterCapabilityEnabled("dns_write")) {
    return Response.json(
      {
        error: capabilityDisabledMessage("dns_write"),
        code: "capability_disabled",
      },
      { status: 503 },
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
  if (!publicId)
    return Response.json({ error: "Missing proposal id." }, { status: 400 });
  let result: Awaited<ReturnType<typeof confirmDnsProposal>>;
  try {
    result = await confirmDnsProposal({
      userId,
      publicId,
      ports: portsOverride ?? productionDnsPorts(),
      store: storeOverride ?? prismaDnsStore(),
    });
  } catch {
    return Response.json(
      { error: "DNS proposals are temporarily unavailable." },
      { status: 503 },
    );
  }
  if (!result.ok)
    return Response.json({ error: result.error }, { status: result.status });
  return Response.json({ proposal: result.proposal });
}

export async function postDnsCancel(request: Request) {
  const userId = await customerId(request);
  if (!userId)
    return Response.json(
      { error: "Sign in to cancel a DNS change." },
      { status: 401 },
    );
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
  if (!publicId)
    return Response.json({ error: "Missing proposal id." }, { status: 400 });
  let result: Awaited<ReturnType<typeof cancelDnsProposal>>;
  try {
    result = await cancelDnsProposal({
      userId,
      publicId,
      store: storeOverride ?? prismaDnsStore(),
    });
  } catch {
    return Response.json(
      { error: "DNS proposals are temporarily unavailable." },
      { status: 503 },
    );
  }
  if (!result.ok)
    return Response.json({ error: result.error }, { status: result.status });
  return Response.json({ proposal: result.proposal });
}
