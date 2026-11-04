-- Agent conversation history and 5 MB customer attachments.
-- Does not alter Beyond AI, tickets, DNS, or billing tables.
CREATE TABLE "BeyondMasterChatThread" (
    "id" TEXT NOT NULL,
    "customerUserId" TEXT,
    "guestKey" TEXT,
    "title" TEXT NOT NULL DEFAULT 'New conversation',
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeyondMasterChatThread_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BeyondMasterChatMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeyondMasterChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BeyondMasterChatAttachment" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeyondMasterChatAttachment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BeyondMasterChatThread_customerUserId_updatedAt_idx" ON "BeyondMasterChatThread"("customerUserId", "updatedAt");
CREATE INDEX "BeyondMasterChatThread_updatedAt_idx" ON "BeyondMasterChatThread"("updatedAt");
CREATE INDEX "BeyondMasterChatMessage_threadId_createdAt_idx" ON "BeyondMasterChatMessage"("threadId", "createdAt");
CREATE INDEX "BeyondMasterChatAttachment_threadId_idx" ON "BeyondMasterChatAttachment"("threadId");

ALTER TABLE "BeyondMasterChatThread" ADD CONSTRAINT "BeyondMasterChatThread_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES "CustomerUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BeyondMasterChatMessage" ADD CONSTRAINT "BeyondMasterChatMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "BeyondMasterChatThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BeyondMasterChatAttachment" ADD CONSTRAINT "BeyondMasterChatAttachment_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "BeyondMasterChatThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
