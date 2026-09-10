import { NextRequest } from "next/server";

import { serveUploadFile } from "@/lib/orbit/serve-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params;
  return serveUploadFile(filename);
}
