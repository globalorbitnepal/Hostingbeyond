-- Beyond Master support tickets. Does not alter checkout, billing, domains, or Beyond AI tables.
CREATE TABLE "BeyondMasterTicketDraft" (
    "id" TEXT NOT NULL,
    "confirmationId" TEXT NOT NULL,
    "customerUserId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "domainName" TEXT,
    "domainId" TEXT,
    "serviceId" TEXT,
    "serviceLabel" TEXT,
    "handoff" BOOLEAN NOT NULL DEFAULT false,
    "contextNote" TEXT,
    "status" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ticketReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BeyondMasterTicketDraft_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BeyondMasterTicketSequence" (
    "id" TEXT NOT NULL,
    "nextNumber" INTEGER NOT NULL,
    CONSTRAINT "BeyondMasterTicketSequence_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BeyondMasterTicket" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "customerUserId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "domainName" TEXT,
    "domainId" TEXT,
    "serviceLabel" TEXT,
    "serviceId" TEXT,
    "assigneeId" TEXT,
    "handoff" BOOLEAN NOT NULL DEFAULT false,
    "contextNote" TEXT,
    "notification" JSONB NOT NULL DEFAULT '{}',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BeyondMasterTicket_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BeyondMasterTicketMessage" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorType" TEXT NOT NULL,
    "authorId" TEXT,
    "visibility" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BeyondMasterTicketMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BeyondMasterTicketAttachment" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BeyondMasterTicketAttachment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BeyondMasterTicketActivity" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BeyondMasterTicketActivity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BeyondMasterTicketDraft_confirmationId_key" ON "BeyondMasterTicketDraft"("confirmationId");
CREATE UNIQUE INDEX "BeyondMasterTicketDraft_idempotencyKey_key" ON "BeyondMasterTicketDraft"("idempotencyKey");
CREATE INDEX "BeyondMasterTicketDraft_customerUserId_status_idx" ON "BeyondMasterTicketDraft"("customerUserId", "status");
CREATE INDEX "BeyondMasterTicketDraft_expiresAt_idx" ON "BeyondMasterTicketDraft"("expiresAt");

CREATE UNIQUE INDEX "BeyondMasterTicket_reference_key" ON "BeyondMasterTicket"("reference");
CREATE UNIQUE INDEX "BeyondMasterTicket_idempotencyKey_key" ON "BeyondMasterTicket"("idempotencyKey");
CREATE INDEX "BeyondMasterTicket_customerUserId_status_idx" ON "BeyondMasterTicket"("customerUserId", "status");
CREATE INDEX "BeyondMasterTicket_status_updatedAt_idx" ON "BeyondMasterTicket"("status", "updatedAt");
CREATE INDEX "BeyondMasterTicket_assigneeId_idx" ON "BeyondMasterTicket"("assigneeId");
CREATE INDEX "BeyondMasterTicket_category_idx" ON "BeyondMasterTicket"("category");
CREATE INDEX "BeyondMasterTicket_priority_idx" ON "BeyondMasterTicket"("priority");

CREATE UNIQUE INDEX "BeyondMasterTicketMessage_publicId_key" ON "BeyondMasterTicketMessage"("publicId");
CREATE INDEX "BeyondMasterTicketMessage_ticketId_createdAt_idx" ON "BeyondMasterTicketMessage"("ticketId", "createdAt");
CREATE INDEX "BeyondMasterTicketMessage_visibility_idx" ON "BeyondMasterTicketMessage"("visibility");
CREATE INDEX "BeyondMasterTicketAttachment_ticketId_idx" ON "BeyondMasterTicketAttachment"("ticketId");
CREATE INDEX "BeyondMasterTicketActivity_ticketId_createdAt_idx" ON "BeyondMasterTicketActivity"("ticketId", "createdAt");
CREATE INDEX "BeyondMasterTicketActivity_action_idx" ON "BeyondMasterTicketActivity"("action");

ALTER TABLE "BeyondMasterTicketDraft" ADD CONSTRAINT "BeyondMasterTicketDraft_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES "CustomerUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BeyondMasterTicket" ADD CONSTRAINT "BeyondMasterTicket_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES "CustomerUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BeyondMasterTicket" ADD CONSTRAINT "BeyondMasterTicket_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BeyondMasterTicketMessage" ADD CONSTRAINT "BeyondMasterTicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "BeyondMasterTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BeyondMasterTicketAttachment" ADD CONSTRAINT "BeyondMasterTicketAttachment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "BeyondMasterTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BeyondMasterTicketActivity" ADD CONSTRAINT "BeyondMasterTicketActivity_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "BeyondMasterTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
