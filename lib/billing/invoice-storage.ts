import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const INVOICE_SUBDIR = "invoices-private";

function invoiceRoots(): string[] {
  const roots: string[] = [];
  const add = (dir: string | undefined) => {
    if (!dir?.trim()) return;
    roots.push(path.join(dir.trim(), INVOICE_SUBDIR));
  };
  add(process.env.INVOICE_STORAGE_DIR);
  add(process.env.ORBIT_UPLOAD_DIR);
  roots.push(path.join(process.cwd(), "data", INVOICE_SUBDIR));
  roots.push(path.join(os.homedir(), "hostingbeyond-invoices"));
  return roots;
}

export function resolveInvoiceStorageRoot(): string {
  return invoiceRoots()[0]!;
}

/** Safe storage key — no path segments from user input. */
export function invoicePdfStorageKey(invoiceId: string): string {
  const safe = invoiceId.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safe) throw new Error("invalid_invoice_id");
  return `${safe}.pdf`;
}

function resolvePdfPath(storageKey: string): string {
  const base = path.basename(storageKey);
  if (base !== storageKey || storageKey.includes("..")) {
    throw new Error("invalid_storage_key");
  }
  const root = resolveInvoiceStorageRoot();
  const resolved = path.resolve(root, base);
  if (!resolved.startsWith(path.resolve(root) + path.sep)) {
    throw new Error("path_traversal");
  }
  return resolved;
}

export async function writeInvoicePdf(
  storageKey: string,
  bytes: Buffer,
): Promise<{ sha256: string; storageKey: string }> {
  const filePath = resolvePdfPath(storageKey);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, bytes, { flag: "wx" }).catch(async (err) => {
    if ((err as NodeJS.ErrnoException).code === "EEXIST") {
      return;
    }
    throw err;
  });
  const onDisk = await readFile(filePath);
  const sha256 = createHash("sha256").update(onDisk).digest("hex");
  return { sha256, storageKey };
}

export async function readInvoicePdf(storageKey: string): Promise<Buffer> {
  const filePath = resolvePdfPath(storageKey);
  return readFile(filePath);
}
