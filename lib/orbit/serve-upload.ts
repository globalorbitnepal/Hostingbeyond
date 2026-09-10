import { NextResponse } from "next/server";

import { readUploadFile, safeUploadFilename } from "@/lib/orbit/uploads";

export async function serveUploadFile(filename: string) {
  const safe = safeUploadFilename(filename);
  if (!safe) {
    return new NextResponse("Not found", { status: 404 });
  }

  const file = await readUploadFile(safe);
  if (!file) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
