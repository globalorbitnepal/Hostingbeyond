import "@/lib/test/integration-env-loader";

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { readCustomerAccount } from "@/lib/beyond-master/account/read";
import { prismaAccountReader } from "@/lib/beyond-master/account/prisma-reader";
import { prismaDnsStore } from "@/lib/beyond-master/dns/prisma-store";
import { reconcileObservedDns } from "@/lib/beyond-master/dns/reconcile";
import {
  cancelDnsProposal,
  confirmDnsProposal,
  proposeDnsChange,
} from "@/lib/beyond-master/dns/workflow";
import {
  adminCreateKnowledge,
  adminUpdateKnowledge,
} from "@/lib/beyond-master/knowledge/manage";
import { buildBeyondMasterSystemPrompt } from "@/lib/beyond-master/knowledge/build";
import { parseBeyondMasterChatRequest } from "@/lib/beyond-master/request";
import { allowBeyondMasterChat } from "@/lib/beyond-master/rate-limit";
import { streamBeyondMasterProvider } from "@/lib/beyond-master/providers/stream";
import {
  adminGetTicket,
  adminListTickets,
  adminNote,
  adminReply,
  getCustomerTicket,
  postCustomerReply,
  postTicketDraft,
  postTicketSubmit,
} from "@/lib/beyond-master/tickets/http";
import {
  createCustomerSession,
  destroyCustomerSession,
  CUSTOMER_SESSION_COOKIE,
} from "@/lib/customer/session";
import {
  createAdminSession,
  destroyAdminSession,
  ensureOrbitAdmin,
  getSessionAdmin,
} from "@/lib/orbit/session";
import { prisma } from "@/lib/prisma";
import {
  assertIntegrationDatabaseTarget,
  shouldRunDatabaseIntegrationTests,
} from "@/lib/test/integration-gate";

const stamp = Date.now().toString(36);
const domainA = `staging-a-${stamp}.example`;
const domainB = `staging-b-${stamp}.example`;

