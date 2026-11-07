import "@/lib/test/integration-env-loader";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { describe, it } from "node:test";

import {
  addThreadAttachments,
  readGuestChatThread,
  saveChatSnapshot,
} from "@/lib/beyond-master/history/store";
import { prisma } from "@/lib/prisma";
import {
  assertIntegrationDatabaseTarget,
  shouldRunDatabaseIntegrationTests,
} from "@/lib/test/integration-gate";

/**
 * Guest capability-token boundaries against real PostgreSQL.
 *
 * A guest token is bound to one thread via `guestKey = hash(token)`. These tests
 * pin the cross-thread reuse cases that the unit-level helpers cannot prove.
 */
describe(
  "guest capability token isolation (integration DB)",
  { skip: !shouldRunDatabaseIntegrationTests(), concurrency: 1 },
  () => {
    it("binds a token to its own thread and rejects reuse on another", async () => {
      assertIntegrationDatabaseTarget();
      const stamp = randomUUID().slice(0, 8);
      const threadA = `gtok-a-${stamp}`;
      const threadB = `gtok-b-${stamp}`;
      const now = new Date().toISOString();

      const snapA = await saveChatSnapshot({
        threadId: threadA,
        customerUserId: null,
        title: "A",
        messages: [{ role: "user", body: "a", createdAt: now }],
      });
      assert.equal(snapA.saved, true);
      const tokA = snapA.guestCapabilityToken!;
      assert.ok(tokA.length >= 32);

      const snapB = await saveChatSnapshot({
        threadId: threadB,
        customerUserId: null,
        title: "B",
        messages: [{ role: "user", body: "b", createdAt: now }],
      });
      assert.equal(snapB.saved, true);
      const tokB = snapB.guestCapabilityToken!;
      assert.notEqual(tokA, tokB, "each guest thread gets a distinct token");

      // Own token reads own thread.
      assert.ok(await readGuestChatThread(threadA, tokA));
      assert.ok(await readGuestChatThread(threadB, tokB));

      // Cross-thread token reuse must fail (no data, no existence disclosure).
      assert.equal(await readGuestChatThread(threadB, tokA), null);
      assert.equal(await readGuestChatThread(threadA, tokB), null);

      // Overwriting thread A with thread B's token must be refused.
      const hijack = await saveChatSnapshot({
        threadId: threadA,
        customerUserId: null,
        title: "hijack",
        messages: [{ role: "user", body: "pwned", createdAt: now }],
        guestCapabilityToken: tokB,
      });
      assert.equal(hijack.saved, false);
      assert.equal(hijack.reason, "forbidden");

      await prisma.beyondMasterChatThread.deleteMany({
        where: { id: { in: [threadA, threadB] } },
      });
    });

    it("rejects a forged token that never belonged to any thread", async () => {
      assertIntegrationDatabaseTarget();
      const stamp = randomUUID().slice(0, 8);
      const threadId = `gtok-f-${stamp}`;
      const now = new Date().toISOString();

      const snap = await saveChatSnapshot({
        threadId,
        customerUserId: null,
        title: "F",
        messages: [{ role: "user", body: "f", createdAt: now }],
      });
      assert.equal(snap.saved, true);

      const forged = "A".repeat(43);
      assert.equal(await readGuestChatThread(threadId, forged), null);

      const upload = await addThreadAttachments({
        threadId,
        customerUserId: null,
        title: "F",
        files: [
          {
            fileName: "x.txt",
            contentType: "text/plain",
            data: Buffer.from("x"),
          },
        ],
        guestCapabilityToken: forged,
      });
      assert.equal(
        upload.saved,
        0,
        "forged token cannot attach to a guest thread",
      );

      await prisma.beyondMasterChatThread.deleteMany({
        where: { id: threadId },
      });
    });

    it("never exposes a customer thread through the guest read path", async () => {
      assertIntegrationDatabaseTarget();
      const stamp = randomUUID().slice(0, 8);
      const user = await prisma.customerUser.create({
        data: { email: `gtok-cust-${stamp}@example.test` },
      });
      const threadId = `gtok-c-${stamp}`;
      await saveChatSnapshot({
        threadId,
        customerUserId: user.id,
        title: "C",
        messages: [
          {
            role: "user",
            body: "private",
            createdAt: new Date().toISOString(),
          },
        ],
      });

      const anyToken = "B".repeat(43);
      assert.equal(await readGuestChatThread(threadId, anyToken), null);

      await prisma.beyondMasterChatThread.deleteMany({
        where: { id: threadId },
      });
      await prisma.customerUser.deleteMany({ where: { id: user.id } });
    });
  },
);
