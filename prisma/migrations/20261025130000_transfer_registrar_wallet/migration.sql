-- Transfer registrar binding + wallet link (dev/integration — not production until approved)

ALTER TABLE "DomainTransferRecord" ADD COLUMN IF NOT EXISTS "registrarProvider" TEXT;
ALTER TABLE "DomainTransferRecord" ADD COLUMN IF NOT EXISTS "walletTransactionId" TEXT;
