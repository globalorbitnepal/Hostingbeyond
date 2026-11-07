import "@/lib/test/integration-env-loader";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { afterEach, describe, it } from "node:test";

import type { CustomerUser } from "@prisma/client";

import {
  addThreadAttachments,
  saveChatSnapshot,
} from "@/lib/beyond-master/history/store";
import { enqueueThreadForHumanSupport } from "@/lib/beyond-master/human-support";
import { prisma } from "@/lib/prisma";
import {
  createCustomerSession,
  CUSTOMER_SESSION_COOKIE,
} from "@/lib/customer/session";
import { setOrbitAdminSessionTestOverride } from "@/lib/test/orbit-admin-session-test-control";
import {
  assertIntegrationDatabaseTarget,
  shouldRunDatabaseIntegrationTests,
} from "@/lib/test/integration-gate";

describe(
  "Orbit conversations attachment authorization (HTTP integration)",
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

    it("enforces staff vs customer vs guest rules for attachment bytes and listing", async () => {
      assertIntegrationDatabaseTarget();
      delete process.env.ORBIT_LEGACY_OPEN_ORBIT;

      const fullAdmin = await prisma.adminUser.create({
        data: { displayName: `att-full-${randomUUID().slice(0, 8)}` },
      });
      const supportOk = await prisma.adminUser.create({
        data: { displayName: `att-sok-${randomUUID().slice(0, 8)}` },
      });
      const supportOther = await prisma.adminUser.create({
        data: { displayName: `att-sbad-${randomUUID().slice(0, 8)}` },
      });
      process.env.ORBIT_FULL_ADMIN_IDS = fullAdmin.id;
      process.env.ORBIT_SUPPORT_STAFF_IDS = `${supportOk.id},${supportOther.id}`;

      const customerA: CustomerUser = await prisma.customerUser.create({
        data: { email: `att-a-${randomUUID()}@hostingbeyond.local` },
      });
      const customerB: CustomerUser = await prisma.customerUser.create({
        data: { email: `att-b-${randomUUID()}@hostingbeyond.local` },
      });

      const threadA = `att-th-a-${randomUUID().slice(0, 8)}`;
      const threadB = `att-th-b-${randomUUID().slice(0, 8)}`;
      const now = new Date().toISOString();

      await saveChatSnapshot({
        threadId: threadA,
        customerUserId: customerA.id,
        title: "A",
        messages: [{ role: "user", body: "hi", createdAt: now }],
      });
      const guestSnap = await saveChatSnapshot({
        threadId: threadB,
        customerUserId: null,
        title: "Guest",
        messages: [{ role: "user", body: "g", createdAt: now }],
      });
      const guestTok = guestSnap.guestCapabilityToken!;
      assert.ok(guestTok.length >= 32);

      const upA = await addThreadAttachments({
        threadId: threadA,
        customerUserId: customerA.id,
        title: "A",
        files: [
          {
            fileName: "secret-a.txt",
            contentType: "text/plain",
            data: Buffer.from("customer-a-bytes"),
          },
        ],
      });
      assert.equal(upA.saved, 1);
      const attA = upA.files[0]!.id;

      const upGuest = await addThreadAttachments({
        threadId: threadB,
        customerUserId: null,
        title: "Guest",
        files: [
          {
            fileName: "guest.txt",
            contentType: "text/plain",
            data: Buffer.from("guest-bytes"),
          },
        ],
        guestCapabilityToken: guestTok,
      });
      assert.equal(upGuest.saved, 1);
      assert.ok(upGuest.files[0]?.id);

      await enqueueThreadForHumanSupport({
        threadId: threadA,
        customerUserId: customerA.id,
        ticketReference: null,
      });
      setOrbitAdminSessionTestOverride(async () => fullAdmin);
      const { POST: postQueue } =
        await import("@/app/api/orbit/beyond-master/support-queue/route");
      let res = await postQueue(
        new Request("http://localhost/api/orbit/beyond-master/support-queue", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "assign", threadId: threadA }),
        }),
      );
      assert.equal(res.status, 200, await res.text());

      res = await postQueue(
        new Request("http://localhost/api/orbit/beyond-master/support-queue", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "reassign",
            threadId: threadA,
            toAdminUserId: supportOk.id,
          }),
        }),
      );
      assert.equal(res.status, 200, await res.text());

      const { GET: getConversations } =
        await import("@/app/api/orbit/beyond-master/conversations/route");

      // Authorized assigned support can fetch bytes
      setOrbitAdminSessionTestOverride(async () => supportOk);
      res = await getConversations(
        new Request(
          `http://localhost/api/orbit/beyond-master/conversations?thread=${encodeURIComponent(threadA)}&attachment=${encodeURIComponent(attA)}`,
        ),
      );
      assert.equal(res.status, 200);
      assert.equal(res.headers.get("content-type"), "text/plain");
      assert.equal(await res.text(), "customer-a-bytes");

      // Thread JSON includes attachment metadata for authorized staff
      res = await getConversations(
        new Request(
          `http://localhost/api/orbit/beyond-master/conversations?id=${encodeURIComponent(threadA)}`,
        ),
      );
      assert.equal(res.status, 200);
      const threadJson = (await res.json()) as {
        thread: { attachments: { id: string }[] };
      };
      assert.ok(threadJson.thread.attachments.some((a) => a.id === attA));

      // Wrong support staff (not assignee, not unclaimed open for this thread)
      setOrbitAdminSessionTestOverride(async () => supportOther);
      res = await getConversations(
        new Request(
          `http://localhost/api/orbit/beyond-master/conversations?thread=${encodeURIComponent(threadA)}&attachment=${encodeURIComponent(attA)}`,
        ),
      );
      assert.equal(res.status, 404);

      // Customer B cannot use customer route to read A's attachment bytes (no such route); customer A can load thread but not raw file via Orbit
      const { token: tokenB } = await createCustomerSession(customerB.id);
      // Drop the Orbit staff override so this exercises the unauthenticated path:
      // a customer JWT cookie is not an Orbit session, so the Orbit route must 401.
      setOrbitAdminSessionTestOverride(async () => null);
      res = await getConversations(
        new Request(
          `http://localhost/api/orbit/beyond-master/conversations?thread=${encodeURIComponent(threadA)}&attachment=${encodeURIComponent(attA)}`,
          {
            headers: {
              cookie: `${CUSTOMER_SESSION_COOKIE}=${encodeURIComponent(tokenB)}`,
            },
          },
        ),
      );
      assert.equal(res.status, 401);

      // Guest with wrong capability cannot upload or later read via staff API
      const badGuest = await addThreadAttachments({
        threadId: threadB,
        customerUserId: null,
        title: "Guest",
        files: [
          {
            fileName: "bad.txt",
            contentType: "text/plain",
            data: Buffer.from("x"),
          },
        ],
        guestCapabilityToken: "00000000000000000000000000000000",
      });
      assert.equal(badGuest.saved, 0);

      // Orbit session override is re-established for the remaining staff checks.
      setOrbitAdminSessionTestOverride(async () => supportOk);

      res = await getConversations(
        new Request(
          `http://localhost/api/orbit/beyond-master/conversations?thread=${encodeURIComponent(threadA)}`,
        ),
      );
      assert.equal(res.status, 200);
      assert.equal((await res.json()).threads !== undefined, true);

      // Deleted attachment row -> no bytes or metadata via this route
      await prisma.beyondMasterChatAttachment.delete({ where: { id: attA } });
      res = await getConversations(
        new Request(
          `http://localhost/api/orbit/beyond-master/conversations?thread=${encodeURIComponent(threadA)}&attachment=${encodeURIComponent(attA)}`,
        ),
      );
      assert.equal(res.status, 404);

      // Re-insert attachment for remaining checks (same id not possible — use new upload)
      const upA2 = await addThreadAttachments({
        threadId: threadA,
        customerUserId: customerA.id,
        title: "A",
        files: [
          {
            fileName: "secret-a-2.txt",
            contentType: "text/plain",
            data: Buffer.from("customer-a-bytes-2"),
          },
        ],
      });
      assert.equal(upA2.saved, 1);
      const attA2 = upA2.files[0]!.id;

      // Invalid attachment id (well-formed cuid shape but nonexistent)
      res = await getConversations(
        new Request(
          `http://localhost/api/orbit/beyond-master/conversations?thread=${encodeURIComponent(threadA)}&attachment=clxxxxxxxxxxxxxxxxxxxxxxxx`,
        ),
      );
      assert.equal(res.status, 404);

      // Foreign thread: real attachment id with another thread id
      res = await getConversations(
        new Request(
          `http://localhost/api/orbit/beyond-master/conversations?thread=${encodeURIComponent(threadB)}&attachment=${encodeURIComponent(attA2)}`,
        ),
      );
      assert.equal(res.status, 404);

      // Path / storage manipulation: thread id escaping valid pattern — request rejected at store layer -> 404
      res = await getConversations(
        new Request(
          "http://localhost/api/orbit/beyond-master/conversations?thread=../evil&attachment=" +
            encodeURIComponent(attA2),
        ),
      );
      assert.equal(res.status, 404);

      await prisma.beyondMasterChatThread.deleteMany({
        where: { id: { in: [threadA, threadB] } },
      });
      await prisma.customerSession.deleteMany({
        where: { userId: { in: [customerA.id, customerB.id] } },
      });
      await prisma.customerUser.deleteMany({
        where: { id: { in: [customerA.id, customerB.id] } },
      });
      await prisma.adminUser.deleteMany({
        where: { id: { in: [fullAdmin.id, supportOk.id, supportOther.id] } },
      });
    });
  },
);
