import "@/lib/test/integration-env-loader";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { afterEach, describe, it } from "node:test";

import type { CustomerUser } from "@prisma/client";

import {
  createCustomerSession,
  CUSTOMER_SESSION_COOKIE,
} from "@/lib/customer/session";
import { saveChatSnapshot } from "@/lib/beyond-master/history/store";
import {
  assignHumanSupportThread,
  enqueueThreadForHumanSupport,
} from "@/lib/beyond-master/human-support";
import { prisma } from "@/lib/prisma";
import { setOrbitAdminSessionTestOverride } from "@/lib/test/orbit-admin-session-test-control";
import {
  assertIntegrationDatabaseTarget,
  shouldRunDatabaseIntegrationTests,
} from "@/lib/test/integration-gate";

function jsonRequest(url: string, init: RequestInit & { json?: unknown } = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  const body =
    init.json !== undefined
      ? JSON.stringify(init.json)
      : (init.body ?? undefined);
  return new Request(url, { ...init, headers, body });
}

describe(
  "Beyond Master human support queue (integration)",
  { skip: !shouldRunDatabaseIntegrationTests(), concurrency: 1 },
  () => {
    const prevFull = process.env.ORBIT_FULL_ADMIN_IDS;
    const prevSupport = process.env.ORBIT_SUPPORT_STAFF_IDS;
    const prevLegacy = process.env.ORBIT_LEGACY_OPEN_ORBIT;

    afterEach(() => {
      process.env.ORBIT_FULL_ADMIN_IDS = prevFull;
      process.env.ORBIT_SUPPORT_STAFF_IDS = prevSupport;
      process.env.ORBIT_LEGACY_OPEN_ORBIT = prevLegacy;
      setOrbitAdminSessionTestOverride(null);
    });

    it("concurrent full-admin claims: exactly one assignHumanSupportThread succeeds", async () => {
      assertIntegrationDatabaseTarget();
      delete process.env.ORBIT_LEGACY_OPEN_ORBIT;

      const adminX = await prisma.adminUser.create({
        data: { displayName: `int-conc-x-${randomUUID().slice(0, 8)}` },
      });
      const adminY = await prisma.adminUser.create({
        data: { displayName: `int-conc-y-${randomUUID().slice(0, 8)}` },
      });
      process.env.ORBIT_FULL_ADMIN_IDS = `${adminX.id},${adminY.id}`;

      const concCustomer = await prisma.customerUser.create({
        data: { email: `int-conc-${randomUUID()}@hostingbeyond.local` },
      });
      const threadConc = `cc-${randomUUID().slice(0, 12)}`;
      const now = new Date().toISOString();
      await saveChatSnapshot({
        threadId: threadConc,
        customerUserId: concCustomer.id,
        title: "Concurrent",
        messages: [{ role: "user", body: "q", createdAt: now }],
      });
      const enq = await enqueueThreadForHumanSupport({
        threadId: threadConc,
        customerUserId: concCustomer.id,
        ticketReference: null,
      });
      assert.equal(enq.ok, true);

      const [a, b] = await Promise.all([
        assignHumanSupportThread({
          threadId: threadConc,
          adminUserId: adminX.id,
          allowClaimOpen: true,
        }),
        assignHumanSupportThread({
          threadId: threadConc,
          adminUserId: adminY.id,
          allowClaimOpen: true,
        }),
      ]);

      const oks = [a, b].filter((r) => r.ok);
      assert.equal(oks.length, 1);
      const loser = a.ok ? b : a;
      assert.equal(loser.ok, false);
      if (!loser.ok) assert.equal(loser.reason, "not_open");

      const row = await prisma.beyondMasterChatThread.findUniqueOrThrow({
        where: { id: threadConc },
        select: { supportAssignedAdminId: true, supportQueueStatus: true },
      });
      assert.equal(row.supportQueueStatus, "assigned");
      assert.ok(
        row.supportAssignedAdminId === adminX.id ||
          row.supportAssignedAdminId === adminY.id,
      );

      await prisma.beyondMasterChatThread.delete({ where: { id: threadConc } });
      await prisma.customerSession.deleteMany({
        where: { userId: concCustomer.id },
      });
      await prisma.customerUser.delete({ where: { id: concCustomer.id } });
      await prisma.adminUser.deleteMany({
        where: { id: { in: [adminX.id, adminY.id] } },
      });
    });

    it("guest and customer flows: assign, reply, isolation, reassign, close queue, resume AI", async () => {
      assertIntegrationDatabaseTarget();
      delete process.env.ORBIT_LEGACY_OPEN_ORBIT;

      const fullAdmin = await prisma.adminUser.create({
        data: { displayName: `int-full-${randomUUID().slice(0, 8)}` },
      });
      const supportA = await prisma.adminUser.create({
        data: { displayName: `int-sa-${randomUUID().slice(0, 8)}` },
      });
      const supportB = await prisma.adminUser.create({
        data: { displayName: `int-sb-${randomUUID().slice(0, 8)}` },
      });
      process.env.ORBIT_FULL_ADMIN_IDS = fullAdmin.id;
      process.env.ORBIT_SUPPORT_STAFF_IDS = `${supportA.id},${supportB.id}`;

      const threadGuest = `gst-${randomUUID()}`;
      const now = new Date().toISOString();
      const snapGuest = await saveChatSnapshot({
        threadId: threadGuest,
        customerUserId: null,
        title: "Guest chat",
        messages: [{ role: "user", body: "Hello", createdAt: now }],
      });
      assert.equal(snapGuest.saved, true);
      const guestTok = snapGuest.guestCapabilityToken;
      assert.ok(
        guestTok && typeof guestTok === "string" && guestTok.length >= 32,
        "guest token issued",
      );

      const enqGuest = await enqueueThreadForHumanSupport({
        threadId: threadGuest,
        customerUserId: null,
        ticketReference: null,
        guestCapabilityToken: guestTok,
      });
      assert.equal(enqGuest.ok, true);

      setOrbitAdminSessionTestOverride(async () => fullAdmin);
      const { POST: postQueue } =
        await import("@/app/api/orbit/beyond-master/support-queue/route");
      let res = await postQueue(
        jsonRequest("http://localhost/api/orbit/beyond-master/support-queue", {
          method: "POST",
          json: { action: "assign", threadId: threadGuest },
        }),
      );
      assert.equal(res.status, 200, await res.text());

      // Full admin assigns the claimed thread to the support-only staff member.
      res = await postQueue(
        jsonRequest("http://localhost/api/orbit/beyond-master/support-queue", {
          method: "POST",
          json: {
            action: "reassign",
            threadId: threadGuest,
            toAdminUserId: supportA.id,
          },
        }),
      );
      assert.equal(res.status, 200, await res.text());

      const { GET: getConversationsGuest } =
        await import("@/app/api/orbit/beyond-master/conversations/route");
      setOrbitAdminSessionTestOverride(async () => supportB);
      res = await getConversationsGuest(
        new Request(
          `http://localhost/api/orbit/beyond-master/conversations?id=${threadGuest}`,
        ),
      );
      assert.equal(res.status, 404);

      setOrbitAdminSessionTestOverride(async () => supportA);
      res = await postQueue(
        jsonRequest("http://localhost/api/orbit/beyond-master/support-queue", {
          method: "POST",
          json: {
            action: "message",
            threadId: threadGuest,
            body: "Staff reply",
          },
        }),
      );
      assert.equal(res.status, 200, await res.text());

      const { GET: getThreads } =
        await import("@/app/api/beyond-master/threads/route");
      res = await getThreads(
        new Request(
          `http://localhost/api/beyond-master/threads?id=${threadGuest}`,
          {
            headers: { "x-beyond-master-guest-token": guestTok! },
          },
        ),
      );
      assert.equal(res.status, 200);
      const guestBody = (await res.json()) as {
        thread: { messages: { body: string }[] };
      };
      assert.ok(
        guestBody.thread.messages.some((m) => m.body.includes("Staff reply")),
      );

      setOrbitAdminSessionTestOverride(async () => supportB);
      res = await postQueue(
        jsonRequest("http://localhost/api/orbit/beyond-master/support-queue", {
          method: "POST",
          json: { action: "assign", threadId: threadGuest },
        }),
      );
      assert.equal(res.status, 400);
      const assignFail = (await res.json()) as { error?: string };
      assert.match(assignFail.error ?? "", /claim_forbidden/i);

      res = await postQueue(
        jsonRequest("http://localhost/api/orbit/beyond-master/support-queue", {
          method: "POST",
          json: {
            action: "message",
            threadId: threadGuest,
            body: "Should be forbidden",
          },
        }),
      );
      assert.equal(res.status, 400);
      const msgFail = (await res.json()) as { error?: string };
      assert.equal(msgFail.error, "forbidden");

      setOrbitAdminSessionTestOverride(async () => supportA);
      res = await postQueue(
        jsonRequest("http://localhost/api/orbit/beyond-master/support-queue", {
          method: "POST",
          json: {
            action: "reassign",
            threadId: threadGuest,
            toAdminUserId: supportB.id,
          },
        }),
      );
      assert.equal(res.status, 403);

      setOrbitAdminSessionTestOverride(async () => fullAdmin);
      res = await postQueue(
        jsonRequest("http://localhost/api/orbit/beyond-master/support-queue", {
          method: "POST",
          json: {
            action: "reassign",
            threadId: threadGuest,
            toAdminUserId: supportB.id,
          },
        }),
      );
      assert.equal(res.status, 200, await res.text());

      setOrbitAdminSessionTestOverride(async () => supportA);
      res = await postQueue(
        jsonRequest("http://localhost/api/orbit/beyond-master/support-queue", {
          method: "POST",
          json: {
            action: "message",
            threadId: threadGuest,
            body: "from old assignee",
          },
        }),
      );
      assert.equal(res.status, 400);
      assert.equal(
        ((await res.json()) as { error?: string }).error,
        "forbidden",
      );

      setOrbitAdminSessionTestOverride(async () => supportB);
      res = await postQueue(
        jsonRequest("http://localhost/api/orbit/beyond-master/support-queue", {
          method: "POST",
          json: { action: "message", threadId: threadGuest, body: "From B" },
        }),
      );
      assert.equal(res.status, 200);

      await prisma.beyondMasterChatThread.update({
        where: { id: threadGuest },
        data: {
          supportQueueStatus: null,
          supportAssignedAdminId: null,
        },
      });
      const resume = await saveChatSnapshot({
        threadId: threadGuest,
        customerUserId: null,
        title: "Guest chat",
        messages: [{ role: "user", body: "Back to AI", createdAt: now }],
        guestCapabilityToken: guestTok,
      });
      assert.equal(resume.saved, true);

      const customerUser: CustomerUser = await prisma.customerUser.create({
        data: { email: `bm-cust-${randomUUID()}@hostingbeyond.local` },
      });
      const threadCust = `cst-${randomUUID()}`;
      await saveChatSnapshot({
        threadId: threadCust,
        customerUserId: customerUser.id,
        title: "Customer chat",
        messages: [{ role: "user", body: "Need human", createdAt: now }],
      });
      const enqCust = await enqueueThreadForHumanSupport({
        threadId: threadCust,
        customerUserId: customerUser.id,
        ticketReference: null,
      });
      assert.equal(enqCust.ok, true);

      setOrbitAdminSessionTestOverride(async () => fullAdmin);
      res = await postQueue(
        jsonRequest("http://localhost/api/orbit/beyond-master/support-queue", {
          method: "POST",
          json: { action: "assign", threadId: threadCust },
        }),
      );
      assert.equal(res.status, 200);

      // Route the customer thread to the support-only staff member so the
      // assignment checks below exercise the intended owner.
      res = await postQueue(
        jsonRequest("http://localhost/api/orbit/beyond-master/support-queue", {
          method: "POST",
          json: {
            action: "reassign",
            threadId: threadCust,
            toAdminUserId: supportA.id,
          },
        }),
      );
      assert.equal(res.status, 200, await res.text());

      setOrbitAdminSessionTestOverride(async () => supportB);
      res = await getConversationsGuest(
        new Request(
          `http://localhost/api/orbit/beyond-master/conversations?id=${threadCust}`,
        ),
      );
      assert.equal(res.status, 404);

      setOrbitAdminSessionTestOverride(async () => supportA);
      res = await postQueue(
        jsonRequest("http://localhost/api/orbit/beyond-master/support-queue", {
          method: "POST",
          json: {
            action: "message",
            threadId: threadCust,
            body: "Hello customer",
          },
        }),
      );
      assert.equal(res.status, 200);

      const { token } = await createCustomerSession(customerUser.id);
      res = await getThreads(
        new Request(
          `http://localhost/api/beyond-master/threads?id=${threadCust}`,
          {
            headers: {
              cookie: `${CUSTOMER_SESSION_COOKIE}=${encodeURIComponent(token)}`,
            },
          },
        ),
      );
      assert.equal(res.status, 200);
      const custBody = (await res.json()) as {
        thread: { messages: { body: string }[] };
      };
      assert.ok(
        custBody.thread.messages.some((m) => m.body.includes("Hello customer")),
      );

      await saveChatSnapshot({
        threadId: threadCust,
        customerUserId: customerUser.id,
        title: "Customer chat",
        messages: [
          { role: "user", body: "Need human", createdAt: now },
          { role: "user", body: "Customer reply", createdAt: now },
        ],
      });

      setOrbitAdminSessionTestOverride(async () => supportA);
      res = await postQueue(
        jsonRequest("http://localhost/api/orbit/beyond-master/support-queue", {
          method: "POST",
          json: {
            action: "message",
            threadId: threadCust,
            body: "Staff follow-up",
          },
        }),
      );
      assert.equal(res.status, 200);

      setOrbitAdminSessionTestOverride(async () => supportB);
      res = await postQueue(
        jsonRequest("http://localhost/api/orbit/beyond-master/support-queue", {
          method: "POST",
          json: {
            action: "message",
            threadId: threadCust,
            body: "Wrong staff",
          },
        }),
      );
      assert.equal(res.status, 400);
      assert.equal(
        ((await res.json()) as { error?: string }).error,
        "forbidden",
      );

      await prisma.beyondMasterChatThread.update({
        where: { id: threadCust },
        data: {
          supportQueueStatus: null,
          supportAssignedAdminId: null,
        },
      });
      const resumeCust = await saveChatSnapshot({
        threadId: threadCust,
        customerUserId: customerUser.id,
        title: "Customer chat",
        messages: [{ role: "user", body: "Resume AI", createdAt: now }],
      });
      assert.equal(resumeCust.saved, true);

      await prisma.beyondMasterChatThread.deleteMany({
        where: { id: { in: [threadGuest, threadCust] } },
      });
      await prisma.customerSession.deleteMany({
        where: { userId: customerUser.id },
      });
      await prisma.customerUser.delete({ where: { id: customerUser.id } });
      await prisma.adminUser.deleteMany({
        where: { id: { in: [fullAdmin.id, supportA.id, supportB.id] } },
      });
    });
  },
);
