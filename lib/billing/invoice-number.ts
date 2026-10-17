import type { Prisma } from "@prisma/client";

const PAD = 6;

export function formatInvoiceNumber(year: number, sequence: number): string {
  const seq = String(sequence).padStart(PAD, "0");
  return `INV-${year}-${seq}`;
}

export function formatCreditNoteNumber(year: number, sequence: number): string {
  const seq = String(sequence).padStart(PAD, "0");
  return `CN-${year}-${seq}`;
}

/** Atomically allocate the next invoice number for the current UTC year. */
export async function allocateInvoiceNumber(
  tx: Prisma.TransactionClient,
  now = new Date(),
): Promise<string> {
  const year = now.getUTCFullYear();
  const row = await tx.invoiceSequence.upsert({
    where: { year },
    create: { year, lastValue: 1 },
    update: { lastValue: { increment: 1 } },
  });
  const value = row.lastValue;
  return formatInvoiceNumber(year, value);
}

export async function allocateCreditNoteNumber(
  tx: Prisma.TransactionClient,
  now = new Date(),
): Promise<string> {
  const year = now.getUTCFullYear();
  const key = year + 100_000;
  const row = await tx.invoiceSequence.upsert({
    where: { year: key },
    create: { year: key, lastValue: 1 },
    update: { lastValue: { increment: 1 } },
  });
  return formatCreditNoteNumber(year, row.lastValue);
}