function customerRequest(
  path: string,
  token: string,
  body?: unknown,
  ip = "203.0.113.41",
) {
  return new Request(`http://127.0.0.1:55432${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      host: "127.0.0.1:55432",
      origin: "http://127.0.0.1:55432",
      "content-type": "application/json",
      "x-real-ip": ip,
      cookie: `${CUSTOMER_SESSION_COOKIE}=${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe(
  "beyond master staging database",
  { skip: !shouldRunDatabaseIntegrationTests(), concurrency: 1 },
  () => {
    it("keeps customer, ticket, knowledge, and DNS data inside this database", async () => {
      // Host/database/role isolation is enforced from DATABASE_URL before any write.
      assertIntegrationDatabaseTarget();
      // Do not compare inet_server_port() with 55432: that is the host-published
      // port (docker -p 55432:5432 / local CI mirror). Inside the PostgreSQL
      // container the listener is 5432, so the comparison fails on GitHub Actions
      // while still proving nothing extra about isolation.
      const database = await prisma.$queryRaw<
        { name: string }[]
      >`SELECT current_database() AS name`;
      assert.equal(database[0]?.name, "hostingbeyond_integration_test");

      const alice = await prisma.customerUser.create({
        data: {
          email: `staging-alice-${stamp}@example.test`,
          name: "Staging Alice",
        },
      });
      const bob = await prisma.customerUser.create({
        data: {
          email: `staging-bob-${stamp}@example.test`,
          name: "Staging Bob",
        },
      });
      const aliceSession = await createCustomerSession(alice.id);
      const bobSession = await createCustomerSession(bob.id);
      try {
        await prisma.domainRegistration.create({
          data: {
            userId: alice.id,
            domain: domainA,
            tld: "example",
            status: "ACTIVE",
          },
        });
        await prisma.domainRegistration.create({
          data: {
            userId: bob.id,
            domain: domainB,
            tld: "example",
            status: "ACTIVE",
          },
        });
        await prisma.customerWallet.create({
          data: { userId: alice.id, balance: "12.50", currency: "USD" },
        });
        await prisma.customerWallet.create({
          data: { userId: bob.id, balance: "99.00", currency: "USD" },
        });
        await prisma.hostingOrder.create({
          data: {
            userId: alice.id,
            productSlug: "staging-hosting",
            planKey: "basic",
            billingCycle: "monthly",
            subtotal: "5.00",
            total: "5.00",
          },
        });
        await prisma.invoice.create({
          data: {
            publicId: `inv_${stamp}`,
            invoiceNumber: `STG-${stamp}`,
            userId: alice.id,
            subtotal: "5.00",
            total: "5.00",
            sourceType: "DOMAIN_ORDER",
            sourceId: `src_${stamp}`,
          },
        });
        await prisma.walletTransaction.create({
          data: {
            userId: alice.id,
            type: "CREDIT",
            status: "COMPLETED",
            amount: "12.50",
          },
        });
        await prisma.walletPayment.create({
          data: {
            publicId: `pay_${stamp}`,
            userId: alice.id,
            amount: "12.50",
            status: "SUCCEEDED",
            idempotencyKey: `pay-key-${stamp}`,
            providerCheckoutSessionId: "cs_test_should_not_leak",
            providerPaymentIntentId: "pi_test_should_not_leak",
          },
        });

        const own = await readCustomerAccount({
          userId: alice.id,
          message:
            "Show my domains, hosting, invoices, payments, and wallet balance.",
          reader: prismaAccountReader,
        });
        const ownJson = JSON.stringify(own);
        assert.match(ownJson, new RegExp(domainA));
        assert.equal(ownJson.includes(domainB), false);
        assert.match(ownJson, /12\.50/);
        assert.equal(ownJson.includes("99.00"), false);
        assert.equal(ownJson.includes("cs_test_should_not_leak"), false);
        assert.equal(ownJson.includes("pi_test_should_not_leak"), false);
        assert.equal(ownJson.includes("passwordHash"), false);
        const bobRead = await readCustomerAccount({
          userId: bob.id,
          message: "Show my domains and wallet balance.",
          reader: prismaAccountReader,
        });
        const bobJson = JSON.stringify(bobRead);
        assert.equal(bobJson.includes(domainA), false);
        assert.match(bobJson, new RegExp(domainB));
        assert.match(bobJson, /99\.00/);
        assert.equal(bobJson.includes("12.50"), false);

        const spoofed = parseBeyondMasterChatRequest({
          message: "Hello",
          customerId: bob.id,
          userId: bob.id,
        });
        assert.equal(spoofed.ok, false);

        const draftResponse = await postTicketDraft(
          customerRequest(
            "/api/beyond-master/tickets/drafts",
            aliceSession.token,
            {
              category: "billing",
              subject: "Staging invoice question",
              description:
                "Please explain this staging invoice without contacting anyone.",
              customerId: bob.id,
            },
          ),
        );
        assert.equal(draftResponse.status, 400);
        const draftOk = await postTicketDraft(
          customerRequest(
            "/api/beyond-master/tickets/drafts",
            aliceSession.token,
            {
              category: "billing",
              subject: "Staging invoice question",
              description:
                "Please explain this staging invoice without contacting anyone.",
            },
            "203.0.113.42",
          ),
        );
        assert.equal(draftOk.status, 200, await draftOk.clone().text());
        const draft = (await draftOk.json()) as { confirmationId: string };
        const first = await postTicketSubmit(
          customerRequest(
            "/api/beyond-master/tickets",
            aliceSession.token,
            { confirmationId: draft.confirmationId },
            "203.0.113.43",
          ),
        );
        const firstBody = (await first.json()) as {
          reference: string;
          duplicate: boolean;
          notification: { customerDelivered: boolean };
        };
        assert.equal(first.status, 200);
        assert.equal(firstBody.duplicate, false);
        assert.equal(firstBody.notification.customerDelivered, false);
        const second = await postTicketSubmit(
          customerRequest(
            "/api/beyond-master/tickets",
            aliceSession.token,
            { confirmationId: draft.confirmationId },
            "203.0.113.44",
          ),
        );
        const secondBody = (await second.json()) as {
          reference: string;
          duplicate: boolean;
        };
        assert.equal(secondBody.reference, firstBody.reference);
        assert.equal(secondBody.duplicate, true);
        const hidden = await getCustomerTicket(
          customerRequest(
            `/api/beyond-master/tickets/${firstBody.reference}`,
            bobSession.token,
          ),
          firstBody.reference,
        );
        assert.equal(hidden.status, 404);

        const admin = await ensureOrbitAdmin();
        const adminSession = await createAdminSession(admin.id);
        assert.equal((await getSessionAdmin(adminSession.token))?.id, admin.id);
        const noted = await adminNote(
          admin.id,
          firstBody.reference,
          new Request("http://127.0.0.1:55432/note", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ body: "operator-only-staging-note" }),
          }),
        );
        assert.equal(noted.status, 200);
        const customerView = await getCustomerTicket(
          customerRequest(
            `/api/beyond-master/tickets/${firstBody.reference}`,
            aliceSession.token,
          ),
          firstBody.reference,
        );
        const customerJson = await customerView.text();
        assert.equal(
          customerJson.includes("operator-only-staging-note"),
          false,
        );
        const adminView = await adminGetTicket(admin.id, firstBody.reference);
        assert.match(await adminView.text(), /operator-only-staging-note/);
        const replied = await adminReply(
          admin.id,
          firstBody.reference,
          new Request("http://127.0.0.1:55432/reply", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              body: "Staging support can see the invoice.",
            }),
          }),
        );
        const replyJson = (await replied.json()) as { emailDelivered: boolean };
        assert.equal(replyJson.emailDelivered, false);
        const customerReply = await postCustomerReply(
          customerRequest(
            `/api/beyond-master/tickets/${firstBody.reference}/replies`,
            aliceSession.token,
            { body: "Thanks, that answers the staging invoice." },
            "203.0.113.45",
          ),
          firstBody.reference,
        );
        assert.equal(
          customerReply.status,
          200,
          await customerReply.clone().text(),
        );
        const queue = await adminListTickets(
          admin.id,
          new Request(
            "http://127.0.0.1:55432/api/orbit/beyond-master/tickets?page=1&pageSize=20",
          ),
        );
        assert.equal(queue.status, 200);
        assert.equal(
          (
            await adminListTickets(
              null,
              new Request(
                "http://127.0.0.1:55432/api/orbit/beyond-master/tickets",
              ),
            )
          ).status,
          401,
        );
        await destroyAdminSession(adminSession.token);
        assert.equal(await getSessionAdmin(adminSession.token), null);

        const createdArticle = await adminCreateKnowledge(
          admin.id,
          new Request("http://127.0.0.1:55432/knowledge", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              title: "Staging support article",
              slug: "technical-support",
              category: "support",
              body: "Customers can open a staging ticket from the account page. This published override is for the staging test.",
              published: true,
              sourceNote: "operator-only-source-note",
            }),
          }),
        );
        assert.equal(createdArticle.status, 201);
        const published = await buildBeyondMasterSystemPrompt(
          "How do I contact technical support?",
        );
        assert.match(published, /staging ticket/);
        assert.equal(published.includes("operator-only-source-note"), false);
        const articleId = (
          (await createdArticle.json()) as { article: { id: string } }
        ).article.id;
        const unpublished = await adminUpdateKnowledge(
          admin.id,
          articleId,
          new Request("http://127.0.0.1:55432/knowledge", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              title: "Staging support article",
              slug: "technical-support",
              category: "support",
              body: "Customers can open a staging ticket from the account page. This unpublished copy must not replace the built-in article.",
              published: false,
              sourceNote: "operator-only-source-note",
            }),
          }),
        );
        assert.equal(unpublished.status, 200);
        const fallback = await buildBeyondMasterSystemPrompt(
          "How do I contact technical support?",
        );
        assert.equal(fallback.includes("staging ticket"), false);
        assert.match(fallback, /support/i);

        let writes = 0;
        const records = [
          {
            recordId: "rec-a",
            type: "A",
            host: "www",
            value: "203.0.113.10",
            ttl: 3600,
            distance: 0,
          },
        ];
        const ports = {
          now: () => new Date(),
          own: async (userId: string, domain: string) => {
            const row = await prisma.domainRegistration.findFirst({
              where: { userId, domain },
            });
            return row
              ? { ok: true as const, domain: row.domain }
              : {
                  ok: false as const,
                  status: 404,
                  error: "That domain was not found.",
                };
          },
          list: async () => ({ ok: true as const, records }),
          write: async () => {
            writes += 1;
            records[0] = { ...records[0], value: "203.0.113.20" };
            return { ok: true as const };
          },
          audit: async () => undefined,
        };
        const denied = await proposeDnsChange({
          userId: alice.id,
          domain: domainB,
          action: "update",
          type: "A",
          host: "www",
          value: "203.0.113.20",
          ports,
          store: prismaDnsStore(),
        });
        assert.equal(denied.ok, false);
        const proposed = await proposeDnsChange({
          userId: alice.id,
          domain: domainA,
          action: "update",
          type: "A",
          host: "www",
          value: "203.0.113.20",
          ports,
          store: prismaDnsStore(),
        });
        assert.equal(proposed.ok, true);
        if (!proposed.ok) return;
        assert.equal(
          JSON.stringify(proposed.proposal).includes("claimToken"),
          false,
        );
        const cancelled = await proposeDnsChange({
          userId: alice.id,
          domain: domainA,
          action: "update",
          type: "A",
          host: "www",
          value: "203.0.113.21",
          ports,
          store: prismaDnsStore(),
        });
        assert.equal(cancelled.ok, true);
        if (!cancelled.ok) return;
        await cancelDnsProposal({
          userId: alice.id,
          publicId: cancelled.proposal.publicId,
          store: prismaDnsStore(),
        });
        const afterCancel = await confirmDnsProposal({
          userId: alice.id,
          publicId: cancelled.proposal.publicId,
          ports,
          store: prismaDnsStore(),
        });
        assert.equal(afterCancel.ok, false);
        const confirmed = await Promise.all([
          confirmDnsProposal({
            userId: alice.id,
            publicId: proposed.proposal.publicId,
            ports,
            store: prismaDnsStore(),
          }),
          confirmDnsProposal({
            userId: alice.id,
            publicId: proposed.proposal.publicId,
            ports,
            store: prismaDnsStore(),
          }),
        ]);
        // Concurrent confirm is claimed atomically: exactly one caller performs
        // the provider write. The loser either sees "executing" (409 busy) or,
        // if the winner already finished, receives the stored executed proposal
        // as an idempotent replay. Both are safe, so assert the write count and
        // that no caller reports an unexpected failure.
        assert.equal(
          writes,
          1,
          JSON.stringify(
            confirmed.map((result) =>
              result.ok ? result.proposal.providerStatus : result.error,
            ),
          ),
        );
        assert.ok(
          confirmed.some((result) => result.ok),
          JSON.stringify(
            confirmed.map((result) => (result.ok ? "ok" : result.error)),
          ),
        );
        for (const result of confirmed) {
          if (result.ok) {
            assert.equal(result.proposal.status, "executed");
            continue;
          }
          assert.equal(result.status, 409);
          assert.match(result.error, /already executing/i);
        }
        let uncertainWrites = 0;
        const uncertainPorts = {
          ...ports,
          write: async () => {
            uncertainWrites += 1;
            return { ok: false as const, uncertain: true, error: "timeout" };
          },
        };
        const uncertainProposal = await proposeDnsChange({
          userId: alice.id,
          domain: domainA,
          action: "update",
          type: "A",
          host: "www",
          value: "203.0.113.30",
          ports: uncertainPorts,
          store: prismaDnsStore(),
        });
        assert.equal(uncertainProposal.ok, true);
        if (!uncertainProposal.ok) return;
        const uncertain = await confirmDnsProposal({
          userId: alice.id,
          publicId: uncertainProposal.proposal.publicId,
          ports: uncertainPorts,
          store: prismaDnsStore(),
        });
        assert.equal(uncertain.ok, false);
        await confirmDnsProposal({
          userId: alice.id,
          publicId: uncertainProposal.proposal.publicId,
          ports: uncertainPorts,
          store: prismaDnsStore(),
        });
        assert.equal(uncertainWrites, 1);
        const observed = reconcileObservedDns(
          {
            status: "executing",
            providerStatus: "uncertain",
            verified: null,
            action: "update",
            type: "A",
            host: "www",
            value: "203.0.113.30",
            recordId: "rec-a",
          },
          null,
        );
        assert.equal(observed.state, "unresolved");
        assert.equal(observed.writesAttempted, 0);

        const limited = new Request(
          "http://127.0.0.1:55432/api/beyond-master/chat",
          { headers: { "x-real-ip": `203.0.113.${stamp.slice(0, 2)}` } },
        );
        const rateEnv = {
          BEYOND_MASTER_AI_RATE_LIMIT: "1",
          BEYOND_MASTER_AI_RATE_WINDOW_MS: "60000",
        };
        // Authenticated bucket honours the configured limit (guests keep the
        // separate hard-coded hourly cap, so this must not be asserted for guests).
        assert.equal(
          await allowBeyondMasterChat(limited, rateEnv, "rate-limit-int-user"),
          true,
        );
        assert.equal(
          await allowBeyondMasterChat(limited, rateEnv, "rate-limit-int-user"),
          false,
        );
        let leaked = false;
        try {
          for await (const event of streamBeyondMasterProvider({
            config: {
              configured: true,
              provider: "openai",
              model: "gpt-test",
              baseUrl: "https://example.test/v1",
              apiKey: "sk-staging-secret-value",
              timeoutMs: 1000,
              maxOutputTokens: 16,
              rateLimit: 5,
              rateWindowMs: 60000,
              configurationError: null,
            },
            messages: [{ role: "user", content: "Hello" }],
            signal: new AbortController().signal,
            fetchImpl: async () =>
              new Response("sk-staging-secret-value", { status: 500 }),
          })) {
            if (JSON.stringify(event).includes("sk-staging")) leaked = true;
          }
        } catch (error) {
          assert.equal(String(error).includes("sk-staging"), false);
        }
        assert.equal(leaked, false);
      } finally {
        await prisma.walletPayment.deleteMany({
          where: { userId: { in: [alice.id, bob.id] } },
        });
        await prisma.walletTransaction.deleteMany({
          where: { userId: { in: [alice.id, bob.id] } },
        });
        await prisma.customerWallet.deleteMany({
          where: { userId: { in: [alice.id, bob.id] } },
        });
        await prisma.invoice.deleteMany({
          where: { userId: { in: [alice.id, bob.id] } },
        });
        await prisma.hostingOrder.deleteMany({
          where: { userId: { in: [alice.id, bob.id] } },
        });
        await prisma.domainRegistration.deleteMany({
          where: { userId: { in: [alice.id, bob.id] } },
        });
        await prisma.beyondMasterKnowledgeArticle.deleteMany({
          where: { slug: "technical-support" },
        });
        await destroyCustomerSession(aliceSession.token);
        await destroyCustomerSession(bobSession.token);
        await prisma.customerUser.deleteMany({
          where: { id: { in: [alice.id, bob.id] } },
        });
      }
    });
  },
);
