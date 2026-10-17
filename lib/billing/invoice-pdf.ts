import type { Invoice, InvoiceLineItem } from "@prisma/client";

import { decimal } from "@/lib/billing/money";

export type InvoicePdfInput = {
  invoice: Pick<
    Invoice,
    | "invoiceNumber"
    | "currency"
    | "subtotal"
    | "discount"
    | "tax"
    | "total"
    | "taxTreatment"
    | "taxRatePercent"
    | "issuedAt"
  >;
  lineItems: Pick<
    InvoiceLineItem,
    "description" | "quantity" | "unitAmount" | "lineTotal"
  >[];
};

function escapePdfText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function formatMoney(
  value: string | number | import("@prisma/client").Prisma.Decimal,
  currency: string,
): string {
  return `${decimal(value).toFixed(2)} ${currency}`;
}

/**
 * Minimal PDF 1.4 (no external library). Suitable for invoice text layout.
 */
export function buildMinimalInvoicePdf(input: InvoicePdfInput): Buffer {
  const lines: string[] = [];
  lines.push("HostingBeyond — Invoice");
  lines.push(`Invoice: ${input.invoice.invoiceNumber}`);
  if (input.invoice.issuedAt) {
    lines.push(`Issued: ${input.invoice.issuedAt.toISOString().slice(0, 10)}`);
  }
  lines.push("");
  for (const item of input.lineItems) {
    lines.push(
      `${item.description} x${decimal(item.quantity).toFixed(0)} — ${formatMoney(item.lineTotal, input.invoice.currency)}`,
    );
  }
  lines.push("");
  lines.push(
    `Subtotal: ${formatMoney(input.invoice.subtotal, input.invoice.currency)}`,
  );
  if (decimal(input.invoice.discount).greaterThan(0)) {
    lines.push(
      `Discount: -${formatMoney(input.invoice.discount, input.invoice.currency)}`,
    );
  }
  lines.push(`Tax: ${formatMoney(input.invoice.tax, input.invoice.currency)}`);
  if (
    input.invoice.taxTreatment === "VAT_INCLUSIVE" &&
    input.invoice.taxRatePercent
  ) {
    lines.push(
      `(VAT inclusive ${decimal(input.invoice.taxRatePercent).toFixed(2)}% reverse-calculated)`,
    );
  }
  lines.push(
    `Total: ${formatMoney(input.invoice.total, input.invoice.currency)}`,
  );
  lines.push("");
  lines.push("Tax registration and legal footer: pending owner configuration.");

  let y = 750;
  const contentLines = ["BT", "/F1 11 Tf", "50 750 Td"];
  for (const line of lines) {
    contentLines.push(`0 -14 Td (${escapePdfText(line)}) Tj`);
    y -= 14;
  }
  contentLines.push("ET");
  const stream = contentLines.join("\n");
  const streamLen = Buffer.byteLength(stream, "utf8");

  const objects = [
    "1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj",
    "2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj",
    "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj",
    `4 0 obj<< /Length ${streamLen} >>stream\n${stream}\nendstream endobj`,
    "5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${obj}\n`;
  }
  const xrefStart = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const off of offsets) {
    pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}
