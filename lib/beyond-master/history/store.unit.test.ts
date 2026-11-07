import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ALLOWED_ATTACHMENT_TYPES,
  MAX_ATTACHMENT_BYTES,
  attachmentTypeAllowed,
  readChatAttachmentWhere,
  supportStaffThreadWhere,
} from "@/lib/beyond-master/history/store";

describe("beyond master chat attachments", () => {
  it("caps uploads at 5 MB", () => {
    assert.equal(MAX_ATTACHMENT_BYTES, 5 * 1024 * 1024);
  });

  it("accepts images, PDF, and plain text only", () => {
    assert.equal(attachmentTypeAllowed("image/png"), true);
    assert.equal(attachmentTypeAllowed("image/png; charset=binary"), true);
    assert.equal(attachmentTypeAllowed("application/pdf"), true);
    assert.equal(attachmentTypeAllowed("text/plain"), true);
    assert.equal(attachmentTypeAllowed("application/zip"), false);
    assert.equal(attachmentTypeAllowed("image/svg+xml"), false);
    assert.equal(ALLOWED_ATTACHMENT_TYPES.has("image/jpeg"), true);
  });

  it("readChatAttachmentWhere nests support staff scope on thread (Prisma relation filter)", () => {
    const staffId = "staff-a";
    const threadId = "thr-1";
    const attId = "att-1";
    const scope = supportStaffThreadWhere(staffId);
    assert.deepEqual(readChatAttachmentWhere(threadId, attId), {
      id: attId,
      threadId,
    });
    assert.deepEqual(
      readChatAttachmentWhere(threadId, attId, { supportStaffId: staffId }),
      {
        id: attId,
        threadId,
        thread: scope,
      },
    );
  });
});
