import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  adminGetTicket,
  adminListTickets,
  adminNote,
  adminPatchTicket,
  adminReply,
  getCustomerTicket,
  postTicketDraft,
  postTicketSubmit,
  setBeyondMasterTicketCustomerForTests,
} from "@/lib/beyond-master/tickets/http";
import { createMemoryTicketRepository } from "@/lib/beyond-master/tickets/memory";
import { setBeyondMasterTicketRepositoryForTests } from "@/lib/beyond-master/tickets/repository";

const customer = {
  customerUserId: "cust_queue_12345678",
  email: "person@example.com",
};

afterEach(() => {
  setBeyondMasterTicketRepositoryForTests(null);
  setBeyondMasterTicketCustomerForTests(null);
});

let requestIp = 80;

function jsonRequest(url: string, body?: unknown) {
  requestIp += 1;
  const headers = new Headers({ "x-real-ip": `203.0.113.${requestIp}` });
  if (body !== undefined) headers.set("content-type", "application/json");
  return new Request(url, {
    method: body === undefined ? "GET" : "POST",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function openTicket(
  subject: string,
  extra: Record<string, unknown> = {},
) {
  const prepared = await postTicketDraft(
    jsonRequest("http://localhost/api/beyond-master/tickets/drafts", {
      category: "hosting",
      subject,
      description: "Please contact technical support about hosting.",
      ...extra,
    }),
  );
  assert.equal(prepared.status, 200);
  const confirmationId = ((await prepared.json()) as { confirmationId: string })
    .confirmationId;
  const created = await postTicketSubmit(
    jsonRequest("http://localhost/api/beyond-master/tickets", {
      confirmationId,
    }),
  );
  assert.equal(created.status, 200);
  return ((await created.json()) as { reference: string }).reference;
}

describe("orbit ticket queue", () => {
  it("rejects an anonymous admin before the repository is called", async () => {
    let called = false;
    const memory = createMemoryTicketRepository();
    setBeyondMasterTicketRepositoryForTests({
      ...memory,
      adminQueue: async () => {
        called = true;
        throw new Error("database should not be touched");
      },
    });
    const denied = await adminListTickets(
      null,
      new Request("http://localhost/api/orbit/beyond-master/tickets"),
    );
    assert.equal(denied.status, 401);
    assert.equal(called, false);
  });

  it("reports a missing ticket migration without counts", async () => {
    const memory = createMemoryTicketRepository();
    setBeyondMasterTicketRepositoryForTests({
      ...memory,
      adminQueue: async () => ({
        ok: false,
        status: 503,
        code: "migration_pending",
        error:
          "Support ticket management is unavailable until the database migration is applied.",
      }),
    });
    const response = await adminListTickets(
      "admin-1",
      new Request("http://localhost/api/orbit/beyond-master/tickets"),
    );
    const body = (await response.json()) as {
      available: boolean;
      message: string;
      counts?: unknown;
    };
    assert.equal(body.available, false);
    assert.equal(
      body.message,
      "Support ticket management is unavailable until the database migration is applied.",
    );
    assert.equal("counts" in body, false);
  });

  it("paginates, filters, and searches without returning every ticket", async () => {
    setBeyondMasterTicketRepositoryForTests(createMemoryTicketRepository());
    setBeyondMasterTicketCustomerForTests(customer);
    const first = await openTicket("Alpha nameserver");
    await openTicket("Beta invoice");
    await openTicket("Gamma mailbox");
    await adminPatchTicket(
      "admin-1",
      first,
      jsonRequest("http://localhost/patch", {
        status: "in_progress",
        priority: "urgent",
      }),
    );
    const page = await adminListTickets(
      "admin-1",
      new Request(
        "http://localhost/api/orbit/beyond-master/tickets?page=1&pageSize=2&sort=created",
      ),
    );
    const body = (await page.json()) as {
      tickets: { reference: string; subject: string; customerRef: string }[];
      total: number;
      pageSize: number;
      counts: { total: number; urgent: number; in_progress: number };
    };
    assert.equal(body.pageSize, 2);
    assert.equal(body.tickets.length, 2);
    assert.equal(body.total, 3);
    assert.equal(body.counts.total, 3);
    assert.equal(body.counts.urgent, 1);
    assert.equal(body.counts.in_progress, 1);
    assert.equal(
      body.tickets.some((ticket) => ticket.customerRef.includes("@")),
      false,
    );
    assert.equal(
      body.tickets[0]?.customerRef.includes(customer.customerUserId),
      false,
    );

    const searched = await adminListTickets(
      "admin-1",
      new Request(
        `http://localhost/api/orbit/beyond-master/tickets?q=${first}&priority=urgent&status=in_progress&category=hosting`,
      ),
    );
    const found = (await searched.json()) as {
      tickets: { reference: string }[];
      total: number;
    };
    assert.equal(found.total, 1);
    assert.equal(found.tickets[0]?.reference, first);

    const rejected = await adminListTickets(
      "admin-1",
      new Request(
        "http://localhost/api/orbit/beyond-master/tickets?pageSize=51",
      ),
    );
    assert.equal(rejected.status, 400);
  });

  it("returns ticket details, replies, notes, status, priority, and activity", async () => {
    setBeyondMasterTicketRepositoryForTests(createMemoryTicketRepository());
    setBeyondMasterTicketCustomerForTests(customer);
    const reference = await openTicket("Need a person", {
      handoff: true,
      domainName: "example.com",
    });
    const details = await adminGetTicket("admin-1", reference);
    const opened = (await details.json()) as {
      ticket: {
        handoff: boolean;
        domainName: string;
        activity: { action: string }[];
        description: string;
      };
    };
    assert.equal(opened.ticket.handoff, true);
    assert.equal(
      opened.ticket.activity.some((entry) => entry.action === "human_handoff"),
      true,
    );
    assert.equal(opened.ticket.domainName, "example.com");

    const ordinary = await openTicket("Ordinary question");
    const ordinaryView = await adminGetTicket("admin-1", ordinary);
    const plain = (await ordinaryView.json()) as {
      ticket: { handoff: boolean; activity: { action: string }[] };
    };
    assert.equal(plain.ticket.handoff, false);
    assert.equal(
      plain.ticket.activity.some((entry) => entry.action === "human_handoff"),
      false,
    );

    const previousDelivery = process.env.EMAIL_DELIVERY_ENABLED;
    const previousHost = process.env.SMTP_HOST;
    const previousFrom = process.env.SMTP_FROM;
    const previousKey = process.env.TRANSACTIONAL_EMAIL_API_KEY;
    delete process.env.EMAIL_DELIVERY_ENABLED;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_FROM;
    delete process.env.TRANSACTIONAL_EMAIL_API_KEY;
    const replied = await adminReply(
      "admin-1",
      reference,
      jsonRequest("http://localhost/reply", {
        body: "We are looking at example.com.",
      }),
    );
    if (previousDelivery === undefined)
      delete process.env.EMAIL_DELIVERY_ENABLED;
    else process.env.EMAIL_DELIVERY_ENABLED = previousDelivery;
    if (previousHost === undefined) delete process.env.SMTP_HOST;
    else process.env.SMTP_HOST = previousHost;
    if (previousFrom === undefined) delete process.env.SMTP_FROM;
    else process.env.SMTP_FROM = previousFrom;
    if (previousKey === undefined)
      delete process.env.TRANSACTIONAL_EMAIL_API_KEY;
    else process.env.TRANSACTIONAL_EMAIL_API_KEY = previousKey;
    const replyBody = (await replied.json()) as {
      emailDelivered: boolean;
      emailNotice: string;
      ticket: { messages: { body: string }[] };
    };
    assert.equal(replyBody.emailDelivered, false);
    assert.equal(
      replyBody.emailNotice,
      "Reply saved successfully. Email notification is not configured.",
    );
    assert.equal(
      JSON.stringify(replyBody).toLowerCase().includes("email sent"),
      false,
    );
    assert.equal(
      JSON.stringify(replyBody).toLowerCase().includes("emailed"),
      false,
    );
    assert.equal(
      replyBody.ticket.messages.some((message) =>
        message.body.includes("example.com"),
      ),
      true,
    );

    const noted = await adminNote(
      "admin-1",
      reference,
      jsonRequest("http://localhost/note", {
        body: "Internal billing review only.",
      }),
    );
    const noteBody = (await noted.json()) as {
      hiddenFromCustomer: boolean;
      ticket: {
        internalNotes: { body: string }[];
        activity: { action: string }[];
      };
    };
    assert.equal(noteBody.hiddenFromCustomer, true);
    assert.equal(
      noteBody.ticket.internalNotes.some((message) =>
        message.body.includes("Internal"),
      ),
      true,
    );
    assert.equal(
      noteBody.ticket.activity.some(
        (entry) => entry.action === "internal_note",
      ),
      true,
    );

    const customerView = await getCustomerTicket(
      new Request("http://localhost/customer"),
      reference,
    );
    const visible = JSON.stringify(await customerView.json());
    assert.equal(visible.includes("Internal billing"), false);
    assert.equal(visible.includes("internalNotes"), false);

    const patched = await adminPatchTicket(
      "admin-1",
      reference,
      jsonRequest("http://localhost/patch", {
        status: "waiting_support",
        priority: "high",
      }),
    );
    const updated = (await patched.json()) as {
      ticket: {
        status: string;
        priority: string;
        activity: { action: string }[];
      };
    };
    assert.equal(updated.ticket.status, "waiting_support");
    assert.equal(updated.ticket.priority, "high");
    assert.equal(
      updated.ticket.activity.some((entry) => entry.action === "status"),
      true,
    );
    assert.equal(
      updated.ticket.activity.some((entry) => entry.action === "priority"),
      true,
    );

    const badStatus = await adminPatchTicket(
      "admin-1",
      reference,
      jsonRequest("http://localhost/patch", { status: "OPEN" }),
    );
    assert.equal(badStatus.status, 400);
    const badPriority = await adminPatchTicket(
      "admin-1",
      reference,
      jsonRequest("http://localhost/patch", { priority: "CRITICAL" }),
    );
    assert.equal(badPriority.status, 400);

    const missing = await adminGetTicket("admin-1", "BM-999999");
    assert.equal(missing.status, 404);
    const leaked = await adminNote(
      "admin-1",
      "BM-999999",
      jsonRequest("http://localhost/note", { body: "Wrong ticket note." }),
    );
    assert.equal(leaked.status, 404);
    const still = await adminGetTicket("admin-1", ordinary);
    const stillBody = JSON.stringify(await still.json());
    assert.equal(stillBody.includes("Wrong ticket note"), false);
    assert.equal(stillBody.includes("Internal billing"), false);
  });
});
