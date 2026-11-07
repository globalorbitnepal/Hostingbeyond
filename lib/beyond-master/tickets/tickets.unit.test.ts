import assert from "node:assert/strict";
import { describe, it, afterEach } from "node:test";

import { POST as chatPost } from "@/app/api/beyond-master/chat/route";
import { setBeyondMasterChatTestOverride } from "@/lib/beyond-master/chat-test-hook";
import {
  classifySupportIntent,
  wantsHumanStaff,
} from "@/lib/beyond-master/tickets/intent";
import {
  adminListTickets,
  adminNote,
  adminPatchTicket,
  getCustomerTicket,
  postCustomerReply,
  postTicketCancel,
  postTicketDraft,
  postTicketSubmit,
  setBeyondMasterTicketCustomerForTests,
  setEnqueueHumanSupportForTests,
  supportEventForChat,
} from "@/lib/beyond-master/tickets/http";
import { createMemoryTicketRepository } from "@/lib/beyond-master/tickets/memory";
import { setBeyondMasterTicketRepositoryForTests } from "@/lib/beyond-master/tickets/repository";
import { validateAttachment } from "@/lib/beyond-master/tickets/validate";

const customer = { customerUserId: "customer-a", email: "a@example.com" };

function jsonRequest(
  url: string,
  body: unknown,
  headers?: Record<string, string>,
) {
  return new Request(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-real-ip": "203.0.113.50",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("beyond master tickets", () => {
  afterEach(() => {
    setBeyondMasterTicketCustomerForTests(null);
    setBeyondMasterTicketRepositoryForTests(null);
    setBeyondMasterChatTestOverride(null);
    setEnqueueHumanSupportForTests(null);
  });

  it("treats speak-to-human phrasing as staff queue, not a ticket draft", () => {
    assert.equal(
      wantsHumanStaff(
        "I want to speak to a human for support. Please queue this conversation for staff.",
      ),
      true,
    );
    assert.equal(
      wantsHumanStaff("Show me your hosting plans and prices."),
      false,
    );
  });

  it("does not create a ticket from a problem mention or a natural-language yes", async () => {
    const memory = createMemoryTicketRepository();
    setBeyondMasterTicketRepositoryForTests(memory);
    const offer = await supportEventForChat(
      "My website is down.",
      customer.customerUserId,
    );
    assert.equal(offer?.kind, "details");
    assert.equal("confirmationId" in (offer ?? {}), false);
    const spoken = await supportEventForChat(
      "Yes, create the ticket now.",
      customer.customerUserId,
    );
    assert.equal(spoken, null);
    assert.equal(
      classifySupportIntent("My email is not working.").kind,
      "offer",
    );
  });

  it("prepares a review and creates a ticket only after confirmation", async () => {
    const memory = createMemoryTicketRepository();
    setBeyondMasterTicketRepositoryForTests(memory);
    setBeyondMasterTicketCustomerForTests(customer);
    const review = await supportEventForChat(
      "Please contact technical support. example.com website is down.",
      customer.customerUserId,
    );
    assert.equal(review?.kind, "review");
    if (review?.kind !== "review") return;
    const created = await postTicketSubmit(
      jsonRequest("http://localhost/api/beyond-master/tickets", {
        confirmationId: review.confirmationId,
      }),
    );
    const payload = (await created.json()) as {
      reference: string;
      duplicate: boolean;
      notification: { customerDelivered: boolean; supportDelivered: boolean };
    };
    assert.equal(created.status, 200);
    assert.match(payload.reference, /^BM-\d+$/);
    assert.equal(payload.reference.includes("c"), false);
    assert.equal(payload.duplicate, false);
    assert.equal(payload.notification.customerDelivered, false);
    assert.equal(payload.notification.supportDelivered, false);
    const again = await postTicketSubmit(
      jsonRequest("http://localhost/api/beyond-master/tickets", {
        confirmationId: review.confirmationId,
      }),
    );
    const duplicate = (await again.json()) as {
      reference: string;
      duplicate: boolean;
    };
    assert.equal(duplicate.duplicate, true);
    assert.equal(duplicate.reference, payload.reference);
  });

  it("cancels a prepared request and blocks a later submit", async () => {
    setBeyondMasterTicketRepositoryForTests(createMemoryTicketRepository());
    setBeyondMasterTicketCustomerForTests(customer);
    const prepared = await postTicketDraft(
      jsonRequest("http://localhost/api/beyond-master/tickets/drafts", {
        category: "billing",
        priority: "normal",
        subject: "Invoice question",
        description: "I have a billing problem with the latest invoice.",
      }),
    );
    const draft = (await prepared.json()) as { confirmationId: string };
    const cancelled = await postTicketCancel(
      jsonRequest("http://localhost/cancel", {}),
      draft.confirmationId,
    );
    assert.equal(cancelled.status, 200);
    const submitted = await postTicketSubmit(
      jsonRequest("http://localhost/api/beyond-master/tickets", {
        confirmationId: draft.confirmationId,
      }),
    );
    assert.equal(submitted.status, 409);
  });

  it("keeps ticket references unique and hides another customer's ticket", async () => {
    const memory = createMemoryTicketRepository();
    setBeyondMasterTicketRepositoryForTests(memory);
    setBeyondMasterTicketCustomerForTests(customer);
    const first = await postTicketDraft(
      jsonRequest("http://localhost/api/beyond-master/tickets/drafts", {
        category: "account",
        subject: "Login help",
        description: "I need human assistance with my account login.",
        handoff: true,
      }),
    );
    const firstId = ((await first.json()) as { confirmationId: string })
      .confirmationId;
    const other = { customerUserId: "customer-b", email: "b@example.com" };
    setBeyondMasterTicketCustomerForTests(other);
    const second = await postTicketDraft(
      jsonRequest("http://localhost/api/beyond-master/tickets/drafts", {
        category: "payment",
        subject: "Card charge",
        description: "I have a payment problem on the latest charge.",
      }),
    );
    const secondId = ((await second.json()) as { confirmationId: string })
      .confirmationId;
    const ticketA = await postTicketSubmit(
      jsonRequest("http://localhost/api/beyond-master/tickets", {
        confirmationId: secondId,
      }),
    );
    setBeyondMasterTicketCustomerForTests(customer);
    const ticketB = await postTicketSubmit(
      jsonRequest("http://localhost/api/beyond-master/tickets", {
        confirmationId: firstId,
      }),
    );
    const refA = ((await ticketA.json()) as { reference: string }).reference;
    const refB = ((await ticketB.json()) as { reference: string }).reference;
    assert.notEqual(refA, refB);
    const hidden = await getCustomerTicket(
      new Request(`http://localhost/api/beyond-master/tickets/${refA}`),
      refA,
    );
    assert.equal(hidden.status, 404);
    const own = await getCustomerTicket(
      new Request(`http://localhost/api/beyond-master/tickets/${refB}`),
      refB,
    );
    const ownBody = (await own.json()) as {
      ticket: { handoff: boolean; messages: unknown[] };
    };
    assert.equal(ownBody.ticket.handoff, true);
    const reply = await postCustomerReply(
      jsonRequest(
        `http://localhost/api/beyond-master/tickets/${refB}/replies`,
        {
          body: "Here is another detail.",
        },
      ),
      refB,
    );
    assert.equal(reply.status, 200);
    const replied = (await reply.json()) as {
      ticket: { status: string; messages: unknown[] };
    };
    assert.equal(replied.ticket.status, "waiting_support");
    assert.equal(replied.ticket.messages.length, 2);
  });

  it("rejects guests, bad input, cross-site posts, and extra draft requests", async () => {
    setBeyondMasterTicketRepositoryForTests(createMemoryTicketRepository());
    const guest = await postTicketDraft(
      jsonRequest("http://localhost/api/beyond-master/tickets/drafts", {
        category: "other",
        subject: "Need help",
        description: "Please contact technical support about this.",
      }),
    );
    assert.equal(guest.status, 401);
    setBeyondMasterTicketCustomerForTests(customer);
    const invalid = await postTicketDraft(
      jsonRequest("http://localhost/api/beyond-master/tickets/drafts", {
        category: "website",
        subject: "Down",
        description: "My website is down and I need technical support.",
        customerId: "someone-else",
      }),
    );
    assert.equal(invalid.status, 400);
    const crossSite = await postTicketSubmit(
      jsonRequest(
        "http://localhost/api/beyond-master/tickets",
        { confirmationId: "cfm_abcdefghijklmnopqrst" },
        { origin: "https://evil.example", host: "localhost" },
      ),
    );
    assert.equal(crossSite.status, 403);
    let last = 200;
    for (let index = 0; index < 9; index += 1) {
      const response = await postTicketDraft(
        jsonRequest(
          "http://localhost/api/beyond-master/tickets/drafts",
          {
            category: "other",
            subject: `Help ${index}`,
            description: `Please contact technical support about issue number ${index}.`,
          },
          { "x-real-ip": "203.0.113.99" },
        ),
      );
      last = response.status;
    }
    assert.equal(last, 429);
  });

  it("enforces admin permission, status, priority, and private notes", async () => {
    const memory = createMemoryTicketRepository();
    setBeyondMasterTicketRepositoryForTests(memory);
    setBeyondMasterTicketCustomerForTests(customer);
    const headers = { "x-real-ip": "203.0.113.77" };
    const prepared = await postTicketDraft(
      jsonRequest(
        "http://localhost/api/beyond-master/tickets/drafts",
        {
          category: "hosting",
          subject: "Hosting help",
          description: "Please contact technical support about hosting.",
        },
        headers,
      ),
    );
    const confirmationId = (
      (await prepared.json()) as { confirmationId: string }
    ).confirmationId;
    const created = await postTicketSubmit(
      jsonRequest(
        "http://localhost/api/beyond-master/tickets",
        { confirmationId },
        headers,
      ),
    );
    const reference = ((await created.json()) as { reference: string })
      .reference;
    const denied = await adminListTickets(
      null,
      new Request("http://localhost/api/orbit/beyond-master/tickets"),
    );
    assert.equal(denied.status, 401);
    const patched = await adminPatchTicket(
      "admin-1",
      reference,
      jsonRequest(
        "http://localhost/patch",
        { status: "in_progress", priority: "urgent", assigneeId: "admin-1" },
        headers,
      ),
    );
    assert.equal(patched.status, 200);
    const noted = await adminNote(
      "admin-1",
      reference,
      jsonRequest("http://localhost/note", {
        body: "Internal billing review only.",
      }),
    );
    const noteBody = (await noted.json()) as { hiddenFromCustomer: boolean };
    assert.equal(noteBody.hiddenFromCustomer, true);
    const customerView = await getCustomerTicket(
      new Request(`http://localhost/api/beyond-master/tickets/${reference}`),
      reference,
    );
    const visible = (await customerView.json()) as {
      ticket: { messages: { body: string }[]; priority: string };
    };
    assert.equal(
      visible.ticket.messages.some((message) =>
        message.body.includes("Internal"),
      ),
      false,
    );
    assert.equal(visible.ticket.priority, "urgent");
  });

  it("reports an unavailable database and an AI provider failure without a fake ticket", async () => {
    const memory = createMemoryTicketRepository();
    setBeyondMasterTicketRepositoryForTests({
      ...memory,
      prepareDraft: async () => ({
        ok: false,
        status: 503,
        code: "database",
        error: "Support tickets could not be saved. Nothing was confirmed.",
      }),
    });
    const failed = await supportEventForChat(
      "Please contact technical support about example.com.",
      customer.customerUserId,
    );
    assert.equal(failed?.kind, "unavailable");
    assert.equal(JSON.stringify(failed).includes("BM-"), false);

    setBeyondMasterTicketRepositoryForTests(createMemoryTicketRepository());
    setBeyondMasterTicketCustomerForTests(customer);
    setBeyondMasterChatTestOverride(async function* () {
      throw new Error("provider down");
    });
    const previous = process.env.BEYOND_MASTER_AI_API_KEY;
    delete process.env.BEYOND_MASTER_AI_API_KEY;
    try {
      const response = await chatPost(
        jsonRequest("http://localhost/api/beyond-master/chat", {
          messages: [
            {
              role: "user",
              content: "Please contact technical support. example.com is down.",
            },
          ],
        }),
      );
      const text = await response.text();
      assert.match(text, /event: support/);
      assert.match(text, /event: error/);
      assert.equal(text.includes("BM-"), false);
    } finally {
      if (previous === undefined) delete process.env.BEYOND_MASTER_AI_API_KEY;
      else process.env.BEYOND_MASTER_AI_API_KEY = previous;
    }
  });

  it("rejects a domain id the customer does not own", async () => {
    const memory = createMemoryTicketRepository();
    memory.seedOwnership(customer.customerUserId, "c123456789", "example.com");
    setBeyondMasterTicketRepositoryForTests(memory);
    setBeyondMasterTicketCustomerForTests(customer);
    const response = await postTicketDraft(
      jsonRequest(
        "http://localhost/api/beyond-master/tickets/drafts",
        {
          category: "dns",
          subject: "DNS help",
          description: "Please contact technical support about this DNS zone.",
          domainId: "c987654321",
        },
        { "x-real-ip": "203.0.113.78" },
      ),
    );
    assert.equal(response.status, 403);
  });

  it("rejects unsafe attachments", () => {
    assert.equal(
      validateAttachment({
        fileName: "note.txt",
        contentType: "text/plain",
        sizeBytes: 12,
      }).ok,
      true,
    );
    assert.equal(
      validateAttachment({
        fileName: "../x.html",
        contentType: "text/html",
        sizeBytes: 12,
      }).ok,
      false,
    );
  });

  it("does not claim a guest is queued when the enqueue fails", async () => {
    // No thread id => the backend never attempts an enqueue, so the reply must
    // not tell the guest their conversation is already in the staff queue.
    const notQueued = await supportEventForChat(
      "I want to talk to a human.",
      null,
      { threadId: null, guestCapabilityToken: null },
    );
    assert.equal(notQueued?.kind, "human_queue");
    assert.equal("queued" in (notQueued ?? {}), true);
    assert.equal(
      (notQueued as { queued?: boolean }).queued,
      false,
      "must not report queued without a confirmed backend write",
    );
    assert.match(
      String((notQueued as { message?: string }).message),
      /couldn't reach the support queue/i,
    );
    assert.equal(
      /queued for staff|review your support request/i.test(
        String((notQueued as { message?: string }).message),
      ),
      false,
    );
  });

  it("enqueues a signed-in customer with their verified id, not as a guest", async () => {
    const seen: { customerUserId: string | null; guest: string | null }[] = [];
    setEnqueueHumanSupportForTests(async (input) => {
      seen.push({
        customerUserId: input.customerUserId,
        guest: input.guestCapabilityToken ?? null,
      });
      return { ok: true };
    });
    const event = await supportEventForChat(
      "I want to talk to a human.",
      "customer-a",
      { threadId: "thread-customer-01", guestCapabilityToken: "stolen-guest" },
    );
    assert.equal(event?.kind, "human_queue");
    assert.equal((event as { queued?: boolean }).queued, true);
    assert.equal(seen.length, 1);
    assert.equal(seen[0]?.customerUserId, "customer-a");
    assert.equal(seen[0]?.guest, null);
    assert.match(
      String((event as { message?: string }).message),
      /specialist to continue this chat/i,
    );
  });

  it("enqueues a guest with their capability token and no customer id", async () => {
    const seen: { customerUserId: string | null; guest: string | null }[] = [];
    setEnqueueHumanSupportForTests(async (input) => {
      seen.push({
        customerUserId: input.customerUserId,
        guest: input.guestCapabilityToken ?? null,
      });
      return { ok: true, guestCapabilityToken: "issued-token" };
    });
    const event = await supportEventForChat(
      "I want to talk to a human.",
      null,
      { threadId: "thread-guest-0001", guestCapabilityToken: "guest-token" },
    );
    assert.equal(event?.kind, "human_queue");
    assert.equal((event as { queued?: boolean }).queued, true);
    assert.equal(seen[0]?.customerUserId, null);
    assert.equal(seen[0]?.guest, "guest-token");
    assert.equal(
      (event as { guestCapabilityToken?: string }).guestCapabilityToken,
      "issued-token",
    );
  });

  it("does not claim success when the queue write fails", async () => {
    setEnqueueHumanSupportForTests(async () => ({
      ok: false,
      reason: "forbidden",
    }));
    const event = await supportEventForChat(
      "I want to talk to a human.",
      "customer-a",
      { threadId: "thread-customer-02" },
    );
    assert.equal((event as { queued?: boolean }).queued, false);
    assert.match(
      String((event as { message?: string }).message),
      /couldn't reach the support queue/i,
    );
  });

  it("queues speak-to-human requests instead of opening a ticket review card", async () => {
    setEnqueueHumanSupportForTests(async () => ({ ok: true }));
    const event = await supportEventForChat(
      "I want to speak to a human for support. Please queue this conversation for staff.",
      "customer-a",
      { threadId: "thread-customer-03" },
    );
    assert.equal(event?.kind, "human_queue");
    assert.equal((event as { queued?: boolean }).queued, true);
    assert.equal(event?.kind === "review", false);
  });
});
