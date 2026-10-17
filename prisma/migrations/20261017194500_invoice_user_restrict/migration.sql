-- Preserve invoice and credit-note history when customer rows exist.
-- Reversible: restore ON DELETE CASCADE if policy changes (not recommended).

ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_userId_fkey";

ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CustomerUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CreditNote" DROP CONSTRAINT "CreditNote_userId_fkey";

ALTER TABLE "CreditNote" ADD CONSTRAINT "CreditNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CustomerUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
