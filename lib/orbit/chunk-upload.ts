import { mkdir, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";

const CHUNK_ROOT = path.join(os.tmpdir(), "orbit-upload-chunks");

export function isSafeUploadId(value: string) {
  return /^[a-zA-Z0-9-]{8,80}$/.test(value);
}

export async function saveOrbitChunk(input: {
  uploadId: string;
  index: number;
  total: number;
  chunk: Buffer;
}) {
  const { uploadId, index, total, chunk } = input;
  if (!isSafeUploadId(uploadId)) {
    throw new Error("Invalid upload session.");
  }
  if (
    !Number.isInteger(index) ||
    !Number.isInteger(total) ||
    index < 0 ||
    total < 1 ||
    total > 120 ||
    index >= total
  ) {
    throw new Error("Invalid upload chunk.");
  }
  const dir = path.join(CHUNK_ROOT, uploadId);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${index}.part`), chunk);

  if (index !== total - 1) return null;

  const parts: Buffer[] = [];
  for (let i = 0; i < total; i += 1) {
    parts.push(await readFile(path.join(dir, `${i}.part`)));
  }
  await rm(dir, { recursive: true, force: true });
  return Buffer.concat(parts);
}
