"use client";

import { prepareOrbitUpload } from "@/lib/orbit/prepare-orbit-upload";
import { readResponseError } from "@/lib/orbit/read-response-error";

const CHUNK_BYTES = 350_000;

type UploadJson = {
  error?: string;
  details?: string;
  pending?: boolean;
  asset?: { url: string };
};

async function postForm(form: FormData) {
  const res = await fetch("/api/orbit/media", { method: "POST", body: form });
  if (!res.ok) {
    const parsed = await readResponseError(res, "Upload failed");
    throw new Error(parsed.text);
  }
  return (await res.json()) as UploadJson;
}

/** Compress, then send in small parts so nginx never 413s. */
export async function uploadOrbitFile(file: File, alt: string) {
  const ready = await prepareOrbitUpload(file);
  const total = Math.max(1, Math.ceil(ready.size / CHUNK_BYTES));
  const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  let last: UploadJson | null = null;

  for (let index = 0; index < total; index += 1) {
    const part = ready.slice(index * CHUNK_BYTES, (index + 1) * CHUNK_BYTES);
    const form = new FormData();
    form.set("uploadId", uploadId);
    form.set("index", String(index));
    form.set("total", String(total));
    form.set("name", ready.name);
    form.set("type", ready.type);
    form.set("alt", alt);
    form.set("chunk", part, `part-${index}`);
    last = await postForm(form);
  }

  if (!last?.asset?.url) {
    throw new Error(last?.error || "Upload did not return an image URL.");
  }
  return last.asset.url;
}
