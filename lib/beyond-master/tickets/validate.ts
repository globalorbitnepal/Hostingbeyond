import { createHash, randomBytes } from "crypto";

import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  type TicketCategory,
  type TicketDraftInput,
  type TicketPriority,
} from "@/lib/beyond-master/tickets/types";

const HOST = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/i;

export function plainTicketText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const stripped = value
    .replace(/\u0000/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
  if (!stripped) return null;
  return stripped.slice(0, max);
}

export function parseTicketDraft(
  input: unknown,
): { ok: true; draft: TicketDraftInput } | { ok: false; error: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Send a support request." };
  }
  const body = input as Record<string, unknown>;
  if ("customerId" in body || "userId" in body || "apiKey" in body) {
    return {
      ok: false,
      error: "Account identity cannot be set from the browser.",
    };
  }
  const category = body.category;
  if (
    typeof category !== "string" ||
    !(TICKET_CATEGORIES as readonly string[]).includes(category)
  ) {
    return { ok: false, error: "Choose a support category." };
  }
  const priority = body.priority ?? "normal";
  if (
    typeof priority !== "string" ||
    !(TICKET_PRIORITIES as readonly string[]).includes(priority)
  ) {
    return { ok: false, error: "Choose a priority." };
  }
  const subject = plainTicketText(body.subject, 140);
  const description = plainTicketText(body.description, 4000);
  if (!subject || subject.length < 4) {
    return { ok: false, error: "Add a short subject." };
  }
  if (!description || description.length < 10) {
    return { ok: false, error: "Describe the problem in a sentence or more." };
  }
  const domainName = optionalHost(body.domainName);
  if (body.domainName && !domainName) {
    return {
      ok: false,
      error: "Enter the domain name only, such as example.com.",
    };
  }
  const domainId = optionalId(body.domainId);
  const serviceId = optionalId(body.serviceId);
  const serviceLabel = plainTicketText(body.serviceLabel, 120);
  if (needsDomain(category as TicketCategory) && !domainName && !domainId) {
    return { ok: false, error: "Enter the domain this request is about." };
  }
  return {
    ok: true,
    draft: {
      category: category as TicketCategory,
      priority: priority as TicketPriority,
      subject,
      description,
      domainName,
      domainId,
      serviceId,
      serviceLabel,
      handoff: body.handoff === true,
      contextNote: plainTicketText(body.contextNote, 1000),
    },
  };
}

export function needsDomain(category: TicketCategory) {
  return (
    category === "domain" ||
    category === "dns" ||
    category === "website" ||
    category === "business-email"
  );
}

export function draftIdempotencyKey(
  customerUserId: string,
  draft: TicketDraftInput,
) {
  const material = [
    customerUserId,
    draft.category,
    draft.subject.toLowerCase(),
    draft.description.toLowerCase(),
    draft.domainName ?? "",
  ].join("\n");
  return createHash("sha256").update(material).digest("hex");
}

export function newConfirmationId() {
  return `cfm_${randomBytes(18).toString("base64url")}`;
}

export function newPublicId(prefix: string) {
  return `${prefix}_${randomBytes(12).toString("base64url")}`;
}

export function ticketReference(number: number) {
  return `BM-${number}`;
}

export function validateAttachment(input: {
  fileName: string;
  contentType: string;
  sizeBytes: number;
}): { ok: true } | { ok: false; error: string } {
  const name = input.fileName.trim();
  if (!name || name.length > 120 || /[\\/\u0000]/.test(name)) {
    return { ok: false, error: "That file name is not allowed." };
  }
  const allowed = new Set([
    "image/png",
    "image/jpeg",
    "application/pdf",
    "text/plain",
  ]);
  if (!allowed.has(input.contentType)) {
    return {
      ok: false,
      error: "Only PNG, JPEG, PDF, and text files are allowed.",
    };
  }
  if (
    !Number.isInteger(input.sizeBytes) ||
    input.sizeBytes < 1 ||
    input.sizeBytes > 5_000_000
  ) {
    return { ok: false, error: "Attachments must be between 1 byte and 5 MB." };
  }
  return { ok: true };
}

function optionalHost(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return null;
  const host = value.trim().toLowerCase().replace(/\.$/, "");
  return HOST.test(host) ? host : null;
}

function optionalId(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || !/^c[a-z0-9]{8,}$/i.test(value)) return null;
  return value;
}
